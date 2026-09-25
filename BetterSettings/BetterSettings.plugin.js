/**
 * @runAt idle
 * @name BetterSettings
 * @description Should make settings open faster
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/BetterSettings
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/BetterSettings/BetterSettings.plugin.js
 * @credit https://github.com/Vendicated/Vencord/tree/main/src/plugins/betterSettings
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "BetterSettings",
		"version": "1.0.0",
		"description": "Should make settings open faster",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/BetterSettings/BetterSettings.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/BetterSettings",
		"credit": "https://github.com/Vendicated/Vencord/tree/main/src/plugins/betterSettings",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"forceLoad": true,
		"organizeMenu": true,
		"disableFade": true
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
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

// src/BetterSettings/styles.css
StylesLoader_default.push(`#settings-menu-BetterDiscord .bd-changelog-button{
	display:none;
}


[aria-activedescendant^="settings-menu-"] {
	--custom-floating-layer-max-height:90vh;
}`);

// common/React.jsx
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;

// common/Utils/index.js
function hasOwn(object, key2) {
	return object && key2 && key2 in object;
}

function getObjectKey(object = {}, filter) {
	for (const key2 in object) {
		if (!filter(object[key2])) continue;
		return key2;
	}
}

function getNestedProp(obj, path) {
	return path.split(".").reduce((ob, prop) => ob?.[prop], obj);
}
var nop = () => {};

// common/consts.js
var UNDEFINED_OBJECT_OR_KEY = "Undefined object or key";
var PATCH_ERROR = "Could not perform a patch";
var MISSING_ARGUMENTS = "Missing arguments";

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getBySource = /* @__PURE__ */ (() => Webpack.getBySource)();
var getByPrototypeKeys = /* @__PURE__ */ (() => Webpack.getByPrototypeKeys)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
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
		const key2 = getObjectKey(object, decFilter || filter);
		if (!object || !key2) throw UNDEFINED_OBJECT_OR_KEY;
		resolve([object, key2]);
	}).catch((cause) => Logger_default.warn(new Error(PATCH_ERROR, { cause })));
	return promise;
}

function getDeclarationAndKey(moduleFilter, declarationFilter, options = {}) {
	const module2 = getModule(moduleFilter, { ...options, raw: true });
	if (!module2?.declarations) return;
	const key2 = getObjectKey(module2.declarations, declarationFilter);
	return key2 ? [module2.declarations, key2] : void 0;
}

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

// common/DiscordModules/zustand.js
var zustand = /* @__PURE__ */ (() => getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
})?.zustand)();
var subscribeWithSelector = /* @__PURE__ */ (() => getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), {
	searchExports: true
}))();

function create(initialState) {
	const Store = zustand(initialState);
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
	for (const key2 of Object.keys(state)) {
		actions[`set${key2}`] = (newValue) => SettingsStore.setState({
			[key2]: newValue });
		selectors[key2] = (state2) => state2[key2];
	}
	Object.defineProperty(SettingsStore, "selectors", { value: Object.assign(selectors) });
	Object.assign(SettingsStore, actions);
	SettingsStore.subscribe(
		(state2) => state2,
		() => Data.save("settings", SettingsStore.state)
	);
	Object.assign(SettingsStore, {
		useSetting: (key2) => {
			const val = SettingsStore((state2) => state2[key2]);
			return [val, SettingsStore[`set${key2}`]];
		}
	});
	return SettingsStore;
})();

// common/DiscordModules/Modules.js
var ComponentDispatch = /* @__PURE__ */ (() => {
	waitForModule((m) => m.dispatchToLastSubscribed, { searchExports: true }).then((a) => {
		ComponentDispatch = a;
	});
})();
var FocusLock = /* @__PURE__ */ (() => getModule(Filters.byStrings(".containerRef,{disableReturn"), { searchExports: true }))();
var I18n = /* @__PURE__ */ (() => getByKeys("intl", "t"))();

// src/BetterSettings/patches/patchLayer.jsx
var BaseLayer = getDeclarationAndKey(
	Filters.bySource("this.renderArtisanalHack()"),
	Filters.byPrototypeKeys("animateIn")
);
var Classes = getByKeys("animating", "baseLayer", "bg", "layer", "layers");
var cl = classNameFactory("", "");

