/**
 * @runAt idle
 * @name BetterSettings
 * @description Should make settings open faster
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/BetterSettings
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/BetterSettings/BetterSettings.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "BetterSettings",
		"version": "1.0.0",
		"description": "Should make settings open faster",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/BetterSettings/BetterSettings.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/BetterSettings",
		"creddit": "https://github.com/Vendicated/Vencord/tree/main/src/plugins/betterSettings",
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
var target = new EventTarget();

function wrap(handler2) {
	return (e) => {
		try {
			handler2.apply(null, e);
		} catch (err) {
			Logger_default.error(`Could not run [${e.type}] handler`, { handler: handler2 }, "\n", err);
		}
	};
}
var Plugin_default = {
	onLoad: (handler2, props) => target.addEventListener("LOAD", wrap(handler2), props),
	onStart: (handler2, props) => target.addEventListener("START", wrap(handler2), props),
	onStop: (handler2, props) => target.addEventListener("STOP", wrap(handler2), props),
	start() {
		target.dispatchEvent(new Event("LOAD"));
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
Plugin_default.onLoad(() => DOM.addStyle(styleLoader._styles.join("\n")));
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
function getObjectKey(object = {}, filter) {
	for (const key2 in object) {
		if (!filter(object[key2])) continue;
		return key2;
	}
}
var promiseHandler = (promise) => promise.then((data) => [void 0, data]).catch((err) => [err]);

function getNestedProp(obj, path) {
	return path.split(".").reduce((ob, prop) => ob?.[prop], obj);
}
var nop = () => {};

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getBySource = /* @__PURE__ */ (() => Webpack.getBySource)();
var getByPrototypeKeys = /* @__PURE__ */ (() => Webpack.getByPrototypeKeys)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getByKeys = /* @__PURE__ */ (() => Webpack.getByKeys)();

function getDeclarationAndKey(moduleFilter, declarationFilter, options = {}) {
	const module2 = getModule(moduleFilter, { ...options, raw: true });
	if (!module2?.declarations) return;
	const key2 = getObjectKey(module2.declarations, declarationFilter);
	return key2 ? { key: key2, module: module2.declarations } : void 0;
}

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
	for (const [key2, value] of Object.entries(state)) {
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
var FocusLock = /* @__PURE__ */ (() => {
	waitForModule(Filters.bySource(".containerRef,{disableReturn")).then((a) => {
		const key2 = getObjectKey(a, Filters.byStrings("containerRef"));
		FocusLock = a[key2];
	});
})();
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
	const { module: module2, key: key2 } = BaseLayer;
	if (!module2 || !key2) return Logger_default.error("BaseLayer");
	const origin = module2[key2];

	function run() {
		if (!Settings_default.state.disableFade) {
			module2[key2] = origin;
		} else module2[key2] = prepLayer;
	}
	run();
	const unsub = Settings_default.subscribe(Settings_default.selectors.disableFade, run);
	Plugin_default.onStop(() => {
		unsub();
		module2[key2] = origin;
	});
});

// common/Patcher/shared.js
var patch = /* @__PURE__ */ (() => {
	Plugin_default.onStop(() => Patcher.unpatchAll());
	return function patch2(type, object, key2, callback, once) {
		if (!isValid(object, key2))
			return Logger.error("Could not perform a patch, missing arguments", arguments);
		const caller = {
			after: (context, args, ret) => callback({ context, args, ret }),
			before: (context, args) => callback({ context, args }),
			instead: (context, args, fn) => callback({ context, args, fn })
		} [type];
		if (once) {
			const unpatch = Patcher[type](object, key2, (...args) => {
				unpatch();
				caller.apply(null, args);
			});
		} else return Patcher[type](object, key2, caller);
	};
})();

function isValid(object, key2) {
	return object && key2 && key2 in object;
}

