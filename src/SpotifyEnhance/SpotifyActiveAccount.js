import ChangeEmitter from "@Utils/ChangeEmitter";
import SpotifyAPIWrapper from "./SpotifyAPIWrapper";
import { promiseHandler } from "@Utils";
import SpotifySocketListener from "./SpotifySocketListener";
import SpotifyConnectionsListener from "./SpotifyConnectionsListener";
import SpotifyStore from "@Stores/SpotifyStore";
import SpotifyAccount from "./SpotifyAccount";

export default new (class SpotifyActiveAccount extends ChangeEmitter {
	constructor() {
		super();
		this.onSocketEvent = this.onSocketEvent.bind(this);
		this.onSpotifyStoreChange = this.onSpotifyStoreChange.bind(this);
		this.onSpotifyAccountChanged = this.onSpotifyAccountChanged.bind(this);
	}

	async init() {
		this.activeAccount = undefined;

		SpotifySocketListener.init();
		SpotifyConnectionsListener.init();
		SpotifySocketListener.on(this.onSocketEvent);
		SpotifyConnectionsListener.on(this.onSpotifyAccountChanged);
		SpotifyStore.addChangeListener(this.onSpotifyStoreChange);

		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (!socket) return;

		this.activeAccount = new SpotifyAccount(socket);
		this.setToken();
		await this.ensureDeviceState();
		if (this.activeAccount.isActive) await this.fetchPlayerState();
		this.emit();
	}

	dispose() {
		SpotifyStore.removeChangeListener(this.onSpotifyStoreChange);
		SpotifySocketListener.off(this.onSocketEvent);
		SpotifyConnectionsListener.off(this.onSpotifyAccountChanged);
		SpotifySocketListener.dispose();
		SpotifyConnectionsListener.dispose();
		clearTimeout(this.idleTimeoutId);
		delete this.activeAccount;
	}

	onSpotifyAccountChanged() {
		if (!this.activeAccount) return;
		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (socket) return;
		this.activeAccount = undefined;
		this.setToken();
		this.emit();
	}

	async onSpotifyStoreChange() {
		if (this.activeAccount) return;
		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (!socket) return;

		this.activeAccount = new SpotifyAccount(socket);
		this.setToken();
		await this.fetchPlayerState();
		this.emit();
	}

	onSocketEvent({ socket, event }) {
		if (socket.accountId !== this.activeAccount?.id) return;

		switch (event.type) {
			case "PLAYER_STATE_CHANGED":
				this.activeAccount.setPlayerState(event.event.state);
				break;
			case "DEVICE_STATE_CHANGED":
				this.activeAccount.setDevices(event.event.devices);
				break;
		}
		if (!this.activeAccount?.isActive) this.activeAccount = undefined;
		this.emit();
	}

	setToken() {
		SpotifyAPIWrapper.updateToken(this.activeAccount?.socket || {});
	}

	async ensureDeviceState() {
		const [err, data] = await promiseHandler(SpotifyAPIWrapper.getDevices());
		if (err) return;
		this.activeAccount.setDevices(data.devices);
	}

	async fetchPlayerState() {
		const [err, playerState] = await promiseHandler(SpotifyAPIWrapper.getPlayerState());
		if (err) return;
		this.activeAccount.setPlayerState(playerState);
	}

	getActiveAccount() {
		return this.activeAccount;
	}
})();

// determinActiveAccount() {
// 	for (const accountId in this.accounts) {
// 		const account = this.accounts[accountId];
// 		if (!account?.isActive) continue;
// 		return account;
// 	}
// }

// updateActiveAccount() {
// 	const newActiveAccount = this.determinActiveAccount();
// 	if (newActiveAccount?.id === this.activeAccount?.id) return;

// 	this.ensureSpotifyState(newActiveAccount);
// }

// async ensureSpotifyState() {
// 	// if (!newActiveAccount) {
// 	// 	this.activeAccount = undefined;
// 	// 	return this.emit();
// 	// }

// 	this.setToken();

// 	await this.ensureDeviceState();
// 	if (this.activeAccount.isActive) await this.fetchPlayerState();

// 	// this.activeAccount = newActiveAccount;
// 	// this.checkActivityInterval();
// 	this.emit();
// }

// checkActivityInterval() {
// 	if (!this.activeAccount?.playerState && this.idleTimeoutId) {
// 		console.log("Clear Idle Timeout");
// 		clearTimeout(this.idleTimeoutId);
// 		this.idleTimeoutId = null;
// 		return;
// 	}

// 	if (!this.activeAccount?.playerState) return;

// 	const { isPlaying } = this.activeAccount.playerState;

// 	if (isPlaying && this.idleTimeoutId) {
// 		console.log("Clear Idle Timeout");
// 		clearTimeout(this.idleTimeoutId);
// 		this.idleTimeoutId = null;
// 		return;
// 	}

// 	if (!isPlaying && this.idleTimeoutId) return;

// 	if (!isPlaying) {
// 		console.log("Start Idle Timeout");
// 		this.idleTimeoutId = setTimeout(
// 			() => {
// 				clearTimeout(this.idleTimeoutId);
// 				this.idleTimeoutId = null;
// 				this.activeAccount.setDevices([]);
// 				console.log("Idle Timeout HIT");
// 				this.emit();
// 			},
// 			30 * 60 * 1000
// 		);
// 	}
// }

// isPlayerStateDifferent(newActiveAccount) {
// 	const { playerState: newPlayerState } = newActiveAccount || {};
// 	const { playerState } = this.activeAccount || {};

// 	if (!playerState && !newActiveAccount) return false;
// 	if (!newPlayerState || !playerState) return true;

// 	return ["trackId", "isPlaying", "progress", "shuffle", "volume", "repeat"].some(key => newPlayerState[key] !== playerState[key]);
// }

// isDeviceStateDifferent(newActiveAccount) {
// 	const { devices: newDevices } = newActiveAccount || {};
// 	const { devices } = this.activeAccount || {};

// 	return !!newDevices?.find(device => device.is_active) !== !!devices?.find(device => device.is_active);
// }
