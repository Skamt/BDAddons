/**
 * @runAt idle
 * @name LazyLoadChannels
 * @description Lets you choose whether to load a channel
 * @version 1.3.4
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/LazyLoadChannels
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/LazyLoadChannels/LazyLoadChannels.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "LazyLoadChannels",
		"version": "1.3.4",
		"description": "Lets you choose whether to load a channel",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/LazyLoadChannels/LazyLoadChannels.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/LazyLoadChannels",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"autoloadedChannelIndicator": false,
		"lazyLoadVoice": false,
		"lazyLoadDMs": false
	}
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var Data = /* @__PURE__ */ (() => Api.Data)();
var React = /* @__PURE__ */ (() => Api.React)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var Webpack = /* @__PURE__ */ (() => Api.Webpack)();

// common/Utils/Logger.js
Logger.patchError = (patchId) => {
	console.error(`%c[${Config_default.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};
var Logger_default = Logger;

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

// src/LazyLoadChannels/styles.css
StylesLoader_default.push(`#lazyLoader {
	width: 100%;
	height: 100%;
	margin: auto;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	user-select: text;
	visibility: visible !important;

	background: var(--background-gradient-chat, var(--background-base-lower));
}

#lazyLoader ~ * {
	display: none;
}

#lazyLoader > .logo {
	flex: 0 1 auto;
	width: 376px;
	height: 162px;
	margin-bottom: 20px;
	background-image: url("https://raw.githubusercontent.com/Skamt/BDAddons/main/LazyLoadChannels/assets/lazy-loader-logo.svg");
	background-size: 100% 100%;
}

#lazyLoader > .DM,
#lazyLoader > .channel {
	background: #232527;
	box-sizing: border-box;
	min-width: 200px;
	border-radius: 5px;
	display: flex;
	align-items: center;
	font-weight: 500;
	font-size: 1.3em;
	margin-bottom: 20px;
	max-width: 600px;
}

#lazyLoader > .DM > .DMName,
#lazyLoader > .channel > .channelName {
	color: #989aa2;
	padding: 8px 25px 8px 5px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}
#lazyLoader > .DM {
	min-width: auto;
}
#lazyLoader > .DM > .DMName {
	padding: 8px;
}

#lazyLoader > .channel > .channelIcon {
	color: #989aa2;
	margin: 5px;
	font-size: 0;
}

#lazyLoader > .title {
	color: #fff;
	font-size: 24px;
	line-height: 28px;
	font-weight: 600;
	max-width: 640px;
	padding: 0 20px;
	text-align: center;
	margin-bottom: 8px;
}

#lazyLoader > .description {
	color: #c7c8ce;
	font-size: 16px;
	line-height: 1.4;
	max-width: 440px;
	text-align: center;
	margin-bottom: 20px;
}

.autoload > div > div,
.autoload a{
	border-left:4px solid #2e7d46;
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
var nop = () => {};

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target) => target[type] && filter(target[type]);
}

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

// src/LazyLoadChannels/ChannelsStateManager.js
var ChannelsStateManager = {
	init() {
		this.channels = new Set(Data.load("channels") || []);
		this.guilds = new Set(Data.load("guilds") || []);
		this.exceptions = new Set(Data.load("exceptions") || []);
	},
	add(key, target) {
		this[key].add(target);
		Data.save(key, this[key]);
	},
	remove(key, target) {
		this[key].delete(target);
		Data.save(key, this[key]);
	},
	has(key, target) {
		return this[key].has(target);
	},
	getChannelstate(guildId, channelId) {
		if (this.guilds.has(guildId) && !this.exceptions.has(channelId) || this.channels.has(channelId)) return true;
		return false;
	},
	toggelGuild(guildId) {
		if (this.guilds.has(guildId)) this.remove("guilds", guildId);
		else this.add("guilds", guildId);
	},
	toggelChannel(guildId, channelId) {
		if (this.guilds.has(guildId)) {
			if (!this.exceptions.has(channelId)) this.add("exceptions", channelId);
			else {
				this.remove("exceptions", channelId);
			}
		} else if (this.channels.has(channelId)) this.remove("channels", channelId);
		else this.add("channels", channelId);
	}
};
ChannelsStateManager.init();
var ChannelsStateManager_default = ChannelsStateManager;

