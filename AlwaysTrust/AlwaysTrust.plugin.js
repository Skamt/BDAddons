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
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;

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
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();

// common/Utils/Logger.js
var Logger_default = Logger;

// common/Utils/index.js
function hasOwn(object, key) {
	return object && key && key in object;
}

function getObjectKey(object = {}, filter) {
	for (const key in object) {
		if (!filter(object[key])) continue;
		return key;
	}
}
var nop = () => {};

// common/consts.js
var UNDEFINED_OBJECT_OR_KEY = "Undefined object or key";
var PATCH_ERROR = "Could not perform a patch";
var MISSING_ARGUMENTS = "Missing arguments";

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

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();
var getByKeys = /* @__PURE__ */ (() => Webpack.getByKeys)();
var abortController = /* @__PURE__ */ (() => {
	Plugin_default.onStart(() => abortController = new AbortController());
	Plugin_default.onStop(() => abortController.abort());
	return new AbortController();
})();

function lazy(filter, { decFilter, ...options } = {}) {
	if (!filter) return Logger_default.error(`[Webpack lazy] ${MISSING_ARGUMENTS}`);
	const { promise, resolve } = Promise.withResolvers();
	waitForModule(filter, {
		...options,
		raw: true,
		fatal: false,
		signal: abortController.signal
	}).then((module2) => {
		if (!module2) throw "waitForModule resolved with undefined";
		const object = decFilter ? module2.declarations : module2.exports;
		const key = getObjectKey(object, decFilter || filter);
		if (!object || !key) throw UNDEFINED_OBJECT_OR_KEY;
		resolve([object, key]);
	}).catch((err) => Logger_default.error(PATCH_ERROR, err));
	return promise;
}

// common/Patcher/shared.js
Plugin_default.onStop(() => Patcher.unpatchAll());

function patchOnce(type, object, key, callback) {
	const unpatch = Patcher[type](object, key, (...args) => {
		unpatch();
		callback.apply(null, args);
	});
}

function patch(type, object, key, callback, once) {
	if (!hasOwn(object, key))
		return Logger.error("Could not perform a patch, missing arguments", arguments);
	const caller = {
		after: (context, args, ret) => callback({ context, args, ret }),
		before: (context, args) => callback({ context, args }),
		instead: (context, args, fn) => callback({ context, args, fn })
	} [type];
	return once ? patchOnce(type, object, key, caller) : Patcher[type](object, key, caller);
}

// common/Patcher/index.js
var after = (...args) => patch("after", ...args);

// common/DiscordModules/zustand.js
var zustand = /* @__PURE__ */ (() => getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
})?.zustand)();
var subscribeWithSelector = /* @__PURE__ */ (() => getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), {
	searchExports: true
}))();

function create(initialState) {
	const Store = /* @__PURE__ */ zustand(initialState);
	/* @__PURE__ */
	Object.defineProperty(Store, "state", {
		configurable: false,
		get: () => Store.getState()
	});
	return Store;
}

// common/Utils/Settings.js
var Settings_default = /* @__PURE__ */ (() => {
	const SettingsStore = create(
		subscribeWithSelector(() => Object.assign(Config_default.settings || {}, Data.load("settings") || {}))
	);
	const state = SettingsStore.getInitialState();
	const selectors = {};
	const actions = {};
	for (const key of Object.keys(state)) {
		actions[`set${key}`] = (newValue) => SettingsStore.setState({
			[key]: newValue });
		selectors[key] = (state2) => state2[key];
	}
	Object.defineProperty(SettingsStore, "selectors", { value: Object.assign(selectors) });
	Object.assign(SettingsStore, actions);
	SettingsStore.subscribe(
		(state2) => state2,
		() => Data.save("settings", SettingsStore.state)
	);
	Object.assign(SettingsStore, {
		useSetting: (key) => {
			const val = SettingsStore((state2) => state2[key]);
			return [val, SettingsStore[`set${key}`]];
		}
	});
	return SettingsStore;
})();

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
Plugin_default.onStart(() => DOM.addStyle(styleLoader._styles.join("\n")));
Plugin_default.onStop(() => DOM.removeStyle());
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
function transform(...args) {
	const classNames = /* @__PURE__ */ new Set();
	for (const arg of args) {
		if (arg && typeof arg === "string") classNames.add(arg);
		else if (Array.isArray(arg)) arg.forEach((name) => classNames.add(name));
		else if (arg && typeof arg === "object") Object.entries(arg).forEach(([name, value]) => value && classNames.add(name));
	}
	return classNames;
}
var classNameFactory = (prefix = "", connector = "-") => (...args) => Array.from(transform(...args), (name) => `${prefix}${connector}${name}`).join(" ");

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
				onChange?.(e);
			}
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, { gap: 15 }));
}

// MODULES-AUTO-LOADER:@Stores/GuildStore
var GuildStore_default = /* @__PURE__ */ (() => getStore("GuildStore"))();

// src/AlwaysTrust/index.jsx
var LinkPrompt = getModule(Filters.bySource(`="MaskedLinkStore",`), { declarationFilter: (a) => a?.prototype?.isTrustedDomain });
var FilePrompt = getMangled(Filters.bySource("github.com", "bitbucket.org", "gitlab.com"), { confirm: () => 1 });
var deleteGuild = getByKeys("deleteGuild", "sendTransferOwnershipPincode")?.deleteGuild;

function GetPropsAndDeleteGuild(id) {
	const GotGuild = GuildStore_default.getGuild(id);
	if (!GotGuild) return;
	deleteGuild(id, GotGuild.name);
}
Plugin_default.onStart(() => {
	after(LinkPrompt.prototype, "isTrustedDomain", ({ ret }) => Settings_default.state.domain ? true : ret);
	after(FilePrompt, "confirm", ({ ret }) => Settings_default.state.file ? null : ret);
	lazy(Filters.bySource("DELETE", "getSectionDefinition"), {
		decFilter: Filters.byStrings("isOwnerWithRequiredMfaLevel")
	}).then((GuildDelete) => {
		after(...GuildDelete, ({ args: [, { guild }], ret }) => {
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
});
Plugin_default.getSettingsPanel = () => () => [{
		border: true,
		description: "Domain prompt",
		note: "Remove the untrusted domain prompt when opening links",
		settingKey: "domain"
	},
	{
		border: true,
		description: "Download prompt",
		note: "Remove the 'Potentially Dangerous Download' prompt when opening links",
		settingKey: "file"
	},
	{
		border: true,
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
