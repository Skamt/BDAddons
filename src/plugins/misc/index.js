const {
	UI,
	DOM,
	Patcher,
	ContextMenu,
	Webpack: { Filters, getModule }
} = new BdApi(config.info.name);

class Disposable {
	constructor() {
		this.patches = [];
	}

	Dispose() {
		this.patches?.forEach(p => p?.());
		this.patches = null;
	}
}
const nop = () => {};
const electron = require('electron');
const MessageActions = DiscordModules.MessageActions;
const UserStore = DiscordModules.UserStore;
const DeviceStore = getModule(m => m?.getActiveSocketAndDevice);
const nativeModules = getModule(m => m.getDiscordUtils)
const Dispatcher = getModule(Filters.byProps("dispatch", "subscribe"));
const Analytics = getModule(m => m?.AnalyticEventConfigs);

const mods = [
	require("NoTrack.js"),
	require("SpotifyListenAlong.js"),
	require("ConsoleToggleButton.js"),
	require("EmojiLetters.js"),
	require("FiltersTest.js"),
];

module.exports = () => ({
	start() {
		DOM.addStyle(require("styles.css"));
		mods.forEach(mod => mod.Init?.());
	},
	stop() {
		DOM.removeStyle();
		mods.forEach(mod => mod.Dispose?.());
	}
});