// src/LazyLoadChannels/patches/patchChannel.js
Plugin_default.on(Events.START, () => {
	const controller = new AbortController();
	waitForModule(reactRefMemoFilter("render", "hasActiveThreads"), {
		signal: controller.signal,
		searchExports: true
	}).then((ChannelComponent) => {
		Patcher.after(ChannelComponent, "render", (_, [{ channel }], returnValue) => {
			if (!Settings_default.state.autoloadedChannelIndicator) return;
			if (ChannelsStateManager_default.getChannelstate(channel.guild_id, channel.id))
				returnValue.props.children.props.children[1].props.className += " autoload";
		});
	});
	Plugin_default.once(Events.STOP, () => controller.abort());
});

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary = class extends React_default.Component {
	state = { hasError: false, error: null, info: null };
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `
	${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${Config_default?.info?.name || "Unknown Plugin"}] %cthrew an exception at %c[${this.props.id}]
`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}
	renderErrorBoundary() {
		return /* @__PURE__ */ React_default.createElement("div", { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" } }, /* @__PURE__ */ React_default.createElement("b", { style: { color: "#e0e1e5" } }, "An error has occured while rendering ", /* @__PURE__ */ React_default.createElement("span", { style: { color: "orange" } }, this.props.id)));
	}
	renderFallback() {
		if (React_default.isValidElement(this.props.fallback)) {
			if (this.props.passMetaProps)
				this.props.fallback.props = {
					id: this.props.id,
					plugin: Config_default?.info?.name || "Unknown Plugin",
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return /* @__PURE__ */ React_default.createElement(
			this.props.fallback, {
				id: this.props.id,
				plugin: Config_default?.info?.name || "Unknown Plugin"
			}
		);
	}
	render() {
		if (!this.state.hasError) return this.props.children;
		return this.props.fallback ? this.renderFallback() : this.renderErrorBoundary();
	}
};

// src/LazyLoadChannels/Constants.js
var EVENTS = [
	"THREAD_CREATE_LOCAL",
	"THREAD_LIST_SYNC",
	"THREAD_CREATE",
	"CHANNEL_SELECT",
	"CHANNEL_PRELOAD",
	"GUILD_CREATE"
];
var COMPONENT_ID = "lazyLoader";

// src/LazyLoadChannels/components/ErrorFallbackComponent.jsx
var ErrorFallbackComponent_default = (props) => {
	return /* @__PURE__ */ React_default.createElement("div", { id: COMPONENT_ID }, /* @__PURE__ */ React_default.createElement("div", { className: "logo" }), /* @__PURE__ */ React_default.createElement("div", { className: "title" }, "An error has occured while rendering ", /* @__PURE__ */ React_default.createElement("span", { style: { fontWeight: "bold", color: "orange" } }, props.id)), /* @__PURE__ */ React_default.createElement("div", { className: "description" }, "Open console for more information"));
};

// MODULES-AUTO-LOADER:@Modules/FormSwitch
var FormSwitch_default = getModule(Filters.byStrings("note", "tooltipNote"), { searchExports: true });

// common/Components/Switch/index.jsx
var Switch_default = getMangled(Filters.bySource("auxiliaryContentPosition", "hasIcon"), {
	Switch: () => true
})?.Switch || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("div", { style: { color: "#fff" } }, props.label, /* @__PURE__ */ React.createElement(
		"input", {
			type: "checkbox",
			checked: props.checked,
			onChange: (e) => props.onChange(e.target.checked)
		}
	));
};

// MODULES-AUTO-LOADER:@Modules/Button
var Button_default = getModule((a) => a && a.Link && a.Colors, { searchExports: true });

// common/Components/Button/index.jsx
function ButtonComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("button", { ...props });
}
var ManaButton = /* @__PURE__ */ getModule(Filters.byStrings(`"data-mana-component":"button"`), { searchExports: true }) || ButtonComponentFallback;
var ManaTextButton = /* @__PURE__ */ getModule(Filters.byStrings(`"data-mana-component":"text-button"`), { searchExports: true }) || ButtonComponentFallback;
var Button_default2 = Button_default || ButtonComponentFallback;

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

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

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

// common/Components/FieldSet/index.jsx
var c = classNameFactory("fieldset");

function FieldSet({ label, description, children, contentGap = 16 }) {
	return /* @__PURE__ */ React_default.createElement("fieldset", { className: c("container") }, label && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c("label"),
			tag: "legend",
			variant: "text-lg/medium"
		},
		label
	), description && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c("description"),
			variant: "text-sm/normal",
			color: "text-secondary"
		},
		description
	), /* @__PURE__ */ React_default.createElement("div", { className: c("content"), style: { gap: contentGap } }, children));
}

