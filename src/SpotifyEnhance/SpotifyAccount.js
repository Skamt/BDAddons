class PlayerState {
	constructor(playerState) {
		this.playerState = playerState;
	}

	get track() {
		return this.playerState?.item;
	}

	get trackId() {
		return this.track?.id;
	}

	get trackUrl() {
		return this.track?.external_urls?.spotify;
	}

	get trackArtists() {
		return this.track?.artists;
	}

	get trackDuration() {
		return this.track?.["duration_ms"];
	}

	get explicit() {
		return this.track?.explicit;
	}

	get trackName() {
		return this.track?.name;
	}

	get trackBannerObj() {
		return this.track?.album?.images;
	}

	get trackAlbumName() {
		return this.track?.album?.name;
	}

	get trackAlbumUrl() {
		return this.track?.album?.external_urls?.spotify;
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

	get volume() {
		return this.playerState?.device?.["volume_percent"];
	}
}

export default class SpotifyAccount {
	constructor({ socket, device }) {
		this.socket = socket;
		this.device = device;
	}

	get accessToken() {
		return this.socket.accessToken;
	}

	set accessToken(token) {
		this.socket.accessToken = token;
	}

	get id() {
		return this.socket.accountId;
	}

	get isActive() {
		return this.devices?.is_active;
	}

	setDevices(devices) {
		this.devices = devices.find(d => d.is_active) || devices[0];
		if (!this.isActive) this.playerState = undefined;
	}

	setPlayerState(playerState) {
		this.playerState = new PlayerState(playerState);
		this.device = playerState.device;
	}
}
