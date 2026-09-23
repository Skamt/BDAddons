/**
 * @runAt idle
 * @name ReadAllNotifications
 * @description Read all server notifications with a single button click!
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
		"description": "Read all server notifications with a single button click!",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/ReadAllNotifications/ReadAllNotifications.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/ReadAllNotifications",
		"credit": "https://github.com/Vendicated/Vencord/tree/main/src/plugins/readAllNotificationsButton",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();

// common/Utils/Logger.js
var Logger_default = Logger;
var patchError = (...args) => Logger.error("Could not patch SettingsMenuTransition", ...args);

// common/Plugin.js
var target = /* @__PURE__ */ (() => new EventTarget())();

function wrap(handler) {
	return (e) => {
		try {
			handler.apply(null, e);
		} catch (err) {
			Logger_default.error(`Could not run [${e.type}] handler`, { handler }, "\n", err);
		}
	};
}
var Plugin_default = {
	onStart: (handler, props) => target.addEventListener("START", wrap(handler), props),
	onStop: (handler, props) => target.addEventListener("STOP", wrap(handler), props),
	start() {
		target.dispatchEvent(new Event("START"));
	},
	stop() {
		target.dispatchEvent(new Event("STOP"));
	}
};

// common/Utils/StylesLoader.js
var styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};
Plugin_default.onStart(() => DOM.addStyle(styleLoader._styles.join("\n")));
Plugin_default.onStop(() => DOM.removeStyle());
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
    display:block !important;
}

.RAN-Button:hover {
    color: var(--interactive-icon-active);
}`);

// common/React.jsx
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;

// common/Utils/index.js
function getObjectKey(object = {}, filter) {
	for (const key in object) {
		if (!filter(object[key])) continue;
		return key;
	}
}

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function getDeclarationAndKey(moduleFilter, declarationFilter, options = {}) {
	const module2 = getModule(moduleFilter, { ...options, raw: true });
	if (!module2?.declarations) return;
	const key = getObjectKey(module2.declarations, declarationFilter);
	return key ? [module2.declarations, key] : void 0;
}

// MODULES-AUTO-LOADER:@Modules/Button
var Button_default = /* @__PURE__ */ (() => getModule((a) => a && a.Link && a.Colors, { searchExports: true }))();

// common/Components/Button/index.jsx
function ButtonComponentFallback(props) {
	return /* @__PURE__ */ React_default.createElement("button", { ...props });
}
var Button_default2 = Button_default || ButtonComponentFallback;

// MODULES-AUTO-LOADER:@Stores/GuildStore
var GuildStore_default = /* @__PURE__ */ (() => getStore("GuildStore"))();

// MODULES-AUTO-LOADER:@Stores/GuildChannelStore
var GuildChannelStore_default = /* @__PURE__ */ (() => getStore("GuildChannelStore"))();

// MODULES-AUTO-LOADER:@Stores/ActiveJoinedThreadsStore
var ActiveJoinedThreadsStore_default = /* @__PURE__ */ (() => getStore("ActiveJoinedThreadsStore"))();

// MODULES-AUTO-LOADER:@Stores/ReadStateStore
var ReadStateStore_default = /* @__PURE__ */ (() => getStore("ReadStateStore"))();

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true }))();

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
var ReadAllButton = /* @__PURE__ */ React_default.createElement(
	Button_default2, {
		style: { display: "none" },
		className: "RAN-Button",
		size: Button_default2.Sizes.TINY,
		look: Button_default2.Looks.BLANK,
		color: Button_default2.Colors.PRIMARY,
		onClick
	},
	"Read All"
);
var ServerList = getDeclarationAndKey(Filters.bySource("guild-list-unread-dms"), Filters.byStrings(`"aria-owns":"guild-list-unread-dms"`));
Plugin_default.onStart(() => {
	const { module: module2, key } = ServerList;
	if (!module2 || !key) return patchError("ServerList");
	Patcher.after(module2, key, (_, args, ret) => {
		if (!ret?.props?.children) return;
		const children = Array.isArray(ret.props.children) ? ret.props.children : [ret.props.children];
		children.push( /* @__PURE__ */ React_default.createElement(ReadAllButton, null));
		ret.props.children = children;
	});
});
Plugin_default.onStop(() => Patcher.unpatchAll());
module.exports = () => Plugin_default;