// MODULES-AUTO-LOADER:@Modules/ChannelActions
var ChannelActions_default = getModule(Filters.byKeys("actions", "fetchMessages"), { searchExports: true });

// common/Utils/ControlKeys.js
var ControlKeys = {
	init() {
		this.subs = ["keydown", "keyup"].map((event) => {
			const handler = (e) => this.e = e;
			document.addEventListener(event, handler);
			return () => document.removeEventListener(event, handler);
		});
	},
	clean() {
		this.subs?.forEach((unsub) => unsub && typeof unsub === "function" && unsub());
	},
	get ctrlKey() {
		return this.e?.ctrlKey;
	},
	get shiftKey() {
		return this.e?.shiftKey;
	},
	get metaKey() {
		return this.e?.metaKey;
	}
};
Plugin_default.on(Events.START, () => {
	ControlKeys.init();
});
Plugin_default.on(Events.STOP, () => {
	ControlKeys.clean();
});
var ControlKeys_default = ControlKeys;

// MODULES-AUTO-LOADER:@Enums/ChannelTypeEnum
var ChannelTypeEnum_default = getModule(Filters.byKeys("GUILD_TEXT", "DM"), { searchExports: true }) || {
	"GUILD_TEXT": 0,
	"GUILD_VOICE": 2,
	"GUILD_CATEGORY": 4
};

// src/LazyLoadChannels/utils.js
function loadChannel(channel, messageId) {
	ChannelActions_default.fetchMessages({
		channelId: channel.id,
		guildId: channel.guild_id,
		messageId
	});
}

function shouldLoad({ guild_id, id, type }) {
	return ControlKeys_default.ctrlKey || type === ChannelTypeEnum_default.GUILD_VOICE && !Settings_default.state.lazyLoadVoice || !guild_id && !Settings_default.state.lazyLoadDMs || ChannelsStateManager_default.getChannelstate(guild_id, id);
}

// src/LazyLoadChannels/components/LazyLoaderComponent.jsx
var LazyLoaderComponent_default = ({ channel, ret }) => {
	const [checked, setChecked] = React_default.useState(false);
	const [load, setLoad] = React_default.useState(shouldLoad(channel));
	const isDm = channel.guild_id === null;
	const loadChannelHandler = () => {
		if (checked) ChannelsStateManager_default.add("channels", channel.id);
		loadChannel(channel);
		setLoad(true);
	};
	return load ? ret : /* @__PURE__ */ React_default.createElement(
		"div", {
			id: COMPONENT_ID,
			style: { "visibility": "hidden", "height": "100%" }
		},
		/* @__PURE__ */
		React_default.createElement("div", { className: "logo" }),
		isDm ? /* @__PURE__ */ React_default.createElement("div", { className: "DM" }, /* @__PURE__ */ React_default.createElement("div", { className: "DMName" }, channel.rawRecipients.map((a) => `@${a.username}`).join(", "))) : /* @__PURE__ */ React_default.createElement("div", { className: "channel" }, /* @__PURE__ */ React_default.createElement("div", { className: "channelIcon" }, /* @__PURE__ */ React_default.createElement(
			"svg", {
				role: "img",
				"aria-label": "channel-icon",
				width: "24",
				height: "24",
				viewBox: "0 0 24 24"
			},
			/* @__PURE__ */
			React_default.createElement(
				"path", {
					fill: "currentColor",
					fillRule: "evenodd",
					clipRule: "evenodd",
					d: "M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"
				}
			)
		)), /* @__PURE__ */ React_default.createElement("div", { className: "channelName" }, channel.name)),
		/* @__PURE__ */
		React_default.createElement("div", { className: "title" }, "Lazy loading is Enabled!"),
		/* @__PURE__ */
		React_default.createElement("div", { className: "description" }, "This channel is lazy loaded, If you want to auto load this channel in the future, make sure you enable ", /* @__PURE__ */ React_default.createElement("b", null, "Auto load"), " down below before you load it."),
		/* @__PURE__ */
		React_default.createElement("div", { className: "controls" }, /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, /* @__PURE__ */ React_default.createElement(
			Button_default2, {
				onClick: loadChannelHandler,
				color: Button_default2?.Colors?.GREEN,
				size: Button_default2?.Sizes?.LARGE
			},
			"Load Channel"
		), /* @__PURE__ */ React_default.createElement(
			Switch_default, {
				label: "Auto load",
				className: `${checked} switch`,
				checked,
				onChange: setChecked
			}
		)))
	);
};

