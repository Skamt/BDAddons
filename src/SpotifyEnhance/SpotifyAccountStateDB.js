import EventEmitter from "@Utils/EventEmitter";
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

export default new (class SpotifyAccountStateDB extends EventEmitter {
	constructor() {
		super();
		this.onSpotifyAccountsChange = this.onSpotifyAccountsChange.bind(this);
		this.onSocketEvent = this.onSocketEvent.bind(this);
	}

	init() {
		this.accounts = {};
		SpotifyConnectionsListener.init();
		SpotifySocketListener.init();
		SpotifyConnectionsListener.on(this.onSpotifyAccountsChange);
		SpotifySocketListener.on(this.onSocketEvent);
		getSpotifyAccountsAndDevices().forEach(({ socket, devices = [] }) => {
			this.accounts[socket.accountId] = new SpotifyAccount({ socket, devices });
		});
	}

	dispose() {
		SpotifyConnectionsListener.off(this.onSpotifyAccountsChange);
		SpotifySocketListener.off(this.onSocketEvent);
		SpotifyConnectionsListener.dispose();
		SpotifySocketListener.dispose();
		delete this.accounts;
	}

	getAccounts() {
		return this.accounts;
	}

	getAccount(id) {
		return this.accounts[id];
	}

	getActiveAccount() {
		for (const accountId in this.accounts) {
			const account = this.accounts[accountId];
			if (!account.isActive) continue;
			return account.clone();
		}
	}

	onSpotifyAccountsChange() {
		const temp = {};
		getSpotifyAccountsAndDevices().forEach(({ socket, devices = [] }) => {
			const { accountId } = socket;
			temp[accountId] = this.accounts[accountId] ? this.accounts[accountId] : new SpotifyAccount({ socket, devices });
		});

		this.accounts = temp;
		this.emit("CHANGE");
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

		this.emit("UPDATE");
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
})();
