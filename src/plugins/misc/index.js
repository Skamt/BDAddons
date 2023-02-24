const {
	UI,
	DOM,
	Patcher,
	ContextMenu,
	Webpack: { Filters, getModule }
} = new BdApi(config.info.name);

const electron = require('electron');
const MessageActions = DiscordModules.MessageActions;
const UserStore = DiscordModules.UserStore;
const DeviceStore = BdApi.Webpack.getModule(m => m?.getActiveSocketAndDevice);
const nativeModules = getModule((m, e, i) => m.default.setObservedGamesCallback);
const Dispatcher = getModule(Filters.byProps("dispatch", "subscribe"));

const StopDiscordMonitoringRunningGames = {
	init() {
		nativeModules.default = { ...nativeModules.default, setObservedGamesCallback: () => {} };
	}
}

const SpotifyListenAlong = {
	patchDeviceStore() {
		if (DeviceStore?.getActiveSocketAndDevice) {
			Patcher.after(
				DeviceStore,
				'getActiveSocketAndDevice',
				(_, args, ret) => {
					if (ret?.socket) ret.socket.isPremium = true;
					return ret;
				}
			);
		}
	}
}

const ConsoleToggleButton = {
	init() {
		let i = setInterval(() => {
			const host = document.querySelector("#app-mount > div > div");
			if (!host) return;
			clearInterval(i);
			this.el = document.createElement('span');
			this.el.id = 'console';

			this.el.textContent = 'F12';
			this.el.onclick = () => electron.ipcRenderer.send('bd-toggle-devtools');

			host.append(this.el);
		}, 2000);
	},
	clear() {
		this.el.parentElement.removeChild(this.el);
	}
}

const RemoveTrackersfromURLS = {
	targets: ["spotify"],
	urlRegex(name) { return new RegExp(`((?:https|http)\\:\\/\\/(?:.*\\.)?${name}\\..*\\/\\S+)`, 'g') },
	sanitizeUrls(content, filters) {
		filters.forEach((regex) => {
			content.match(regex)
				.forEach(url =>
					content = content.replace(url, url.split('?')[0])
				);
		})
		return content;
	},
	handleMessage(msgcontent) {
		const filters = [];
		for (const target of this.targets) {
			const regex = this.urlRegex(target);
			if (msgcontent.match(regex))
				filters.push(regex);
		}
		if (filters.length > 0)
			return this.sanitizeUrls(msgcontent, filters);
		return msgcontent;
	},
	init() {
		Patcher.before(DiscordModules.MessageActions, "sendMessage", (_, [, message]) => {
			message.content = this.handleMessage(message.content);
		});

		Patcher.before(Dispatcher, "dispatch", (_, [type, message]) => {
			if (type === "MESSAGE_CREATE")
				if (message.author.id !== DiscordModules.UserStore.getCurrentUser().id)
					message.content = this.handleMessage(message.content);
		});
	}
}


StopDiscordMonitoringRunningGames.init();
module.exports = () => ({
	start() {
		DOM.addStyle(require("styles.css"));
		SpotifyListenAlong.patchDeviceStore();
		RemoveTrackersfromURLS.init();
		ConsoleToggleButton.init();
	},
	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
		ConsoleToggleButton.clear();
	}
});