// MODULES-AUTO-LOADER:@Stores/ChannelStore
var ChannelStore_default = getStore("ChannelStore");

// src/LazyLoadChannels/patches/patchChannelContent.jsx
Plugin_default.on(Events.START, () => {
	const controller = new AbortController();
	waitForModule(Filters.bySource(`name:"Channel",renderLoader`), { signal: controller.signal, raw: true }).then(({ declarations: ChannelRenderer }) => {
		const key = getObjectKey(ChannelRenderer, Filters.byStrings("ChannelRenderer"));
		if (!key) return Logger_default.patchError("ChannelRenderer");
		Patcher.after(ChannelRenderer, key, (_, [{ match: { params: { channelId, guildId } } }], ret) => {
			const channel = ChannelStore_default.getChannel(channelId);
			if (!channel) return ret;
			return /* @__PURE__ */ React_default.createElement(
				ErrorBoundary, {
					id: "LazyLoaderComponent",
					passMetaProps: true,
					fallback: ErrorFallbackComponent_default,
					plugin: Config_default.info.name
				},
				/* @__PURE__ */
				React_default.createElement(
					LazyLoaderComponent_default, {
						key: channelId,
						channel,
						ret
					}
				)
			);
		});
	});
	Plugin_default.once(Events.STOP, () => controller.abort());
});

// src/LazyLoadChannels/patches/patchContextMenu.js
Plugin_default.on(Events.START, () => {
	const unpatch = [
		ContextMenu.patch("user-context", (retVal, { channel, targetIsUser }) => {
			if (targetIsUser) return;
			if (!Settings_default.state.lazyLoadDMs) return;
			retVal.props.children.splice(
				1,
				0,
				ContextMenu.buildItem({
					type: "toggle",
					label: "Auto load",
					active: ChannelsStateManager_default.getChannelstate(channel.guild_id, channel.id),
					action: () => ChannelsStateManager_default.toggelChannel(channel.guild_id, channel.id)
				})
			);
		}),
		ContextMenu.patch("guild-context", (retVal, { guild }) => {
			if (guild)
				retVal.props.children.splice(
					1,
					0,
					ContextMenu.buildItem({
						type: "toggle",
						label: "Auto load",
						active: ChannelsStateManager_default.has("guilds", guild.id),
						action: () => ChannelsStateManager_default.toggelGuild(guild.id)
					})
				);
		}),
		...["channel-context", "thread-context"].map(
			(context) => ContextMenu.patch(context, (retVal, { channel }) => {
				if (channel && channel.type !== ChannelTypeEnum_default.GUILD_CATEGORY)
					retVal.props.children.splice(
						1,
						0,
						ContextMenu.buildItem({
							type: "toggle",
							label: "Auto load",
							active: ChannelsStateManager_default.getChannelstate(channel.guild_id, channel.id),
							action: () => ChannelsStateManager_default.toggelChannel(channel.guild_id, channel.id)
						})
					);
			})
		),
		...["channel-context", "thread-context", "guild-context"].map((context) => ContextMenu.patch(context, (retVal) => retVal.props.children.splice(1, 0, ContextMenu.buildItem({ type: "separator" }))))
	];
	Plugin_default.once(Events.STOP, () => {
		unpatch.forEach((a) => a && typeof a === "function" && a());
	});
});

// MODULES-AUTO-LOADER:@Modules/CreateChannel
var CreateChannel_default = getModule((m) => m.createChannel, { searchExports: false });

// src/LazyLoadChannels/patches/patchCreateChannel.js
Plugin_default.on(Events.START, () => {
	if (!CreateChannel_default) return Logger_default.patchError("CreateChannel");
	Patcher.after(CreateChannel_default, "createChannel", (_, [{ guildId }], ret) => {
		if (!ChannelsStateManager_default.has("guilds", guildId))
			ret.then(({ body }) => {
				ChannelsStateManager_default.add("channels", body.id);
			});
	});
});

