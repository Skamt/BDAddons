export default class {
	constructor({ socket, devices }) {
		this.socket = socket;
		this.devices = devices;
		this.playerState = undefined;
		this.isActive = !!devices.find(devices => devices.is_active);
	}

	get accessToken() {
		return this.socket.accessToken;
	}

	get id() {
		return this.socket.accountId;
	}

	get item() {
		return this.playerState?.item;
	}

	get shuffle() {
		return this.playerState?.["shuffle_state"];
	}

	get repeat() {
		return this.playerState?.["repeat_state"];
	}

	get progress() {
		return this.playerState?.["progress_ms"];
	}

	get isPlaying() {
		return this.playerState?.["is_playing"];
	}

	setDevices(devices) {
		this.devices = devices;
		this.isActive = !!devices.find(devices => devices.is_active);
		if (!this.isActive) this.playerState = undefined;
	}

	setPlayerState(playerState) {
		this.playerState = playerState;

		for (let i = 0; i < this.devices.length; i++) {
			const device = this.devices[i];
			if (device.id === this.playerState.device.id) {
				this.devices[i] = this.playerState.device;
				return;
			}
		}

		this.devices.push(this.playerState.device);
	}
}
