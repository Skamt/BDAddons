import Plugin from "@common/Plugin";
import actions from "./actions";
import ConnectedAccountsStore from "@Stores/ConnectedAccountsStore";
import SpotifyStore from "@Stores/SpotifyStore";
import Timer from "@Utils/Timer";
import { create, subscribeWithSelector } from "@Discord/zustand";
import { shallow } from "@Utils";
import { map } from "@Utils/Object";
import Logger from "@Utils/Logger";
import SpotifyAPIWrapper from "@/SpotifyAPIWrapper";
import SpotifyAPI from "@Utils/SpotifyAPI";

const initialState = {
	account: undefined,
	isActive: false,
	media: {},
	mediaType: undefined,
	volume: undefined,
	progress: undefined,
	isPlaying: undefined,
	mediaId: undefined,
	repeat: undefined,
	duration: undefined,
	context: undefined,
	shuffle: undefined,
	actions: {},
	position: 0
};

const Store = create(subscribeWithSelector(() => initialState));

DEV: {
	window.spotstore = Store;
	window.SpotifyAPI = SpotifyAPI;
}

export default Store;

Object.assign(Store, actions, {
	Api: SpotifyAPIWrapper,
	selectors: map(initialState, ({ key }) => state => state[key]),
	idleTimer: new Timer(() => Store.setDeviceState(false), 5 * 60 * 1000, Timer.TIMEOUT),
	positionInterval: new Timer(() => Store.incrementPosition(), 1000, Timer.INTERVAL)
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
	if (position < Store.state.duration) return;
	Store.positionInterval.stop();
	Store.setPosition(Store.state.duration || 0);
});

Store.subscribe(
	state => [state.isPlaying, state.progress],

	([isPlaying]) => {
		if (!isPlaying) Store.positionInterval.stop();
		else Store.positionInterval.start();
	}, { equalityFn: shallow }
);

function onSpotifyStoreChange() {
	try {
		if (Store.state.account?.accountId && Store.state.account?.accessToken) return;
		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (!socket) return;
		Store.setAccount(socket);
		Store.fetchPlayerState();
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
		Store.setAccount(undefined);
	} catch (e) {
		Logger.error(e);
	}
}

Plugin.onStart(() => {
	SpotifyStore.addChangeListener(onSpotifyStoreChange);
	ConnectedAccountsStore.addChangeListener(onAccountsChanged);

	const account = ConnectedAccountsStore.getAccount(null, "spotify") || {};
	SpotifyAPIWrapper.setAccount(account.accessToken, account.id);

	const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
	if (!socket) return;
	Store.setAccount(socket);
	Store.fetchPlayerState();
});

Plugin.onStop(() => {
	SpotifyStore.removeChangeListener(onSpotifyStoreChange);
	ConnectedAccountsStore.removeChangeListener(onAccountsChanged);
	Store.setAccount();
	Store.setPlayerState({});
	Store.idleTimer.stop();
});