// common/Patcher/lazy.js
var abortController = /* @__PURE__ */ (() => {
	Plugin_default.onStart(() => abortController = new AbortController());
	Plugin_default.onStop(() => abortController.abort());
	return new AbortController();
})();
async function lazy2(type, callback, { once, sourceFilter, exportsFilter, decFilter, ...rest } = {}) {
	if (!callback || !type || !sourceFilter || !(exportsFilter || decFilter)) {
		return Logger.error("lazyPatch has missing Arguments", arguments);
	}
	const promisedModule = waitForModule(sourceFilter, {
		...rest,
		raw: true,
		signal: abortController.signal
	});
	const [err, res] = await promiseHandler(promisedModule);
	if (err || !res) {
		return;
	}
	const object = exportsFilter ? res.exports : res.declarations;
	const key2 = getObjectKey(object, exportsFilter || decFilter);
	patch(type, object, key2, callback, once);
}
var after = (opts, callback) => lazy2("after", callback, opts);

// common/Patcher/index.js
var after2 = (...args) => patch("after", ...args);

// src/BetterSettings/patches/patchSettingMenuFadeAnimation.jsx
Plugin_default.onStart(() => {
	after({
			sourceFilter: Filters.bySource(`"data-mana-component":"layer-modal"`),
			exportsFilter: () => true
		},
		({ ret }) => {
			if (!Settings_default.state.disableFade) return;
			const target2 = getNestedProp(
				ret,
				"props.children.props.children.props.children.props.children.props"
			);
			if (!target2) return;
			after2(target2, "children", ({ ret: ret2 }) => /* @__PURE__ */ React_default.createElement("div", { ...ret2.props, style: {} }), true);
		}
	);
});

// common/Patcher/contextmenu.js
var patches = [];
Plugin_default.onStop(() => {
	patches.filter(Boolean).forEach((a) => a());
	patches = [];
});
var contextmenu_default = (id, callback) => {
	const undo = ContextMenu.patch(id, callback);
	patches.push(undo);
};

// src/BetterSettings/patches/patchSettingsContextMenu.jsx
function transformSettingsEntries(list) {
	const items = [];
	for (const item of list) {
		const { key: key2, props } = item;
		if (!props) continue;
		if (key2 === "profile_section") {
			items.push(item);
			items.push(ContextMenu.buildItem({ type: "separator" }));
			continue;
		}
		if (key2 === "user_section" || key2?.endsWith("_section") && props.label) {
			const label = key2 === "user_section" ? I18n.intl.string(I18n.t.cduTBL) : props.label;
			items.push(
				/* @__PURE__ */
				React_default.createElement(ContextMenu.Item, { ...props, key: key2, label, id: String(label) }, props.children)
			);
			continue;
		}
		items.push(item);
	}
	return items;
}
Plugin_default.onStart(() => {
	contextmenu_default("settings-menu", (ret, props) => {
		if (!Settings_default.state.organizeMenu) return;
		ret.props.children[0] = transformSettingsEntries(ret.props.children[0]);
	});
});

// src/BetterSettings/patches/patchSettingsMenuTransition.js
var SettingsMenuTransition = getBySource("headerId:void 0,headerIdIsManaged:!1");
var key = getObjectKey(SettingsMenuTransition, Number.isInteger);
Plugin_default.onStart(function handler() {
	if (!isValid(SettingsMenuTransition, key)) return patchError(handler);
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
	after({
			sourceFilter: Filters.bySource("SCROLLABLE_CUSTOM"),
			decFilter: Filters.byStrings("noticeRegionHiddenSidebar")
		},
		function patchStandardSidebar({ ret }) {
			if (!Settings_default.state.disableFade) return;
			const animatedDiv = getNestedProp(ret, "props.children.props.children.0");
			if (!animatedDiv) return;
			ret.props.children = /* @__PURE__ */ React_default.createElement("div", { ...animatedDiv.props });
		}
	);
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
	flex-direction: column;
	width: 100%;
	justify-content: flex-start;
}
`);

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

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