// src/LazyLoadChannels/patches/patchThread.js
Plugin_default.on(Events.START, () => {
	const controller = new AbortController();
	waitForModule(
		Filters.bySource("withGuildIcon", "thread", "collapsed"), { signal: controller.signal, raw: true }
	).then(({ declarations: TreadComponent }) => {
		const key = getObjectKey(TreadComponent, Filters.byComponentType(Filters.byStrings("0nZpiF", "isThread", "collapsed")));
		if (!key) return Logger_default.patchError("TreadComponent");
		Patcher.after(TreadComponent[key], "type", (_, [{ thread }], ret) => {
			if (!Settings_default.state.autoloadedChannelIndicator) return;
			if (ChannelsStateManager_default.getChannelstate(thread.guild_id, thread.id)) ret.props.className += " autoload";
		});
	});
	Plugin_default.once(Events.STOP, () => controller.abort());
});

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true });

// src/LazyLoadChannels/ChannelHandlers.js
var ChannelHandlers_default = new class {
	init() {
		this.setupHandlers();
	}
	dispose() {
		this.handlers?.forEach?.((h) => h());
		this.handlers = null;
	}
	threadCreateHandler({ channelId }) {
		ChannelsStateManager_default.add("channels", channelId);
	}
	guildCreateHandler({ guild }) {
		if (!guild || !guild.id || !guild.channels || !Array.isArray(guild.channels)) return;
		const guildCreateDate = new Date(+guild.id / 4194304 + 14200704e5).toLocaleDateString();
		const nowDate = new Date(Date.now()).toLocaleDateString();
		if (guildCreateDate === nowDate) ChannelsStateManager_default.add("guilds", guild.id);
	}
	channelSelectHandler({ channelId, guildId, messageId }) {
		const channel = ChannelStore_default.getChannel(channelId);
		if (shouldLoad(channel)) loadChannel({ id: channelId, guild_id: guildId }, messageId);
	}
	guildDeleteHandler({ guild }) {
		ChannelsStateManager_default.remove("guilds", guild.id);
	}
	setupHandlers() {
		this.handlers = [
			["THREAD_CREATE_LOCAL", this.threadCreateHandler],
			["GUILD_CREATE", this.guildCreateHandler],
			["CHANNEL_SELECT", this.channelSelectHandler],
			["GUILD_DELETE", this.guildDeleteHandler]
		].map(([event, handler]) => {
			const boundHandler = handler.bind(this);
			Dispatcher_default.subscribe(event, boundHandler);
			return () => Dispatcher_default.unsubscribe(event, boundHandler);
		});
	}
}();

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
	return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
		Switch_default, {
			...rest,
			hasIcon: true,
			checked: val,
			label: description || settingKey,
			description: note,
			onChange: (e) => {
				set(e);
				onChange(e);
			}
		}
	), border && /* @__PURE__ */ React.createElement(Divider, { gap: 15 }));
}

// src/LazyLoadChannels/components/SettingComponent.jsx
var SettingComponent_default = () => {
	return /* @__PURE__ */ React_default.createElement(FieldSet, null, [{
			settingKey: "autoloadedChannelIndicator",
			description: "Auto load indicator.",
			note: "Whether or not to show an indicator for channels set to auto load"
		},
		{
			settingKey: "lazyLoadDMs",
			description: "Lazy load DMs.",
			note: "Whether or not to consider DMs for lazy loading"
		},
		{
			settingKey: "lazyLoadVoice",
			description: "Lazy load Voice channels.",
			note: "Whether or not to consider voice channels for lazy loading"
		}
	].map(SettingSwtich));
};

// src/LazyLoadChannels/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent_default, null);
Plugin_default.on(Events.START, () => {
	ChannelHandlers_default.init();
	EVENTS.forEach((event) => Dispatcher_default.unsubscribe(event, ChannelActions_default.actions[event]));
});
Plugin_default.on(Events.STOP, () => {
	ChannelHandlers_default.dispose();
	Patcher.unpatchAll();
	EVENTS.forEach((event) => Dispatcher_default.subscribe(event, ChannelActions_default.actions[event]));
});
module.exports = () => Plugin_default;
