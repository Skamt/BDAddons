const {
	UI,
	DOM,
	Data,
	Patcher,
	React,
	Webpack: { Filters, getModule }
} = new BdApi(config.info.name);

const nop = () => {};

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
	const target = getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true });
	module = module?.exports;
	if (!module) return undefined;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return undefined;
	return { module, key };
}

const Utils = {
	showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type: type || "success" }),
	copy: (data) => {
		DiscordNative.clipboard.copy(data);
		Utils.showToast(`${data} Copied!`, "success");
	},
	sleep: delay => new Promise(done => setTimeout(() => done(), delay * 1000)),
	canSendMessage: (channel) => Permissions?.can({
		permission: DiscordPermissions.SEND_MESSAGES,
		context: channel,
		user: UserStore.getCurrentUser()
	}),
	prettyfiyBytes: (bytes, si = false, dp = 1) => {
		const thresh = si ? 1000 : 1024;

		if (Math.abs(bytes) < thresh) {
			return bytes + ' B';
		}

		const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
		let u = -1;
		const r = 10 ** dp;

		do {
			bytes /= thresh;
			++u;
		} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


		return bytes.toFixed(dp) + ' ' + units[u];
	}
};

require('Devtools.js');

const electron = require('electron');
const ChannelComponent = getModuleAndKey(DiscordModules.ChannelComponent);
const MessageActions = DiscordModules.MessageActions;
const UserStore = DiscordModules.UserStore;
const GuildMemberCountStore = DiscordModules.GuildMemberCountStore;
const GuildChannelStore = DiscordModules.GuildChannelStore;
const DeviceStore = getModule(m => m?.getActiveSocketAndDevice);
const nativeModules = getModule(m => m.getDiscordUtils)
const Dispatcher = getModule(Filters.byProps("dispatch", "subscribe"));
const Analytics = getModule(m => m?.AnalyticEventConfigs);
const MessageHeader = getModule((m) => m.Z?.toString().includes("userOverride") && m.Z?.toString().includes("withMentionPrefix"));
const Anchor = getModule(m => m && m.type && Filters.byStrings("trusted", "title", "href", "MASKED_LINK")(m.type));
const GuildTooltip = getModuleAndKey(Filters.byStrings('includeActivity', 'listItemTooltip'));
const DiscordUtils = BdApi.Webpack.getModule(m => m.getDiscordUtils)
// const SelectedChannelStore = getModule(Filters.byProps("getLastSelectedChannelId"));
const Permissions = DiscordModules.Permissions;
const DiscordPermissions = DiscordModules.DiscordPermissions;
const ChannelSettings = BdApi.Webpack.getModule(m => m.Z.updateChannelOverrideSettings).Z;

const mods = [
	require("NoTrack.js"),
	require("FiltersTest.js"),
	require("SpotifyListenAlong.js"),
	require("ConsoleToggleButton.js"),
	require("EmojiLetters.js"),
	require("ShowUserId.js"),
	require("MemUsage.js"),
	require("GuildInfo.js"),
	require("ChannelMuteButton.js"),
];

module.exports = () => ({
	start() {
		DOM.addStyle(require("styles.css"));
		mods.forEach(mod => { try { mod.Init?.() } catch (e) { console.log(mod, 'Init failed', e) } });
	},
	stop() {
		DOM.removeStyle();
		mods.forEach(mod => { try { mod.Dispose?.() } catch (e) { console.log(mod, 'Dispose failed', e) } });
	}
});