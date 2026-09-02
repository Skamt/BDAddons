/**
 * @runAt idle
 * @name BypassStatus
 * @description Still get notifications from specific sources when in do not disturb mode. Right-click on users/channels/guilds to set them to bypass do not disturb mode.
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/BypassStatus
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/BypassStatus/BypassStatus.plugin.js
 */

// common/React.jsx
var React_default = /* @__PURE__ */ (() => BdApi.React)();

// config:@Config
var Config_default = {
	"info": {
		"name": "BypassStatus",
		"version": "1.0.0",
		"description": "Still get notifications from specific sources when in do not disturb mode. Right-click on users/channels/guilds to set them to bypass do not disturb mode.",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/BypassStatus/BypassStatus.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/BypassStatus",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"guilds": "",
		"channels": "",
		"users": "",
		"allowOutsideOfDms": true,
		"mentionOnly": true,
		"notificationSound": true,
		"respectSilentPings": true,
		"statusToUse": "dnd"
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();

// common/Utils/index.js
var nop = () => {};

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getByPrototypeKeys = /* @__PURE__ */ (() => Webpack.getByPrototypeKeys)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true });

// common/Utils/Flux.js
var Flux_default = new class {
	init(map) {
		this.setupHandlers(map);
	}
	dispose() {
		this.handlers?.forEach?.((h) => h());
		this.handlers = null;
	}
	setupHandlers(map) {
		this.handlers = Object.entries(map).reduce((acc, item) => {
			Dispatcher_default.subscribe(item[0], item[1]);
			acc.push(() => Dispatcher_default.unsubscribe(item[0], item[1]));
			return acc;
		}, []);
	}
}();

