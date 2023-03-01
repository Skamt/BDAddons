const {
	UI,
	DOM,
	Patcher,
	React,
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

function getModuleAndKey(filter) {
	let module;
	const target = BdApi.Webpack.getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true })
	return [module.exports, Object.keys(module.exports).find(k => module.exports[k] === target)];
}
const nop = () => {};

const electron = require('electron');
const MessageActions = DiscordModules.MessageActions;
const UserStore = DiscordModules.UserStore;
const DeviceStore = getModule(m => m?.getActiveSocketAndDevice);
const nativeModules = getModule(m => m.getDiscordUtils)
const Dispatcher = getModule(Filters.byProps("dispatch", "subscribe"));
const Analytics = getModule(m => m?.AnalyticEventConfigs);
const MessageHeader = getModule((m) => m.Z?.toString().includes("userOverride") && m.Z?.toString().includes("withMentionPrefix"));

// Helper functions
const Utils = {
	showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
	copy: (data) => {
		DiscordNative.clipboard.copy(data);
		Utils.showToast("Copied!", "success");
	},
};

const mods = [
	require("NoTrack.js"),
	require("SpotifyListenAlong.js"),
	require("ConsoleToggleButton.js"),
	require("EmojiLetters.js"),
	require("FiltersTest.js"),
	require("ShowUserId.js"),
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