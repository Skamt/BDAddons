/**
 * @runAt idle
 * @name AlwaysTrust
 * @description Removes the 'untrusted domain/suspicious file/server delete' confirmation prompts
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/AlwaysTrust
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/AlwaysTrust/AlwaysTrust.plugin.js
 * @credit https://github.com/Equicord/Equicord/tree/main/src/plugins/alwaysTrust
 */

// common/React.jsx
var React_default = /* @__PURE__ */ (() => BdApi.React)();

// config:@Config
var Config_default = {
	"info": {
		"name": "AlwaysTrust",
		"version": "1.0.0",
		"description": "Removes the 'untrusted domain/suspicious file/server delete' confirmation prompts",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/AlwaysTrust/AlwaysTrust.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/AlwaysTrust",
		"credit": "https://github.com/Equicord/Equicord/tree/main/src/plugins/alwaysTrust",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"domain": true,
		"confirmModal": true,
		"noDeleteSafety": true,
		"file": true
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger2 = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();

// common/Utils/index.js
function getObjectKey(object = {}, filter) {
	for (const key in object) {
		if (!filter(object[key])) continue;
		return key;
	}
}
var nop = () => {};

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();
var getByKeys = /* @__PURE__ */ (() => Webpack.getByKeys)();

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

// common/Components/Divider/index.jsx
var c = classNameFactory("divider");

function Divider({ gap = 15, gutter = 0, direction = Divider.direction.HORIZONTAL }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { "--divider-gap": `${gap}px`, "--divider-gutter": `${gutter}%` },
			className: c("base", direction)
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
				onChange(e);
			}
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, { gap: 15 }));
}

// MODULES-AUTO-LOADER:@Stores/GuildStore
var GuildStore_default = getStore("GuildStore");

// src/AlwaysTrust/index.js
var LinkPrompt = getModule(Filters.bySource(`="MaskedLinkStore",`), {
	declarationFilter: (a) => a.prototype.isTrustedDomain
});
var FilePrompt = getMangled(Filters.bySource("github.com", "bitbucket.org", "gitlab.com"), {
	confirm: () => 1
});
var deleteGuild = getByKeys("deleteGuild", "sendTransferOwnershipPincode").deleteGuild;

function GetPropsAndDeleteGuild(id) {
	const GotGuild = GuildStore_default.getGuild(id);
	if (!GotGuild) return;
	DeleteGuild(id, GotGuild.name);
}
Plugin_default.on(Events.START, () => {
	Patcher.after(
		LinkPrompt.prototype,
		"isTrustedDomain",
		(_, __, ret) => Settings_default.state.domain ? true : ret
	);
	Patcher.after(LinkPrompt, "confirm", (_, __, ret) => Settings_default.state.domain ? null : ret);
	const controller = new AbortController();
	waitForModule(Filters.bySource("DELETE", "getSectionDefinition"), {
		signal: controller.signal,
		raw: true
	}).then(({ declarations }) => {
		const key = getObjectKey(declarations, Filters.byStrings("isOwnerWithRequiredMfaLevel"));
		if (!key) return Logger.patchError("patchChannelAttach");
		Patcher.after(declarations, key, (_, [__, { guild }], ret) => {
			if (!Settings_default.state.noDeleteSafety || ret.section !== "DELETE") return;
			ret.onClick = () => {
				if (!Settings_default.state.confirmModal) return GetPropsAndDeleteGuild(guild.id);
				BdApi.UI.showConfirmationModal(
					"Delete server?",
					/* @__PURE__ */
					React_default.createElement(React_default.Fragment, null, "Are you sure you want to delete ", /* @__PURE__ */ React_default.createElement("b", null, guild.name), " ? ", /* @__PURE__ */ React_default.createElement("br", null), " ", /* @__PURE__ */ React_default.createElement("b", null, "This action cannot be undone.")), {
						danger: true,
						confirmText: "Delete",
						cancelText: "Cancel",
						onConfirm: () => GetPropsAndDeleteGuild(guild.id)
					}
				);
			};
		});
	});
	Plugin_default.once(Events.STOP, () => controller.abort());
});
Plugin_default.on(Events.STOP, () => {
	Patcher.unpatchAll();
});
Plugin_default.getSettingsPanel = () => () => [{
		border: true,
		description: "Domain prompt",
		note: "Remove the untrusted domain prompt when opening links",
		settingKey: "domain"
	},
	{
		description: "Download prompt",
		note: "Remove the 'Potentially Dangerous Download' prompt when opening links",
		settingKey: "file"
	},
	{
		description: "Server delete prompt",
		note: "Removes the enter server name prompt when deleting a server",
		settingKey: "noDeleteSafety"
	},
	{
		description: "Server delete confirm",
		note: "Show a simpler confirm prompt when deleting a server",
		settingKey: "confirmModal"
	}
].map(SettingSwtich);
module.exports = () => Plugin_default;
