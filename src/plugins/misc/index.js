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

// https://discord.com/channels/86004744966914048/196782758045941760/1062604534922367107
function getModuleAndKey(filter) {
	let module;
	const target = getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true });
	module = module?.exports;
	if (!module) return undefined;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return undefined;
	return { module, key };
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
const Anchor = getModule(m => m && m.type && Filters.byStrings("trusted", "title", "href","MASKED_LINK")(m.type));
	
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