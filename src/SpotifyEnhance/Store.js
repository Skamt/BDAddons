import { Filters, getModule } from "@Webpack";
import Logger from "@Utils/Logger";
import ConnectedAccountsStore from "@Stores/ConnectedAccountsStore";
import SpotifyStore from "@Stores/SpotifyStore";
import { promiseHandler } from "@Utils";
import SpotifyApi from "./SpotifyAPIWrapper";
import Timer from "@Utils/Timer";

const createStore = getModule(Filters.byStrings("subscribeWithSelector", "useReducer"));

const Store = Object.assign(
	createStore((set, get) => {
		const setState = args => {
			console.log("applying", args);
			console.log("old state", get());
			set(args);
			console.log("new state", get());
		};

		return {
			account: undefined,
			setAccount: socket => {
				if (socket === get().account) return;
				SpotifyApi.setToken(socket);
				setState({ account: socket, isActive: !!socket });
			},

			isActive: false,
			setDeviceState: isActive => setState({ isActive }),

			async fetchPlayerState() {
				const [err, playerState] = await promiseHandler(SpotifyApi.getPlayerState());
				if (err) return Logger.error("Could not fetch player state", err);
				get().setPlayerState(playerState);
			},

			media: undefined,
			mediaType: undefined,
			volume: undefined,
			progress: undefined,
			isPlaying: undefined,
			repeat: undefined,
			shuffle: undefined,
			actions: undefined,
			context: undefined,
			setPlayerState: playerState => {
				if (!playerState || playerState.currently_playing_type === "ad") return;
				const state = get();
				setState({
					isActive: !!playerState.device?.is_active,
					volume: playerState.device?.volume_percent,
					context: playerState.context,
					duration: playerState.item?.duration_ms,
					progress: playerState.progress_ms,
					isPlaying: playerState.is_playing,
					repeat: playerState.repeat_state,
					shuffle: playerState.shuffle_state,
					media: playerState.item?.id === state.media?.id ? state.media : playerState.item,
					mediaType: playerState.currently_playing_type,
					actions: playerState.actions?.disallows
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
			// state.fetchPlayerState();
		},
		dispose() {
			SpotifyStore.removeChangeListener(onSpotifyStoreChange);
			ConnectedAccountsStore.removeChangeListener(onAccountsChanged);
			Store.getState().setAccount();
			Store.getState().setPlayerState({});
		},
		selectors: {
			isActive: state => state.isActive,
			media: state => state.media,
			mediaType: state => state.mediaType,
			volume: state => state.volume,
			progress: state => state.progress,
			isPlaying: state => state.isPlaying,
			duration: state => state.duration,
			repeat: state => state.repeat,
			shuffle: state => state.shuffle,
			actions: state => state.actions,
			context: state => state.context
		}
	}
);

const timer = new Timer(
	() => {
		const state = Store.getState();
		console.log("Idle Timeout HIT: ", Date());
		state.setAccount(undefined);
	},
	10 * 60 * 1000
);

Store.subscribe(isPlaying => {
	console.log(timer);
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

export default Store;
