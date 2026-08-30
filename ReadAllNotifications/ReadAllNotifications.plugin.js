/**
 * @runAt idle
 * @name ReadAllNotifications
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ReadAllNotifications
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ReadAllNotifications/ReadAllNotifications.plugin.js
 * @credit https://github.com/Vendicated/Vencord/tree/main/src/plugins/readAllNotificationsButton
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "ReadAllNotifications",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/ReadAllNotifications/ReadAllNotifications.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/ReadAllNotifications",
		"credit": "https://github.com/Vendicated/Vencord/tree/main/src/plugins/readAllNotificationsButton",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var React = /* @__PURE__ */ (() => Api.React)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger2 = /* @__PURE__ */ (() => Api.Logger)();
var Webpack = /* @__PURE__ */ (() => Api.Webpack)();

// common/Utils/Logger.js
Logger2.patchError = (patchId) => {
	console.error(`%c[${Config_default.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};
var Logger_default = Logger2;

// common/Utils/EventEmitter.js
var EventEmitter_default = class {
	constructor() {
		this.listeners = {};
	}
	isInValid(event, handler) {
		return typeof event !== "string" || typeof handler !== "function";
	}
	once(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		const wrapper = () => {
			handler();
			this.off(event, wrapper);
		};
		this.listeners[event].add(wrapper);
	}
	on(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		this.listeners[event].add(handler);
		return () => this.off(event, handler);
	}
	off(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) return;
		this.listeners[event].delete(handler);
		if (this.listeners[event].size !== 0) return;
		delete this.listeners[event];
	}
	emit(event, ...payload) {
		if (!this.listeners[event]) return;
		for (const listener of this.listeners[event]) {
			try {
				listener.apply(null, payload);
			} catch (err) {
				Logger_default.error(`Could not run listener for ${event}`, err);
			}
		}
	}
};

// common/Utils/Plugin.js
var Events = {
	START: "START",
	STOP: "STOP"
};
var Plugin_default = new class extends EventEmitter_default {
	stopped = true;
	start() {
		this.emit(Events.START);
		this.stopped = false;
	}
	stop() {
		this.emit(Events.STOP);
		this.stopped = true;
	}
}();

// common/Utils/StylesLoader.js
var styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};
Plugin_default.on(Events.START, () => {
	DOM.addStyle(styleLoader._styles.join("\n"));
});
Plugin_default.on(Events.STOP, () => {
	DOM.removeStyle();
});
var StylesLoader_default = styleLoader;

// src/ReadAllNotifications/styles.css
StylesLoader_default.push(`.RAN-Button {
    color: var(--interactive-icon-default);
    padding: 0 0.5em;
	/*margin:5px 0;*/
    width: 100%;
    font-size: 14px;
    white-space: nowrap;
    box-sizing: border-box;
}

.RAN-Button:hover {
    color: var(--interactive-icon-active);
}`);

// common/React.jsx
var React_default = /* @__PURE__ */ (() => React)();

// common/Utils/index.js
function getObjectKey(object = {}, filter) {
	for (const key in object) {
		if (!filter(object[key])) continue;
		return key;
	}
}

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function getDeclarationAndKey(moduleFilter, declarationFilter, options = {}) {
	const module2 = getModule(moduleFilter, { ...options, raw: true });
	if (!module2?.declarations) return;
	const key = getObjectKey(module2.declarations, declarationFilter);
	return key ? { key, module: module2.declarations } : void 0;
}

// MODULES-AUTO-LOADER:@Modules/Button
var Button_default = getModule((a) => a && a.Link && a.Colors, { searchExports: true });

// common/Components/Button/index.jsx
function ButtonComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("button", { ...props });
}
var ManaButton = /* @__PURE__ */ getModule(Filters.byStrings(`"data-mana-component":"button"`), { searchExports: true }) || ButtonComponentFallback;
var ManaTextButton = /* @__PURE__ */ getModule(Filters.byStrings(`"data-mana-component":"text-button"`), { searchExports: true }) || ButtonComponentFallback;
var Button_default2 = Button_default || ButtonComponentFallback;

// MODULES-AUTO-LOADER:@Stores/GuildStore
var GuildStore_default = getStore("GuildStore");

// MODULES-AUTO-LOADER:@Stores/GuildChannelStore
var GuildChannelStore_default = getStore("GuildChannelStore");

// MODULES-AUTO-LOADER:@Stores/ActiveJoinedThreadsStore
var ActiveJoinedThreadsStore_default = getStore("ActiveJoinedThreadsStore");

// MODULES-AUTO-LOADER:@Stores/ReadStateStore
var ReadStateStore_default = getStore("ReadStateStore");

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true });

// src/ReadAllNotifications/index.jsx
function onClick() {
	const channels = [];
	Object.values(GuildStore_default.getGuilds()).forEach((guild) => {
		GuildChannelStore_default.getChannels(guild.id).SELECTABLE.concat(GuildChannelStore_default.getChannels(guild.id).VOCAL).concat(Object.values(ActiveJoinedThreadsStore_default.getActiveJoinedThreadsForGuild(guild.id)).flatMap((threadChannels) => Object.values(threadChannels))).forEach((c) => {
			if (!ReadStateStore_default.hasUnread(c.channel.id)) return;
			channels.push({
				channelId: c.channel.id,
				messageId: ReadStateStore_default.lastMessageId(c.channel.id),
				readStateType: 0
			});
		});
	});
	Dispatcher_default.dispatch({
		type: "BULK_ACK",
		context: "APP",
		channels
	});
}
var ServerList = getDeclarationAndKey(Filters.bySource("guild-list-unread-dms"), Filters.byStrings(`"aria-owns":"guild-list-unread-dms"`));
var ReadAllButton = () => /* @__PURE__ */ React_default.createElement(
	Button_default2, {
		className: "RAN-Button",
		size: Button_default2.Sizes.TINY,
		look: Button_default2.Looks.BLANK,
		color: Button_default2.Colors.PRIMARY,
		onClick
	},
	"Read All"
);
module.exports = () => ({
	start() {
		const { module: module2, key } = ServerList;
		if (!module2 || !key) return Logger.patchError("ServerList");
		Patcher.after(module2, key, (_, args, ret) => {
			const children = Array.isArray(ret.props.children) ? ret.props.children : [ret.props.children];
			children.push( /* @__PURE__ */ React_default.createElement(ReadAllButton, null));
			ret.props.children = children;
		});
	},
	stop: () => Patcher.unpatchAll()
});