function Layer({ mode, baseLayer = false, ...props }) {
	const hidden = mode === "HIDDEN";
	const containerRef = React_default.useRef(null);
	React_default.useEffect(
		() => () => {
			ComponentDispatch.dispatch("LAYER_POP_START");
			ComponentDispatch.dispatch("LAYER_POP_COMPLETE");
		},
		[]
	);
	const node = /* @__PURE__ */ React_default.createElement(
		"div", {
			ref: containerRef,
			"aria-hidden": hidden,
			className: cl({
				[Classes.layer]: true,
				[Classes.baseLayer]: baseLayer,
				"stop-animations": hidden
			}),
			style: { opacity: hidden ? 0 : void 0 },
			...props
		}
	);
	return baseLayer ? node : /* @__PURE__ */ React_default.createElement(FocusLock, { containerRef }, node);
}

function prepLayer(props) {
	try {
		[FocusLock, ComponentDispatch, Classes.layer].forEach((e) => e.test);
	} catch {
		return props.children;
	}
	return /* @__PURE__ */ React_default.createElement(Layer, { ...props });
}
Plugin_default.onStart(() => {
	const [module2, key2] = BaseLayer;
	if (!module2 || !key2) return patchError("BaseLayer");
	const origin = module2[key2];

	function run() {
		if (!Settings_default.state.disableFade) {
			module2[key2] = origin;
		} else module2[key2] = prepLayer;
	}
	run();
	const unsub = Settings_default.subscribe(Settings_default.selectors.disableFade, run);
	Plugin_default.onStop(
		() => {
			unsub();
			module2[key2] = origin;
		}, { once: true }
	);
});

// common/Patcher/shared.js
Plugin_default.onStop(() => Patcher.unpatchAll());

function patchOnce(type, object, key2, callback) {
	const unpatch = Patcher[type](object, key2, (...args) => {
		unpatch();
		callback.apply(null, args);
	});
}

function patch(type, object, key2, callback, once) {
	if (!hasOwn(object, key2))
		return Logger.error("Could not perform a patch, missing arguments", arguments);
	const caller = {
		after: (context, args, ret) => callback({ context, args, ret }),
		before: (context, args) => callback({ context, args }),
		instead: (context, args, fn) => callback({ context, args, fn })
	} [type];
	return once ? patchOnce(type, object, key2, caller) : Patcher[type](object, key2, caller);
}

// common/Patcher/index.js
var after = (...args) => patch("after", ...args);
var afterOnce = (...args) => patch("after", ...args, true);

// src/BetterSettings/patches/patchSettingMenuFadeAnimation.jsx
Plugin_default.onStart(() => {
	lazy(Filters.byStrings(`"data-mana-component":"layer-modal"`), { searchExports: true }).then(
		(a) => {
			after(...a, ({ ret }) => {
				if (!Settings_default.state.disableFade) return;
				const target2 = getNestedProp(
					ret,
					"props.children.props.children.props.children.props.children.props"
				);
				if (!target2) return;
				afterOnce(target2, "children", ({ ret: ret2 }) => /* @__PURE__ */ React_default.createElement("div", { ...ret2.props, style: {} }));
			});
		}
	);
});

// common/Patcher/contextmenu.js
var contextmenuUnPatches = [];
Plugin_default.onStop(() => {
	contextmenuUnPatches.filter(Boolean).forEach((a) => a());
	contextmenuUnPatches = [];
});
var patch2 = (id, callback) => {
	const undo = ContextMenu.patch(id, callback);
	contextmenuUnPatches.push(undo);
};
var contextmenu_default = ContextMenu;

