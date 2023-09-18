import ChangeEmitter from "@Utils/ChangeEmitter";
import SpotifyAccountStateDB from "./SpotifyAccountStateDB";
import SpotifyAPI from "@Utils/SpotifyAPI";
import { nop } from "@Utils";

export default new (class SpotifyActiveAccount extends ChangeEmitter {
	constructor() {
		super();
		this.onSpotifyAccountStateDBChange = this.onSpotifyAccountStateDBChange.bind(this);
		this.onSpotifyAccountStateDBUpdate = this.onSpotifyAccountStateDBUpdate.bind(this);
	}

	init() {
		this.activeAccount = undefined;
		SpotifyAccountStateDB.init();
		SpotifyAccountStateDB.on("CHANGE", this.onSpotifyAccountStateDBChange);
		SpotifyAccountStateDB.on("UPDATE", this.onSpotifyAccountStateDBUpdate);

		this.activeAccount = SpotifyAccountStateDB.getActiveAccount();

		if (!this.activeAccount) return;
		SpotifyAPI.token = this.activeAccount?.accessToken;
		SpotifyAPI.accountId = this.activeAccount?.id;
		this.fetchPlayerState();
	}

	dispose() {
		SpotifyAccountStateDB.off("CHANGE", this.onSpotifyAccountStateDBChange);
		SpotifyAccountStateDB.off("UPDATE", this.onSpotifyAccountStateDBUpdate);
		SpotifyAccountStateDB.dispose();
		clearTimeout(this.idleTimeoutId);
		delete this.activeAccount;
	}

	updateToken(token) {
		SpotifyAPI.token = token;
		this.activeAccount.accessToken = token;
	}

	fetchPlayerState() {
		console.trace("fetchPlayerState");
		return Promise.resolve(0);
		// SpotifyAPI.getPlayerState()
		// 	.then(playerState => {
		// 		this.activeAccount.playerState = playerState;
		// 	}).catch(nop);
	}

	checkActivityInterval() {
		if (!this.activeAccount?.playerState) return;
		const { isPlaying } = this.activeAccount;
		if (isPlaying && this.idleTimeoutId) {
			clearTimeout(this.idleTimeoutId);
			this.idleTimeoutId = null;
		} else if (!isPlaying && this.idleTimeoutId) return;
		else if (!isPlaying)
			this.idleTimeoutId = setTimeout(
				() => {
					clearTimeout(this.idleTimeoutId);
					this.idleTimeoutId = null;
					this.activeAccount.setDevices([]);
					console.log("Idle Timeout HIT");
					this.emit();
				},
				30 * 60 * 1000
			);
	}

	async onSpotifyAccountStateDBChange() {
		const newActiveAccount = SpotifyAccountStateDB.getActiveAccount();

		SpotifyAPI.token = newActiveAccount?.accessToken;
		SpotifyAPI.accountId = newActiveAccount?.id;

		// if (newActiveAccount) {
		// 	const data = await this.fetchPlayerState();
		// }

		this.notifyMaybe(newActiveAccount);
	}

	notifyMaybe(newActiveAccount){
		if(!this.isPlayerStateDifferent(newActiveAccount) && !this.isDeviceStateDifferent(newActiveAccount)) return;
		this.activeAccount = newActiveAccount;
		this.emit();
	}

	async onSpotifyAccountStateDBUpdate() {
		const newActiveAccount = SpotifyAccountStateDB.getActiveAccount();
		this.notifyMaybe(newActiveAccount);
		this.checkActivityInterval();
	}

	isPlayerStateDifferent(newActiveAccount) {
		const { playerState: newPlayerState } = newActiveAccount || {};
		const { playerState } = this.activeAccount || {};

		if (!playerState && !newActiveAccount) return false;
		if (!newPlayerState || !playerState) return true;
		if (newPlayerState?.item?.id !== playerState?.item?.id) return true;
		if (newPlayerState?.device?.volume_percent !== playerState?.device?.volume_percent) return true;

		return ["shuffle_state", "repeat_state", "progress_ms", "is_playing"].some(key => newPlayerState[key] !== playerState[key]);
	}

	isDeviceStateDifferent(newActiveAccount) {
		const { devices: newDevices } = newActiveAccount || {};
		const { devices } = this.activeAccount || {};
		
		return !!newDevices?.find(device => device.is_active) !== !!devices?.find(device => device.is_active);
	}
})();
