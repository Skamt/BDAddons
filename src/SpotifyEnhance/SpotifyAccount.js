export default class SpotifyAccount {
	constructor(socket) {
		this.socket = socket;
	}

	get accessToken() {
		return this.socket.accessToken;
	}

	get id() {
		return this.socket.accountId;
	}

	get isActive() {
		return this.device?.is_active;
	}

	setDevices(devices) {
		this.device = devices.find(d => d.is_active) || devices[0];
		if (!this.isActive) this.playerState = undefined;
	}

	setPlayerState(playerState) {
		this.playerState = new PlayerState(playerState);
		this.device = playerState.device;
	}
}

class PlayerState {
	constructor(playerState) {
		this.playerState = playerState;
		this.track = new Track(playerState.item);
	}

	get disallowedActions() {
		return this.playerState.actions.disallows;
	}

	get currentlyPlayingType() {
		return this.playerState.currently_playing_type;
	}

	get context() {
		return this.playerState.context;
	}

	get shuffle() {
		return this.playerState["shuffle_state"];
	}

	get repeat() {
		return this.playerState["repeat_state"];
	}

	get progress() {
		return this.playerState["progress_ms"];
	}

	get isPlaying() {
		return this.playerState["is_playing"];
	}

	get volume() {
		return this.playerState.device["volume_percent"];
	}
}

class Track {
	constructor(track) {
		this.track = track || {};
	}

	get id() {
		return this.track.id || "";
	}

	get url() {
		return this.track.external_urls?.spotify || "";
	}

	get artists() {
		return this.track.artists || [];
	}

	get duration() {
		return this.track["duration_ms"] || 0;
	}

	get explicit() {
		return this.track.explicit || false;
	}

	get name() {
		return this.track.name || "";
	}

	get bannerSm() {
		return this.track.album?.images[2] || {};
	}

	get bannerMd() {
		return this.track.album?.images[1] || {};
	}

	get bannerLg() {
		return this.track.album?.images[0] || {};
	}

	get albumName() {
		return this.track.album?.name || "";
	}

	get albumUrl() {
		return this.track.album?.external_urls?.spotify || "";
	}
}
