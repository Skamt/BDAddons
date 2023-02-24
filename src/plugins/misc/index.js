const {
	UI,
	DOM,
	Patcher,
	ContextMenu,
	Webpack: { Filters, getModule }
} = new BdApi(config.info.name);

class Disposable {
	constructor() {
		this.patches = []
	}

	Dispose() {
		this.patches.forEach(p => p?.());
	}
}

const electron = require('electron');
const MessageActions = DiscordModules.MessageActions;
const UserStore = DiscordModules.UserStore;
const DeviceStore = BdApi.Webpack.getModule(m => m?.getActiveSocketAndDevice);
const nativeModules = getModule((m, e, i) => m.default.setObservedGamesCallback);
const Dispatcher = getModule(Filters.byProps("dispatch", "subscribe"));

const mods = [
	require("StopDiscordMonitoringRunningGames.js"),
	require("SpotifyListenAlong.js"),
	require("ConsoleToggleButton.js"),
	require("RemoveTrackersfromURLS.js")
];

module.exports = () => ({
	start() {
		DOM.addStyle(require("styles.css"));
		mods.forEach(mod => !mod.once && mod.Init?.());
	},
	stop() {
		DOM.removeStyle();
		mods.forEach(mod => mod.Dispose?.());
	}
});