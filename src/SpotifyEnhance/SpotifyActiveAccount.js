import EventEmitter from "./EventEmitter";
import SpotifyAccountStateDB from "./SpotifyAccountStateDB";
import SpotifyAPI from "@Utils/SpotifyAPI";
import { nop } from "@Utils";

export default new (class SpotifyActiveAccount extends EventEmitter {
	constructor() {
		super();
		this.onSpotifyAccountStateDBChange = this.onSpotifyAccountStateDBChange.bind(this);
	}

	init() {
		this.activeAccount = undefined;
		SpotifyAccountStateDB.init();
		SpotifyAccountStateDB.on("CHANGE", this.onSpotifyAccountStateDBChange);

		for (const accountId in SpotifyAccountStateDB.accounts) {
			const account = SpotifyAccountStateDB.accounts[accountId];
			if (!account.devices.find(device => device.is_active)) continue;
			this.activeAccount = account;
			break;
		}

		if (!this.activeAccount) return;
		SpotifyAPI.token = this.activeAccount?.accessToken;
		SpotifyAPI.accountId = this.activeAccount?.id;
		this.fetchPlayerState();
	}

	dispose() {
		SpotifyAccountStateDB.off("CHANGE", this.onSpotifyAccountStateDBChange);
		SpotifyAccountStateDB.dispose();
		delete this.activeAccount;
	}

	updateToken(token) {
		SpotifyAPI.token = token;
	}

	fetchPlayerState() {
		console.trace("fetchPlayerState");
		return Promise.resolve(0);
		// SpotifyAPI.getPlayerState()
		// 	.then(playerState => {
		// 		this.activeAccount.playerState = playerState;
		// 	}).catch(nop);
	}

	onSpotifyAccountStateDBChange() {
		const newActiveAccount = SpotifyAccountStateDB.getActiveAccount();

		if ((!newActiveAccount && !this.activeAccount) || newActiveAccount?.id !== this.activeAccount?.id) this.changeActiveAccount(newActiveAccount);
		else this.updateActiveAccount(newActiveAccount);
	}

	async changeActiveAccount(newActiveAccount) {
		this.activeAccount = newActiveAccount;
		SpotifyAPI.token = this.activeAccount?.accessToken;
		SpotifyAPI.accountId = this.activeAccount?.id;
		if (this.activeAccount && !this.activeAccount.playerState) {
			const data = await this.fetchPlayerState();
		}

		this.emit("BOTH");
	}

	updateActiveAccount(newActiveAccount) {
		const isPlayerDifferent = this.isPlayerDifferent(newActiveAccount);
		const isDeviceDifferent = this.isDeviceDifferent(newActiveAccount);

		this.activeAccount = newActiveAccount;

		if (isPlayerDifferent && isDeviceDifferent) return this.emit("BOTH");
		if (isPlayerDifferent) return this.emit("PLAYER");
		if (isDeviceDifferent) return this.emit("DEVICE");
	}

	isPlayerDifferent(newActiveAccount) {
		const { playerState: newPlayerState } = newActiveAccount;
		const { playerState } = this.activeAccount;

		if (newPlayerState === playerState) return;
		if (newPlayerState?.item?.id === playerState?.item?.id) return;
		if (newPlayerState?.device?.volume_percent === playerState?.device?.volume_percent) return;

		return ["shuffle_state", "repeat_state", "progress_ms", "is_playing"].some(key => newPlayerState[key] !== playerState[key]);
	}

	isDeviceDifferent(newActiveAccount) {
		const { devices: newDevices } = newActiveAccount;
		const { devices } = this.activeAccount;

		return !!devices.find(device => device.is_active) !== !!newDevices.find(device => device.is_active);
	}
})();
