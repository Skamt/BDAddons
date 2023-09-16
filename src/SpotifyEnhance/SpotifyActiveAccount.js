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
		this.updateToken();
		this.fetchPlayerState();
	}

	dispose() {
		SpotifyAccountStateDB.off("CHANGE", this.onSpotifyAccountStateDBChange);
		SpotifyAccountStateDB.dispose();
		delete this.activeAccount;
	}

	updateToken() {
		SpotifyAPI.token = this.activeAccount?.accessToken;
		SpotifyAPI.accountId = this.activeAccount?.id;
	}

	update(newActiveAccount) {
		this.activeAccount = newActiveAccount;
		this.updateToken();
		if(!this.activeAccount) return;
		if(!this.activeAccount.playerState) this.fetchPlayerState();
		
	}

	fetchPlayerState() {
		console.trace("fetchPlayerState");
		// SpotifyAPI.getPlayerState()
		// 	.then(playerState => {
		// 		this.activeAccount.playerState = playerState;
		// 	}).catch(nop);
	}

	onSpotifyAccountStateDBChange() {
		let newActiveAccount = undefined;

		for (const accountId in SpotifyAccountStateDB.accounts) {
			const account = SpotifyAccountStateDB.accounts[accountId];
			if (!account.devices.find(device => device.is_active)) continue;
			newActiveAccount = account;
			break;
		}

		const [account, player, device] = this.compareActiveAccount(newActiveAccount, this.activeAccount);
		if (!account && !player && !device) return;

		if (account) this.update(newActiveAccount);
		else this.activeAccount = newActiveAccount;

		if (account || (player && device)) return this.emit("BOTH");
		if (player) return this.emit("PLAYER");
		if (device) return this.emit("DEVICE");
	}

	comparePlayerState(a, b) {
		if (a === b) return true;
		if (!b) return;
		if (!a) return;
		if (a?.item?.id !== b?.item?.id) return;
		if (a?.device?.volume_percent !== b?.device?.volume_percent) return;
		return !["shuffle_state", "repeat_state", "progress_ms", "is_playing"].some(key => a[key] !== b[key]);
	}

	compareDeviceState(a, b) {
		return !!a.find(device => device.is_active) === !!b.find(device => device.is_active);
	}

	compareActiveAccount(a, b) {
		let player, device;
		if (!a && !b) return [false, false, false];
		if ((a && !b) || (!a && b) || a.id !== b.id) return [true];

		if (this.comparePlayerState(a.playerState, b.playerState)) player = true;
		if (this.compareDeviceState(a.devices, b.devices)) device = true;

		return [false, player, device];
	}
})();
