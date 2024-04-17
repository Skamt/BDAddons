import { getModule, Filters } from "@Webpack";
import DiscordSpotifyStore from "@Stores/SpotifyStore";
// import SpotifyAPI from "@Utils/SpotifyAPI";
// import SpotifyStore from "@Stores/SpotifyStore";
// import ConnectedAccountsStore from "@Stores/ConnectedAccountsStore";

const createStore = getModule(Filters.byStrings("subscribeWithSelector", "useReducer"));
const { socket, device } = DiscordSpotifyStore.getActiveSocketAndDevice() || {};

const SpotifyStore = createStore(setState => {
	return {
		socket,
		setSocket: socket => {
			setState({ socket });
		},

		isActive: !!device?.is_active,
		setDeviceState: isActive => setState({ isActive })
	};
});

function onSpotifyStoreChange() {
	console.log("onSpotifyStoreChange");
	const state = SpotifyStore.getState();
	if (state.socket.accountId && state.socket.accessToken) return;
	const { socket, device } = DiscordSpotifyStore.getActiveSocketAndDevice() || {};
	if (!socket) return;
	state.setSocket(socket);
	const deviceState = !!device?.is_active;
	state.setDeviceState(deviceState);
	if (deviceState) {
		// fetch player state
	}
}

export default Object.assign(SpotifyStore, {
	init() {
		DiscordSpotifyStore.addChangeListener(onSpotifyStoreChange);
	},
	dispose() {
		DiscordSpotifyStore.removeChangeListener(onSpotifyStoreChange);
	}
});