// src/BetterSettings/patches/patchSettingsContextMenu.jsx
function transformSettingsEntries(list) {
	const items = [];
	for (const item of list) {
		const { key: key2, props } = item;
		if (!props) continue;
		if (key2 === "profile_section") {
			items.push(item);
			items.push(contextmenu_default.buildItem({ type: "separator" }));
			continue;
		}
		if (key2 === "user_section" || key2?.endsWith("_section") && props.label) {
			const label = key2 === "user_section" ? I18n.intl.string(I18n.t.cduTBL) : props.label;
			items.push(
				/* @__PURE__ */
				React_default.createElement(
					contextmenu_default.Item, {
						key: key2,
						...props,
						label,
						id: String(label)
					},
					props.children
				)
			);
			continue;
		}
		items.push(item);
	}
	return items;
}
Plugin_default.onStart(() => {
	patch2("settings-menu", (ret) => {
		if (!Settings_default.state.organizeMenu) return;
		ret.props.children[0] = transformSettingsEntries(ret.props.children[0]);
	});
});

// src/BetterSettings/patches/patchSettingsMenuTransition.js
var SettingsMenuTransition = getBySource("headerId:void 0,headerIdIsManaged:!1");
var key = getObjectKey(SettingsMenuTransition, Number.isInteger);
Plugin_default.onStart(() => {
	if (!hasOwn(SettingsMenuTransition, key)) return patchError(PATCH_ERROR);
	const origDelay = SettingsMenuTransition[key];

	function run() {
		if (!Settings_default.state.disableFade) {
			SettingsMenuTransition[key] = origDelay;
		} else SettingsMenuTransition[key] = 0;
	}
	run();
	const unsub = Settings_default.subscribe(Settings_default.selectors.disableFade, run);
	Plugin_default.onStop(
		() => {
			unsub();
			SettingsMenuTransition[key] = origDelay;
		}, { once: true }
	);
});

// src/BetterSettings/patches/patchStandardSidebarView.jsx
Plugin_default.onStart(() => {
	lazy(Filters.bySource("sidebarRegionScroller", "SCROLLABLE_CUSTOM"), {
		decFilter: Filters.byStrings("noticeRegionHiddenSidebar")
	}).then((StandardSidebar) => {
		after(...StandardSidebar, ({ ret }) => {
			if (!Settings_default.state.disableFade) return;
			const animatedDiv = getNestedProp(ret, "props.children.props.children.0");
			if (!animatedDiv) return;
			ret.props.children = /* @__PURE__ */ React_default.createElement("div", { ...animatedDiv.props });
		});
	});
});

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
	width: 100%;
	justify-content: flex-start;
}

.fieldset-content.fieldset-horizontal {
	flex-direction: row;
}

.fieldset-content.fieldset-vertical {
	flex-direction: column;
}`);

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = /* @__PURE__ */ (() => getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true }))();

// common/Components/FieldSet/index.jsx
var c = classNameFactory("fieldset");

function FieldSet({ label, description, children, gap = 15, direction = FieldSet.direction.VERTICAL }) {
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
	), /* @__PURE__ */ React_default.createElement(
		"div", {
			className: c("content", direction),
			style: { gap }
		},
		children
	));
}
FieldSet.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

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

// src/BetterSettings/forceLoadSettings.js
var SettingMenuModal = getByKeys("openUserSettings", "USER_SETTINGS_MODAL_KEY");
var some = getByPrototypeKeys("renderNameZone", { searchExports: true });
var instance = some ? new some() : null;
async function forceLoadStuff() {
	await BdApi.Utils.loadEntry(SettingMenuModal.openUserSettings);
	await BdApi.Utils.loadEntry(instance.handleOpenSettingsContextMenu);
}
var forceLoadSettingsMenu = () => {
	if (!Settings_default.state.forceLoad) return;
	forceLoadSettingsMenu = nop;
	forceLoadStuff();
};
Plugin_default.onStart(() => {
	forceLoadSettingsMenu();
	const unsub = Settings_default.subscribe(Settings_default.selectors.forceLoad, () => forceLoadSettingsMenu());
	Plugin_default.onStop(() => unsub(), { once: true });
});

// src/BetterSettings/index.jsx
Plugin_default.getSettingsPanel = () => () => /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [{
		description: "Organizes Settings contextmenu",
		settingKey: "organizeMenu"
	},
	{
		description: "Disable the crossfade animation",
		settingKey: "disableFade"
	},
	{
		description: "Force load settings menu",
		settingKey: "forceLoad"
	}
].map(SettingSwtich));
module.exports = () => Plugin_default;
