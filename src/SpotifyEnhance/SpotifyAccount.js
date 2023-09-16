export default class {
	constructor({ socket, devices }) {
		this.socket = socket;
		this.playerState = undefined;
		this.devices = devices;
	}

	get accessToken() {
		return this.socket.accessToken;
	}

	get id() {
		return this.socket.accountId;
	}

	get deviceState() {
		return !!this.devices.find(devices => devices.is_active);
	}
}
