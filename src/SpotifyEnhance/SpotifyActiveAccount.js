import ChangeEmitter from "@Utils/ChangeEmitter";
import SpotifyAccountStateDB from "./SpotifyAccountStateDB";
import SpotifyAPIWrapper from "./SpotifyAPIWrapper";
import { promiseHandler, nop } from "@Utils";

export default new (class SpotifyActiveAccount extends ChangeEmitter {
	constructor() {
		super();
		this.onSpotifyAccountStateDBChange = this.onSpotifyAccountStateDBChange.bind(this);
		this.onSpotifyAccountStateDBUpdate = this.onSpotifyAccountStateDBUpdate.bind(this);
	}

	async init() {
		this.activeAccount = undefined;
		SpotifyAccountStateDB.init();
		SpotifyAccountStateDB.on("CHANGE", this.onSpotifyAccountStateDBChange);
		SpotifyAccountStateDB.on("UPDATE", this.onSpotifyAccountStateDBUpdate);

		this.ensureSpotifyState();
	}

	dispose() {
		SpotifyAccountStateDB.off("CHANGE", this.onSpotifyAccountStateDBChange);
		SpotifyAccountStateDB.off("UPDATE", this.onSpotifyAccountStateDBUpdate);
		SpotifyAccountStateDB.dispose();
		clearTimeout(this.idleTimeoutId);
		delete this.activeAccount;
	}

	setToken(newActiveAccount) {
		SpotifyAPIWrapper.updateToken({
			accessToken: newActiveAccount?.accessToken,
			accountId: newActiveAccount?.id
		});
	}

	async ensureDeviceState(newActiveAccount) {
		if (!newActiveAccount) return;
		const [err, data] = await promiseHandler(SpotifyAPIWrapper.getDevices());
		if (err) return;
		newActiveAccount.setDevices(data.devices);
	}

	async fetchPlayerState(newActiveAccount) {
		if (!newActiveAccount) return;
		const [err, playerState] = await promiseHandler(SpotifyAPIWrapper.getPlayerState());
		if (err) return;
		newActiveAccount.setPlayerState(playerState);
	}

	async ensureSpotifyState() {
		const newActiveAccount = SpotifyAccountStateDB.getActiveAccount();
		if (!newActiveAccount) return this.notifyMaybe(newActiveAccount);
		this.setToken(newActiveAccount);
		await this.ensureDeviceState(newActiveAccount);
		if (newActiveAccount.isActive) await this.fetchPlayerState(newActiveAccount);

		this.notifyMaybe(newActiveAccount);
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

	onSpotifyAccountStateDBChange() {
		this.ensureSpotifyState();
	}

	notifyMaybe(newActiveAccount) {
		if (!this.isPlayerStateDifferent(newActiveAccount) && !this.isDeviceStateDifferent(newActiveAccount)) return;
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

		return ["trackId", "isPlaying", "progress", "shuffle", "volume", "repeat"].some(key => newPlayerState[key] !== playerState[key]);
	}

	isDeviceStateDifferent(newActiveAccount) {
		const { devices: newDevices } = newActiveAccount || {};
		const { devices } = this.activeAccount || {};

		return !!newDevices?.find(device => device.is_active) !== !!devices?.find(device => device.is_active);
	}
})();
