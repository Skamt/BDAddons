import EventEmitter from "./EventEmitter";
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
		SpotifyConnectionsListener.on("CHANGE", this.onSpotifyAccountsChange);
		SpotifySocketListener.on("MESSAGE", this.onSocketEvent);
		getSpotifyAccountsAndDevices().forEach(({ socket, devices = [] }) => {
			this.accounts[socket.accountId] = new SpotifyAccount({ socket, devices });
		});
	}

	dispose() {
		SpotifyConnectionsListener.off("CHANGE", this.onSpotifyAccountsChange);
		SpotifySocketListener.off("MESSAGE", this.onSocketEvent);
		SpotifyConnectionsListener.dispose();
		SpotifySocketListener.dispose();
		delete this.accounts;
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

		this.emit("CHANGE");
	}

	playerStateChange(socket, { state: newPlayerState }) {
		const target = this.accounts[socket.accountId];

		target.playerState = newPlayerState;

		for (let i = 0; i < target.devices.length; i++) {
			const device = target.devices[i];
			if (device.id === newPlayerState.device.id) {
				target.devices[i] = newPlayerState.device;
				return;
			}
		}

		target.devices.push(newPlayerState.device);
	}

	deviceStateChange(socket, { devices }) {
		const target = this.accounts[socket.accountId];
		target.devices = devices;
		if (devices.length === 0) target.playerState = undefined;
	}
})();
