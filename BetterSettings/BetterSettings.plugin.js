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

// src/BetterSettings/styles.css
StylesLoader_default.push(`#settings-menu-BetterDiscord .bd-changelog-button{
	display:none;
}


[aria-activedescendant^="settings-menu-"] {
	--custom-floating-layer-max-height:90vh;
}`);

// common/React.jsx
var React_default = /* @__PURE__ */ (() => BdApi.React)();

// common/Utils/index.js
function getObjectKey(object = {}, filter) {
	for (const key in object) {
		if (!filter(object[key])) continue;
		return key;
	}
}

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
	const key = getObjectKey(module2.declarations, declarationFilter);
	return key ? { key, module: module2.declarations } : void 0;
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

// common/DiscordModules/Modules.js
var ComponentDispatch = /* @__PURE__ */ (() => {
	const filter = (m) => m.dispatchToLastSubscribed;
	const d = getModule(filter, { searchExports: true });
	if (d) return d;
	waitForModule(filter).then((a) => {
		ComponentDispatch = a;
	});
})();
var I18n = /* @__PURE__ */ (() => getByKeys("intl", "t"))();
var FocusLock = /* @__PURE__ */ (() => getMangled(Filters.bySource(".containerRef,{keyboardModeEnabled:"), { FocusLock: Filters.byStrings("containerRef") }).FocusLock)();

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
		Logger_default.error("Failed to find some components");
		return props.children;
	}
	return /* @__PURE__ */ React_default.createElement(Layer, { ...props });
}
Plugin_default.on(Events.START, () => {
	const { module: module2, key } = BaseLayer;
	if (!module2 || !key) return Logger_default.error("BaseLayer");
	const origin = module2[key];

	function run() {
		if (!Settings_default.state.disableFade) {
			module2[key] = origin;
		} else module2[key] = prepLayer;
	}
	run();
	const unsub = Settings_default.subscribe(Settings_default.selectors.disableFade, run);
	Plugin_default.on(Events.STOP, () => {
		unsub();
		module2[key] = origin;
	});
});

// src/BetterSettings/patches/patchSettingMenuFadeAnimation.jsx
Plugin_default.on(Events.START, () => {
	const controller = new AbortController();
	waitForModule(Filters.bySource(`"data-mana-component":"layer-modal"`), {
		signal: controller.signal,
		raw: true
	}).then(({ exports: exp }) => {
		const key = getObjectKey(exp, () => true);
		if (!key) return Logger_default.patchError("SettingsMenuFadeAnimation");
		Patcher.after(exp, key, (_, arg, ret) => {
			if (!Settings_default.state.disableFade) return;
			const target = getNestedProp(
				ret,
				"props.children.props.children.props.children.props.children.props"
			);
			if (!target) return;
			const unpatch = Patcher.after(target, "children", (_2, arg2, ret2) => {
				unpatch();
				return /* @__PURE__ */ React_default.createElement("div", { ...ret2.props, style: {} });
			});
		});
	});
	Plugin_default.once(Events.STOP, () => controller.abort());
});

// src/BetterSettings/patches/patchSettingsContextMenu.jsx
function transformSettingsEntries(list) {
	const items = [];
	for (const item of list) {
		const { key, props } = item;
		if (!props) continue;
		if (key === "profile_section") {
			items.push(item);
			items.push(ContextMenu.buildItem({ type: "separator" }));
			continue;
		}
		if (key === "user_section" || key?.endsWith("_section") && props.label) {
			const label = key === "user_section" ? I18n.intl.string(I18n.t.cduTBL) : props.label;
			items.push(
				/* @__PURE__ */
				React_default.createElement(ContextMenu.Item, { ...props, key, label, id: String(label) }, props.children)
			);
			continue;
		}
		items.push(item);
	}
	return items;
}
Plugin_default.on(Events.START, () => {
	const unpatch = ContextMenu.patch("settings-menu", (ret, props) => {
		if (!Settings_default.state.organizeMenu) return;
		ret.props.children[0] = transformSettingsEntries(ret.props.children[0]);
	});
	Plugin_default.on(Events.STOP, () => unpatch());
});

// src/BetterSettings/patches/patchSettingsMenuTransition.js
var SettingsMenuTransition = getBySource("headerId:void 0,headerIdIsManaged:!1");
Plugin_default.on(Events.START, () => {
	const delayKey = getObjectKey(SettingsMenuTransition, Number.isInteger);
	if (!delayKey) return Logger_default.patchError("SettingsMenuTransition");
	const origDelay = SettingsMenuTransition[delayKey];

	function run() {
		if (!Settings_default.state.disableFade) {
			SettingsMenuTransition[delayKey] = origDelay;
		} else SettingsMenuTransition[delayKey] = 0;
	}
	run();
	const unsub = Settings_default.subscribe(Settings_default.selectors.disableFade, run);
	Plugin_default.on(Events.STOP, () => {
		unsub();
		SettingsMenuTransition[delayKey] = origDelay;
	});
});

// src/BetterSettings/patches/patchStandardSidebarView.jsx
var ServerSettings = Plugin_default.on(Events.START, async () => {
	const controller = new AbortController();
	waitForModule(Filters.bySource("SCROLLABLE_CUSTOM"), {
		signal: controller.signal,
		raw: true
	}).then(({ declarations }) => {
		const key = getObjectKey(declarations, Filters.byStrings("noticeRegionHiddenSidebar"));
		if (!key) return Logger_default.patchError("patchServerSettings");
		Patcher.after(declarations, key, (_, arg, ret) => {
			if (!Settings_default.state.disableFade) return;
			const animatedDiv = getNestedProp(ret, "props.children.props.children.0");
			if (!animatedDiv) return;
			ret.props.children = /* @__PURE__ */ React_default.createElement("div", { ...animatedDiv.props });
		});
	});
	Plugin_default.once(Events.STOP, () => controller.abort());
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
	instance && await BdApi.Utils.loadEntry(instance.handleOpenSettingsContextMenu);
}
var forceLoadSettingsMenu = () => {
	if (!Settings_default.state.forceLoad) return;
	forceLoadSettingsMenu = nop;
	forceLoadStuff();
};
Plugin_default.on(Events.START, () => {
	forceLoadSettingsMenu();
	const unsub = Settings_default.subscribe(Settings_default.selectors.forceLoad, () => forceLoadSettingsMenu());
	Plugin_default.on(Events.STOP, () => unsub());
});

// src/BetterSettings/index.js
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
Plugin_default.on(Events.STOP, () => {
	Patcher.unpatchAll();
});
module.exports = () => Plugin_default;
