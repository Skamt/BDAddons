import ConnectedAccountsStore from "@Stores/ConnectedAccountsStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import SpotifyStore from "@Stores/SpotifyStore";
import { promiseHandler } from "@Utils";
import { copy } from "@Utils";
import Logger from "@Utils/Logger";
import { insertText, sendMessageDirectly } from "@Utils/Messages";
import Timer from "@Utils/Timer";
import Toast from "@Utils/Toast";
import { Filters, getModule } from "@Webpack";
import SpotifyApi from "./SpotifyAPIWrapper";
import { sanitizeSpotifyLink } from "./Utils";

const createStore = getModule(Filters.byStrings("subscribeWithSelector", "useReducer"));

const Utils = {
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

export const Store = Object.assign(
	createStore((set, get) => {
		// const set = args => {
		// 	console.log("applying", args);
		// 	console.log("old state", get());
		// 	setState(args);
		// 	console.log("new state", get());
		// };

		return {
			account: undefined,
			setAccount: socket => {
				if (socket === get().account) return;
				SpotifyApi.setToken(socket);
				set({ account: socket, isActive: !!socket });
			},

			isActive: false,
			setDeviceState: isActive => set({ isActive }),

			async fetchPlayerState() {
				const [err, playerState] = await promiseHandler(SpotifyApi.getPlayerState());
				if (err) return Logger.error("Could not fetch player state", err);
				get().setPlayerState(playerState);
			},

			media: {},
			mediaType: "",
			volume: 50,
			progress: 0,
			isPlaying: false,
			mediaId: "",
			repeat: "",
			shuffle: false,
			actions: {},
			setPlayerState: playerState => {
				if (!playerState || playerState.currently_playing_type === "ad") return;
				const state = get();
				const media = playerState.item?.id === state.media?.id ? state.media : playerState.item;
				set({
					isActive: !!playerState?.device?.is_active,
					volume: playerState?.device?.volume_percent,
					duration: playerState?.item?.duration_ms,
					progress: playerState?.progress_ms,
					isPlaying: playerState?.is_playing,
					repeat: playerState?.repeat_state,
					shuffle: playerState?.shuffle_state,
					media: media,
					mediaId: media?.id,
					mediaType: playerState?.currently_playing_type,
					actions: playerState?.actions?.disallows
				});
			}
		};
	}),
	{
		init() {
			SpotifyStore.addChangeListener(onSpotifyStoreChange);
			ConnectedAccountsStore.addChangeListener(onAccountsChanged);
			const state = Store.getState();

			const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
			if (!socket) return;
			state.setAccount(socket);
			state.fetchPlayerState();
		},
		dispose() {
			SpotifyStore.removeChangeListener(onSpotifyStoreChange);
			ConnectedAccountsStore.removeChangeListener(onAccountsChanged);
			Store.getState().setAccount();
			Store.getState().setPlayerState({});
			timer.stop();
		},
		Utils,
		selectors: {
			isActive: state => state.isActive,
			media: state => state.media,
			mediaType: state => state.mediaType,
			volume: state => state.volume,
			progress: state => state.progress,
			mediaId: state => state.mediaId,
			isPlaying: state => state.isPlaying,
			duration: state => state.duration,
			repeat: state => state.repeat,
			shuffle: state => state.shuffle,
			actions: state => state.actions
		}
	}
);

const timer = new Timer(() => Store.getState().setAccount(undefined), 10 * 60 * 1000);

Store.subscribe(isPlaying => {
	if (isPlaying) return timer.stop();
	if (!isPlaying) return timer.start();
}, Store.selectors.isPlaying);

function onSpotifyStoreChange() {
	try {
		const state = Store.getState();
		if (state.account?.accountId && state.account?.accessToken) return;
		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (!socket) return;
		state.setAccount(socket);
		// state.fetchPlayerState();
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
		const state = Store.getState();
		// if we don't have an account set yet, get out.
		if (!state.account) return;
		const connectedAccounts = ConnectedAccountsStore.getAccounts().filter(account => account.type === "spotify");
		// if current account still connected, get out.
		if (connectedAccounts.some(a => a.id === state.account.accountId)) return;

		// this means we don't have a set account or set account is not connected, remove it.
		state.setAccount(undefined);
	} catch (e) {
		Logger.error(e);
	}
}

// export default Store;
