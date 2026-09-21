import { remove, removeMany } from "@Utils/Array";
import Logger from "@Utils/Logger";
import SpotifyAPIWrapper from "@/SpotifyAPIWrapper";
import { sanitizeSpotifyLink } from "@/utils";
import { promiseHandler } from "@Utils";

const getters = {
	getAlbum() {
		const media = this.state.media;
		return {
			...media.album,
			url: media.album.external_urls.spotify,
		};
	},
	getFullSongName() {
		const state = this.state;
		if (!state.media) return "";
		const { artists, album } = state.media;
		return `Name: ${state.media.name}\nArtist${artists.length > 1 ? "s" : ""}: ${artists.map((a) => a.name).join(" ,")}\nAlbum: ${album.name}`;
	},
	getSongUrl() {
		return sanitizeSpotifyLink(this.state.media?.external_urls?.spotify);
	},
	getPlaylistUrl() {
		return sanitizeSpotifyLink(this.state.ontext?.external_urls?.spotify);
	},
	getSongBanners() {
		const media = this.state.media;
		return {
			bannerSm: media?.album?.images[2],
			bannerMd: media?.album?.images[1],
			bannerLg: media?.album?.images[0],
		};
	},
};

const setters = {
	setAccount(account) {
		if (account === this.state.account) return;
		this.setState({ account: account, isActive: !!account });
	},
	setPlayerState(playerState) {
		if (!playerState || playerState.currently_playing_type === "ad")
			return this.setState({ isPlaying: false });

		const state = this.state;
		const newId = playerState.item?.linked_from?.id || playerState.item?.id;
		const media = newId === state.media?.id ? state.media : playerState.item;
		this.setState({
			isActive: !!playerState?.device?.is_active,
			volume: playerState?.device?.volume_percent,
			duration: playerState?.item?.duration_ms,
			progress: playerState?.progress_ms,
			position: playerState?.progress_ms,
			isPlaying: playerState?.is_playing,
			repeat: playerState?.repeat_state,
			shuffle: playerState?.shuffle_state,
			media: media,
			mediaId: media?.id,
			mediaType: playerState?.currently_playing_type,
			context: playerState?.context || {},
			actions: playerState?.actions?.disallows,
		});
	},
	setPosition(position) {
		this.setState({ position });
	},
	setDeviceState(isActive) {
		this.setState({ isActive });
	},
	incrementPosition() {
		let sum = this.state.position + 1000;
		if (sum > this.state.duration) sum = this.state.duration;
		this.setState({ position: sum });
	},
};

export default {
	state: {
		account: undefined,
		isActive: false,
		media: {},
		mediaType: undefined,
		volume: undefined,
		progress: undefined,
		isPlaying: undefined,
		mediaId: undefined,
		repeat: undefined,
		shuffle: undefined,
		actions: undefined,
		position: 0,
	},
	selectors: {
		isActive: (state) => state.isActive,
		account: (state) => state.account,
		media: (state) => state.media,
		mediaType: (state) => state.mediaType,
		volume: (state) => state.volume,
		progress: (state) => state.progress,
		mediaId: (state) => state.mediaId,
		context: (state) => state.context,
		isPlaying: (state) => state.isPlaying,
		duration: (state) => state.duration,
		repeat: (state) => state.repeat,
		shuffle: (state) => state.shuffle,
		position: (state) => state.position,
		actions: (state) => state.actions,
	},
	actions: {
		...getters,
		...setters,

		async fetchPlayerState() {
			const [err, playerState] = await promiseHandler(SpotifyAPIWrapper.getPlayerState());
			if (err) return Logger.error("Could not fetch player state", err);
			this.setPlayerState(playerState);
		},
	},
};
