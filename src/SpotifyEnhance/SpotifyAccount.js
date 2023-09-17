export default class SpotifyAccount {
	constructor({ socket, devices, playerState }) {
		this.socket = socket;
		this.devices = devices;
		this.playerState = playerState;
	}

	get accessToken() {
		return this.socket.accessToken;
	}

	set accessToken(token) {
		return (this.socket.accessToken = token);
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

	get isActive() {
		return !!this.devices.find(devices => devices.is_active);
	}

	setDevices(devices) {
		this.devices = devices;
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

	clone() {
		return new SpotifyAccount(this);
	}
}
