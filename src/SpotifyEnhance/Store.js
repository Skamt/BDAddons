import { Filters, getModule } from "@Api";
import { getZustand } from "@Utils/../zustand";
import ConnectedAccountsStore from "@Stores/ConnectedAccountsStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import SpotifyStore from "@Stores/SpotifyStore";
import { promiseHandler } from "@Utils";
import { copy, shallow } from "@Utils";
import Logger from "@Utils/Logger";
import { insertText, sendMessageDirectly } from "@Utils/Messages";
import Timer from "@Utils/Timer";
import Toast from "@Utils/Toast";
import SpotifyAPIWrapper from "./SpotifyAPIWrapper";
import { sanitizeSpotifyLink } from "./Utils";

const zustand = getZustand();
const subscribeWithSelector = getModule(Filters.byStrings("equalityFn", "fireImmediately"), { searchExports: true });
const Utils = {
	copy(str) {
		copy(str);
		Toast.success("copied!");
	},
	copySpotifyLink(link) {
		if (!link) return Toast.error("Could not resolve url");
		copy(sanitizeSpotifyLink(link));
		Toast.success("Link copied!");
	},
	openSpotifyLink(link) {
		if (!link) return Toast.error("Could not resolve url");
		window.open(sanitizeSpotifyLink(link), "_blank");
	},
	share(link) {
		if (!link) return Toast.error("Could not resolve url");
		const id = SelectedChannelStore.getCurrentlySelectedChannelId();
		if (!id) return Toast.info("There is no Selected Channel");
		link = sanitizeSpotifyLink(link);
		sendMessageDirectly({ id }, link).catch(a => {
			Toast.error(a.message);
			insertText(link);
		});
	}
};

// import { addedDiff, deletedDiff, detailedDiff, diff, updatedDiff } from "deep-object-diff";

export const Store = Object.assign(
	zustand(
		subscribeWithSelector((set, get) => {
			// const set = args => {
			// 	console.log("applying", args);
			// 	const oldState = get();
			// 	setState(args);
			// 	const newState = get();
			// 	console.log("old state", oldState);
			// 	console.log("new state", newState);
			// 	console.log("diff", diff(oldState, newState));
			// };

			return {
				account: undefined,
				setAccount: account => {
					if (account === get().account) return;
					set({ account: account, isActive: !!account });
				},

				isActive: false,
				setDeviceState: isActive => set({ isActive }),

				async fetchPlayerState() {
					const [err, playerState] = await promiseHandler(SpotifyAPIWrapper.getPlayerState());
					if (err) return Logger.error("Could not fetch player state", err);
					get().setPlayerState(playerState);
				},

				media: {},
				mediaType: undefined,
				volume: undefined,
				progress: undefined,
				isPlaying: undefined,
				mediaId: undefined,
				repeat: undefined,
				shuffle: undefined,
				actions: undefined,
				setPlayerState: playerState => {
					if (!playerState || playerState.currently_playing_type === "ad") return set({ isPlaying: false });

					const state = get();
					const media = playerState.item?.id === state.media?.id ? state.media : playerState.item;
					set({
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
						actions: playerState?.actions?.disallows
					});
				},

				position: 0,
				incrementPosition: () => {
					const state = get();
					let sum = state.position + 1000;
					if (sum > state.duration) sum = state.duration;
					set({ position: sum });
				},
				setPosition: position => set({ position }),

				getAlbum() {
					const media = get().media;
					return {
						...media.album,
						url: media.album.external_urls.spotify
					};
				},
				getFullSongName() {
					const state = get();
					if (!state.media) return "";
					const { artists, album } = state.media;
					return `Name: ${state.media.name}\nArtist${artists.length > 1 ? "s" : ""}: ${artists.map(a => a.name).join(" ,")}\nAlbum: ${album.name}`;
				},
				getSongUrl() {
					return get().media?.external_urls?.spotify;
				},
				getSongBanners() {
					const media = get().media;
					return {
						bannerSm: media?.album?.images[2],
						bannerMd: media?.album?.images[1],
						bannerLg: media?.album?.images[0]
					};
				}
			};
		})
	),
	{
		init() {
			SpotifyStore.addChangeListener(onSpotifyStoreChange);
			ConnectedAccountsStore.addChangeListener(onAccountsChanged);
			this.idleTimer = new Timer(() => Store.state.setAccount(undefined), 5 * 60 * 1000, Timer.TIMEOUT);
			this.positionInterval = new Timer(Store.state.incrementPosition, 1000, Timer.INTERVAL);

			const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
			if (!socket) return;
			Store.state.setAccount(socket);
			Store.state.fetchPlayerState();
		},
		dispose() {
			SpotifyStore.removeChangeListener(onSpotifyStoreChange);
			ConnectedAccountsStore.removeChangeListener(onAccountsChanged);
			Store.state.setAccount();
			Store.state.setPlayerState({});
			this.idleTimer.stop();
		},
		Utils,
		Api: SpotifyAPIWrapper,
		selectors: {
			isActive: state => state.isActive,
			account: state => state.account,
			media: state => state.media,
			mediaType: state => state.mediaType,
			volume: state => state.volume,
			progress: state => state.progress,
			mediaId: state => state.mediaId,
			context: state => state.context,
			isPlaying: state => state.isPlaying,
			duration: state => state.duration,
			repeat: state => state.repeat,
			shuffle: state => state.shuffle,
			position: state => state.position,
			actions: state => state.actions
		}
	}
);

Object.defineProperty(Store, "state", {
	writeable: false,
	configurable: false,
	get: () => Store.getState()
});

Store.subscribe(Store.selectors.account, (account = {}) => {
	SpotifyAPIWrapper.setAccount(account.accessToken, account.accountId);
});

Store.subscribe(Store.selectors.isPlaying, isPlaying => {
	if (isPlaying) {
		Store.idleTimer.stop();
		Store.positionInterval.start();
	} else {
		Store.positionInterval.stop();
		Store.idleTimer.start();
	}
});

Store.subscribe(Store.selectors.position, position => {
	const { duration, setPosition } = Store.state;

	if (position < duration) return;
	Store.positionInterval.stop();
	setPosition(duration || 0);
});

Store.subscribe(
	state => [state.isPlaying, state.progress],

	([isPlaying]) => {
		if (!isPlaying) Store.positionInterval.stop();
		else Store.positionInterval.start();
	},
	{ equalityFn: shallow }
);

function onSpotifyStoreChange() {
	try {
		if (Store.state.account?.accountId && Store.state.account?.accessToken) return;
		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (!socket) return;
		Store.state.setAccount(socket);
		Store.state.fetchPlayerState();
	} catch (e) {
		Logger.error(e);
	}
}

function onAccountsChanged() {
	try {
		/**
		 * This listener is used to make sure the current account is still connected
		 * SpotifyStore doesn't notify us about this information
		 */

		// if we don't have an account set yet, return.
		if (!Store.state.account) return;
		const connectedAccounts = ConnectedAccountsStore.getAccounts().filter(account => account.type === "spotify");
		// if current account still connected, return.
		if (connectedAccounts.some(a => a.id === Store.state.account.accountId)) return;

		// this means we don't have a set account or set account is not connected, remove it.
		Store.state.setAccount(undefined);
	} catch (e) {
		Logger.error(e);
	}
}