// common/Utils/Logger.js
Logger.patchError = (patchId) => {
	console.error(`%c[${Config_default.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};
var Logger_default = Logger;

// common/DiscordModules/zustand.js
var { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});
var subscribeWithSelector = getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), { searchExports: true });

function create(initialState) {
	const Store = zustand(initialState);
	Object.defineProperty(Store, "state", {
		configurable: false,
		get: () => Store.getState()
	});
	return Store;
}

// common/Utils/Settings.js
var SettingsStore = create(subscribeWithSelector(() => Object.assign(Config_default.settings, Data.load("settings") || {})));
((state) => {
	const selectors = {};
	const actions = {};
	for (const [key, value] of Object.entries(state)) {
		actions[`set${key}`] = (newValue) => SettingsStore.setState({
			[key]: newValue });
		selectors[key] = (state2) => state2[key];
	}
	Object.defineProperty(SettingsStore, "selectors", { value: Object.assign(selectors) });
	Object.assign(SettingsStore, actions);
})(SettingsStore.getInitialState());
SettingsStore.subscribe(
	(state) => state,
	() => Data.save("settings", SettingsStore.state)
);
Object.assign(SettingsStore, {
	useSetting: (key) => {
		const val = SettingsStore((state) => state[key]);
		return [val, SettingsStore[`set${key}`]];
	}
});
var Settings_default = SettingsStore;

// MODULES-AUTO-LOADER:@Stores/WindowStore
var WindowStore_default = getStore("WindowStore");

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = getStore("UserStore");

// MODULES-AUTO-LOADER:@Stores/PresenceStore
var PresenceStore_default = getStore("PresenceStore");

// MODULES-AUTO-LOADER:@Stores/ChannelStore
var ChannelStore_default = getStore("ChannelStore");

// MODULES-AUTO-LOADER:@Stores/ChannelActionCreators
var ChannelActionCreators_default = getStore("ChannelActionCreators");

// MODULES-AUTO-LOADER:@Stores/MessageStore
var MessageStore_default = getStore("MessageStore");

// common/DiscordModules/Modules.js
var ComponentDispatch;
waitForModule((m) => m.dispatchToLastSubscribed, { searchExports: true }).then((a) => {
	ComponentDispatch = a;
});
var transitionTo = /* @__PURE__ */ (() => getModule(Filters.byStrings("transitionTo - Transitioning to"), { searchExports: true }))();
var RadioGroup = /* @__PURE__ */ (() => getMangled('data-toggleable-component":"radiogroup', { radioGroup: Filters.byStrings("label", "required") }).radioGroup)();

// MODULES-AUTO-LOADER:@Stores/GuildMemberStore
var GuildMemberStore_default = getStore("GuildMemberStore");

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = getStore("SelectedChannelStore");

// MODULES-AUTO-LOADER:@Stores/SelectedGuildStore
var SelectedGuildStore_default = getStore("SelectedGuildStore");

// MODULES-AUTO-LOADER:@Modules/FetchUser
var FetchUser_default = getModule(Filters.byStrings("USER_UPDATE", "default.getUser", "oldFormErrors"), { searchExports: true });

// MODULES-AUTO-LOADER:@Stores/GuildStore
var GuildStore_default = getStore("GuildStore");

// common/Utils/Channel.js
function getCurrentChannel() {
	return ChannelStore_default.getChannel(SelectedChannelStore_default.getChannelId());
}

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

// common/Components/Collapsible/styles.css
StylesLoader_default.push(`.collapsible-container * {
	box-sizing: border-box;
}

.collapsible-container {
	gap: 0px 20px;
	display: grid;
	grid-template-rows: min-content 0fr;
	transition: grid-template-rows 200ms linear;
	user-select: none;
	color: var(--text-secondary);
	background: var(--background-mod-subtle);
	border-radius: 8px;
	margin-bottom: 5px;
}

.collapsible-open {
	grid-template-rows: min-content 1fr;
	color: var(--text-primary);
}

.collapsible-header {
	background: var(--background-mod-subtle);
	padding: 10px;
	gap: 8px;
	display: flex;
	border-radius: inherit;
	align-items: center;
	min-width: 0;
}

.collapsible-header:hover {
	background: var(--background-mod-normal);
}

.collapsible-header:active {
	background: var(--background-mod-faint);
}

.collapsible-icon {
	display: flex;
	flex: 0 0 auto;
	rotate: 0deg;
	transition: rotate 150ms linear;
	color: inherit;
}

.collapsible-title {
	flex: 1 1 0;
	text-transform: capitalize;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	pointer-events: none;
	color: inherit;
}

.collapsible-body {
	transition: padding 0ms 200ms;
	overflow: hidden;
}

.collapsible-open > .collapsible-header {
	border-radius: 8px 8px 0 0;
	background: var(--background-mod-strong);
}

.collapsible-open > .collapsible-body {
	padding: 15px;
	transition: none;
}

.collapsible-open > .collapsible-header > .collapsible-icon {
	rotate: 90deg;
}
`);

// common/Utils/css.js
var classNameFactory = (prefix = "", connector = "-") => (...args) => {
	const classNames = /* @__PURE__ */ new Set();
	for (const arg of args) {
		if (arg && typeof arg === "string") classNames.add(arg);
		else if (Array.isArray(arg)) arg.forEach((name) => classNames.add(name));
		else if (arg && typeof arg === "object") Object.entries(arg).forEach(([name, value]) => value && classNames.add(name));
	}
	return Array.from(classNames, (name) => `${prefix}${connector}${name}`).join(" ");
};

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

// common/Components/Collapsible/index.jsx
var c = classNameFactory("collapsible");

// MODULES-AUTO-LOADER:@Modules/FormSwitch
var FormSwitch_default = getModule(Filters.byStrings("note", "tooltipNote"), { searchExports: true });

// common/Components/Switch/index.jsx
var Switch_default = getMangled(Filters.bySource("auxiliaryContentPosition", "hasIcon"), {
	Switch: () => true
})?.Switch || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React_default.createElement("div", { style: { color: "#fff" } }, props.label, /* @__PURE__ */ React_default.createElement(
		"input", {
			type: "checkbox",
			checked: props.checked,
			onChange: (e) => props.onChange(e.target.checked)
		}
	));
};

// common/Components/Divider/styles.css
StylesLoader_default.push(`.divider-horizontal {
	border-top: thin solid var(--border-subtle);
	align-self: stretch;
	margin:var(--divider-gap) var(--divider-gutter) var(--divider-gap) var(--divider-gutter) ;
}

.divider-vertical {
	border-left: thin solid var(--border-subtle);
	align-self: stretch;
	margin:var(--divider-gutter) var(--divider-gap) var(--divider-gutter) var(--divider-gap);
}
`);

// common/Components/Divider/index.jsx
var c2 = classNameFactory("divider");

function Divider({ gap = 15, gutter = 0, direction = Divider.direction.HORIZONTAL }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { "--divider-gap": `${gap}px`, "--divider-gutter": `${gutter}%` },
			className: c2("base", direction)
		}
	);
}
Divider.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ settingKey, note, border = false, onChange = nop, description, ...rest }) {
	const [val, set] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Switch_default, {
			...rest,
			hasIcon: true,
			checked: val,
			label: description || settingKey,
			description: note,
			onChange: (e) => {
				set(e);
				onChange?.(e);
			}
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, { gap: 15 }));
}

// common/Components/TextInput/index.jsx
var TextInput = getModule(Filters.byStrings("showCharacterCount", "clearable"), { searchExports: true });
var TextInput_default = TextInput || function TextInputFallback(props) {
	return /* @__PURE__ */ React_default.createElement("div", { style: { color: "#fff" } }, /* @__PURE__ */ React_default.createElement(
		"input", {
			...props,
			type: "text",
			onChange: (e) => props.onChange?.(e.target.value)
		}
	));
};

// common/Components/SettingTextInput/index.jsx
function SettingTextInput({
	settingKey,
	processValue = (a) => a,
	border,
	label,
	onChange = nop,
	...rest
}) {
	const [val, set] = React_default.useState(Settings_default.state[settingKey]);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, label && /* @__PURE__ */ React_default.createElement(Heading_default, { tag: "legend", variant: "text-md/medium" }, label), /* @__PURE__ */ React_default.createElement(
		TextInput_default, {
			...rest,
			onChange: (e) => {
				set(e);
				Settings_default[`set${settingKey}`](processValue(e));
				onChange?.(e);
			},
			value: val
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, { gap: 15 }));
}

// common/Components/FieldSet/styles.css
StylesLoader_default.push(`.fieldset-container {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.fieldset-label {
	margin-bottom: 12px;
}

.fieldset-description {
	margin-bottom: 12px;
}

.fieldset-label + .fieldset-description{
	margin-top:-8px;
	margin-bottom: 0;
}

.fieldset-content {
	display: flex;
	flex-direction: column;
	width: 100%;
	justify-content: flex-start;
}
`);

// common/Components/FieldSet/index.jsx
var c3 = classNameFactory("fieldset");

function FieldSet({ label, description, children, contentGap = 16 }) {
	return /* @__PURE__ */ React_default.createElement("fieldset", { className: c3("container") }, label && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c3("label"),
			tag: "legend",
			variant: "text-lg/medium"
		},
		label
	), description && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c3("description"),
			variant: "text-sm/normal",
			color: "text-secondary"
		},
		description
	), /* @__PURE__ */ React_default.createElement("div", { className: c3("content"), style: { gap: contentGap } }, children));
}

// src/BypassStatus/SettingComponent.jsx
function Status() {
	const [val, set] = Settings_default.useSetting("statusToUse");
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			tag: "legend",
			variant: "text-md/medium"
		},
		"Status to use for whitelist"
	), /* @__PURE__ */ React_default.createElement(
		RadioGroup, {
			options: [{
					name: "Online",
					value: "online"
				},
				{
					name: "Idle",
					value: "idle"
				},
				{
					name: "Do Not Disturb",
					value: "dnd",
					default: true
				},
				{
					name: "Invisible",
					value: "invisible"
				}
			],
			orientation: "horizontal",
			value: val,
			onChange: (e) => set(e.value)
		}
	));
}

function processIds(value) {
	return value.replace(/\s/g, "").split(",").filter((id) => id.trim() !== "").join(", ");
}
var SettingComponent_default = () => /* @__PURE__ */ React_default.createElement("div", { className: `${Config_default.info.name}-settings` }, /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [{
		border: true,
		processValue: processIds,
		label: "Guild ids to let bypass (notified when pinged anywhere in guild)",
		placeholder: "Separate with commas",
		settingKey: "guilds"
	},
	{
		border: true,
		processValue: processIds,
		label: "Channel ids to let bypass (notified when pinged in that channel)",
		placeholder: "Separate with commas",
		settingKey: "channels"
	},
	{
		border: true,
		processValue: processIds,
		label: "User ids to let bypass (notified for all messages sent in DMs)",
		placeholder: "Separate with commas",
		settingKey: "users"
	}
].map(SettingTextInput), [{
		border: true,
		note: "Only get notified for messages that mentions you",
		description: "Mentions only",
		settingKey: "mentionOnly"
	},
	{
		border: true,
		note: "Allow selected users to bypass status outside of DMs too (acts like a channel/guild bypass, but it's for all messages sent by the selected users)",
		description: "Allow outside of DMs",
		settingKey: "allowOutsideOfDms"
	},
	{
		border: true,
		note: "Whether the notification sound should be played",
		description: "Notification sound",
		settingKey: "notificationSound"
	},
	{
		border: true,
		note: "Respect silent pings (@silent / suppress notifications)",
		description: "Respect silent pings",
		settingKey: "respectSilentPings"
	}
].map(SettingSwtich), /* @__PURE__ */ React_default.createElement(Status, null)));

// src/BypassStatus/patchContextMenu.js
var patchContextMenu_default = {
	dispose() {
		this.handlers?.forEach?.((h) => h());
		this.handlers = null;
	},
	init() {
		this.handlers = [
			...["user", "guild", "channel"].map(
				(id) => ContextMenu.patch(
					`${id}-context`,
					(retVal) => retVal.props.children.splice(-1, 0, ContextMenu.buildItem({ type: "separator" }))
				)
			),
			...["user", "guild", "channel"].map((id) => {
				return ContextMenu.patch(`${id}-context`, (retVal, props) => {
					const type = props[id];
					if (!type) return;
					const enabled = Settings_default.state[`${id}s`].split(", ").includes(type.id);
					if (id === "user" && type.id === UserStore_default.getCurrentUser().id) return;
					retVal.props.children.splice(
						-1,
						0,
						ContextMenu.buildItem({
							id: `status-${id}-bypass`,
							type: "toggle",
							// icon: enabled ? EnabledIcon : DisabledIcon,
							// leadingAccessory: { type: "icon", icon: enabled ? EnabledIcon : DisabledIcon },
							label: `${enabled ? "Remove" : "Add"} Status Bypass`,
							active: enabled,
							action: () => {
								let bypasses = Settings_default.state[`${id}s`].split(", ");
								if (enabled) bypasses = bypasses.filter((id2) => id2 !== type.id);
								else bypasses.push(type.id);
								Settings_default[`set${id}s`](bypasses.filter((id2) => id2.trim() !== "").join(", "));
							}
						})
					);
				});
			})
		];
	}
};

// src/BypassStatus/utils.js
var WebAudioSound = getByPrototypeKeys("play", "destroyAudio", "stop", { searchExports: true });

function playMessageNotificationSounce() {
	new WebAudioSound("message1", "message1", 1, "default").play();
}

// src/BypassStatus/index.js
var SILENT_PING_FLAG = 1 << 12;

function showNotification(message, guildId) {
	try {
		const channel = ChannelStore_default.getChannel(message.channel_id);
		BdApi.UI.showNotification({
			id: `BypassStatus-${Math.random().toString(36).slice(2)}`,
			title: `${message.author.globalName} ${guildId ? `(#${channel?.name}, ${ChannelStore_default.getChannel(channel?.parent_id)?.name})` : ""}`,
			// title: "Available Quests",
			// icon: UserStore.getUser(message.author.id).getAvatarURL(undefined, undefined, false),
			content: message.content,
			type: "info",
			duration: Number.POSITIVE_INFINITY,
			actions: [{
				label: "Jump to message",
				dontClose: false,
				onClick() {
					transitionTo(`/channels/${guildId ?? "@me"}/${message.channel_id}/${message.id}`);
				}
			}]
		});
		if (Settings_default.state.notificationSound) playMessageNotificationSounce();
	} catch (error) {
		Logger_default.error("Failed to notify user: ", error);
	}
}

function shouldNotify(message, guildId, channelId, currentUser) {
	const isMentioned = message.mentions.some((user) => user.id === currentUser.id);
	if (!isMentioned && Settings_default.state.mentionOnly) return false;
	if (Settings_default.state.users.split(", ").includes(message.author.id)) {
		if (ChannelStore_default.getDMFromUserId(message.author.id) === channelId) return true;
		if (Settings_default.state.allowOutsideOfDms) return true;
	}
	const notifyGuild = Settings_default.state.guilds.split(", ").includes(guildId);
	const notifyChannel = Settings_default.state.channels.split(", ").includes(channelId);
	if (notifyGuild || notifyChannel) return true;
}
Plugin_default.on(Events.START, () => {
	Flux_default.init({
		async MESSAGE_CREATE({ message, guildId, channelId }) {
			try {
				const currentUser = UserStore_default.getCurrentUser();
				const userStatus = PresenceStore_default.getStatus(currentUser.id);
				const currentChannelId = getCurrentChannel()?.id ?? "0";
				if (message.state === "SENDING" || message.content === "" || message.author.id === currentUser.id || channelId === currentChannelId && WindowStore_default.isFocused() || userStatus !== Settings_default.state.statusToUse) {
					return;
				}
				if (Settings_default.state.respectSilentPings && message.flags & SILENT_PING_FLAG) {
					return;
				}
				if (shouldNotify(message, guildId, channelId, currentUser))
					showNotification(message, guildId);
			} catch (error) {
				Logger_default.error("Failed to handle message: ", error);
			}
		}
	});
	patchContextMenu_default.init();
});
Plugin_default.on(Events.STOP, () => {
	Flux_default.dispose();
	patchContextMenu_default.dispose();
});
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent_default, null);
module.exports = () => Plugin_default;
