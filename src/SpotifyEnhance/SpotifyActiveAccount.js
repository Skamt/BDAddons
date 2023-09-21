import ChangeEmitter from "@Utils/ChangeEmitter";
import SpotifyAPIWrapper from "./SpotifyAPIWrapper";
import { promiseHandler, nop } from "@Utils";

import SpotifyConnectionsListener from "./SpotifyConnectionsListener";
import SpotifySocketListener from "./SpotifySocketListener";
import SpotifyStore from "@Stores/SpotifyStore";
import SpotifyAccount from "./SpotifyAccount";

function getSpotifyAccountsAndDevices() {
	let result = [];

	const { accounts: sockets = {}, playerDevices: devices = {} } = SpotifyStore.__getLocalVars() || {};
	for (const accountId in sockets)
		result.push({
			socket: sockets[accountId],
			devices: devices[accountId]
		});

	return result;
}

export default new (class SpotifyActiveAccount extends ChangeEmitter {
	constructor() {
		super();
		this.onSpotifyAccountsChange = this.onSpotifyAccountsChange.bind(this);
		this.onSocketEvent = this.onSocketEvent.bind(this);
	}

	init() {
		this.activeAccount = undefined;
		this.accounts = {};

		SpotifyConnectionsListener.init();
		SpotifySocketListener.init();
		SpotifyConnectionsListener.on(this.onSpotifyAccountsChange);
		SpotifySocketListener.on(this.onSocketEvent);

		getSpotifyAccountsAndDevices().forEach(({ socket, devices = [] }) => {
			this.accounts[socket.accountId] = new SpotifyAccount({ socket, devices });
		});

		this.updateActiveAccount();
	}

	dispose() {
		SpotifyConnectionsListener.off(this.onSpotifyAccountsChange);
		SpotifySocketListener.off(this.onSocketEvent);
		SpotifyConnectionsListener.dispose();
		SpotifySocketListener.dispose();
		clearTimeout(this.idleTimeoutId);
		delete this.accounts;
		delete this.activeAccount;
	}

	onSpotifyAccountsChange() {
		const temp = {};
		getSpotifyAccountsAndDevices().forEach(({ socket, devices = [] }) => {
			const { accountId } = socket;
			temp[accountId] = this.accounts[accountId] ? this.accounts[accountId] : new SpotifyAccount({ socket, devices });
		});
		this.accounts = temp;

		this.updateActiveAccount();
	}

	onSocketEvent({ socket, event }) {
		switch (event.type) {
			case "PLAYER_STATE_CHANGED":
				this.playerStateChange(socket, event.event);
				break;
			case "DEVICE_STATE_CHANGED":
				this.deviceStateChange(socket, event.event);
				break;
		}

		if (this.activeAccount && socket.accountId !== this.activeAccount?.id) return;

		if (this.activeAccount?.isActive) {
			this.checkActivityInterval();
			return this.emit();
		}

		this.updateActiveAccount();
	}

	playerStateChange(socket, { state }) {
		const target = this.accounts[socket.accountId];
		if (!target) return;
		target.setPlayerState(state);
	}

	deviceStateChange(socket, { devices }) {
		const target = this.accounts[socket.accountId];
		if (!target) return;
		target.setDevices(devices);
	}

	getActiveAccount() {
		return this.activeAccount?.clone();
	}

	determinActiveAccount() {
		for (const accountId in this.accounts) {
			const account = this.accounts[accountId];
			if (!account?.isActive) continue;
			return account;
		}
	}

	updateActiveAccount() {
		const newActiveAccount = this.determinActiveAccount();
		if (newActiveAccount?.id === this.activeAccount?.id) return;

		this.ensureSpotifyState(newActiveAccount);
	}

	setToken(newActiveAccount) {
		SpotifyAPIWrapper.updateToken({
			accessToken: newActiveAccount?.accessToken,
			accountId: newActiveAccount?.id
		});
	}

	async ensureSpotifyState(newActiveAccount) {
		if (!newActiveAccount) {
			this.activeAccount = undefined;
			return this.emit();
		}

		this.setToken(newActiveAccount);

		await this.ensureDeviceState(newActiveAccount);
		if (newActiveAccount.isActive) await this.fetchPlayerState(newActiveAccount);

		this.activeAccount = newActiveAccount;
		this.checkActivityInterval();
		this.emit();
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

	checkActivityInterval() {
		if (!this.activeAccount?.playerState && this.idleTimeoutId) {
			console.log("Clear Idle Timeout");
			clearTimeout(this.idleTimeoutId);
			this.idleTimeoutId = null;
			return;
		}

		if (!this.activeAccount?.playerState) return;

		const { isPlaying } = this.activeAccount.playerState;

		if (isPlaying && this.idleTimeoutId) {
			console.log("Clear Idle Timeout");
			clearTimeout(this.idleTimeoutId);
			this.idleTimeoutId = null;
			return;
		}

		if (!isPlaying && this.idleTimeoutId) return;

		if (!isPlaying) {
			console.log("Start Idle Timeout");
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
	}
})();

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
