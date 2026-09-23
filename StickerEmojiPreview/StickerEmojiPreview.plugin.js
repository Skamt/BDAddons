/**
 * @runAt idle
 * @name StickerEmojiPreview
 * @description Adds a zoomed preview to those tiny Stickers and Emojis
 * @version 1.3.4
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/StickerEmojiPreview
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/StickerEmojiPreview/StickerEmojiPreview.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "StickerEmojiPreview",
		"version": "1.3.4",
		"description": "Adds a zoomed preview to those tiny Stickers and Emojis",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/StickerEmojiPreview/StickerEmojiPreview.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/StickerEmojiPreview",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"previewState": false,
		"previewDefaultState": false
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

// src/StickerEmojiPreview/styles.css
StylesLoader_default.push(`.stickersPreview {
	width: 400px;
	font-size: 14px;
	background: oklab(0.278867 0.00249027 -0.00875303);
	border-radius: 5px;
	padding: 0.5em;
	box-shadow: var(--elevation-high);
}

.stickersPreview img {
	min-width: 100%;
	max-width: 100%;
}

.animated img {
	border: 1px dashed #ff8f09;
	padding: 1px;
	box-sizing: border-box;
}
`);

// common/React.jsx
var useRef = /* @__PURE__ */ (() => BdApi.React.useRef)();
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;

// common/Utils/index.js
function hasOwn(object, key) {
	return object && key && key in object;
}
var nop = () => {};

// common/PAtcher/shared.js
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

// common/PAtcher/index.js
var after = (...args) => patch("after", ...args);

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();

function getModuleAndKey(filter, options) {
	let module2;
	const target2 = getModule((entry, m) => filter(entry) ? module2 = m : false, options);
	module2 = module2?.exports;
	if (!module2) return;
	const key = Object.keys(module2).find((k) => module2[k] === target2);
	if (!key) return;
	return [module2, key];
}

// MODULES-AUTO-LOADER:@Patch/CloseExpressionPicker
var CloseExpressionPicker_default = /* @__PURE__ */ (() => getModuleAndKey(Filters.byStrings("activeView:null,activeViewType:null"), { searchExports: true }) || {})();

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

// src/StickerEmojiPreview/patches/patchCloseExpressionPicker.js
Plugin_default.onStart(() => {
	after(...CloseExpressionPicker_default, (_, args, ret) => {
		Settings_default.setpreviewState(Settings_default.state.previewDefaultState);
	});
});

// MODULES-AUTO-LOADER:@Patch/ExpressionPickerInspector
var ExpressionPickerInspector_default = /* @__PURE__ */ (() => getModuleAndKey(Filters.byStrings("graphicPrimary", "titlePrimary"), { searchExports: false }) || {})();

// common/DiscordModules/Modules.js
var DiscordPopout = /* @__PURE__ */ (() => getModule((a) => a?.prototype?.render && a.Animation, { searchExports: true }))();

// src/StickerEmojiPreview/Constants.js
var PREVIEW_SIZE = 300;
var PREVIEW_UNAVAILABLE = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="rgb(202 204 206)" d="M12 2C6.477 2 2 6.477 2 12C2 17.522 6.477 22 12 22C17.523 22 22 17.522 22 12C22 6.477 17.523 2 12 2ZM8 6C9.104 6 10 6.896 10 8C10 9.105 9.104 10 8 10C6.896 10 6 9.105 6 8C6 6.896 6.896 6 8 6ZM18 14C18 16.617 15.14 19 12 19C8.86 19 6 16.617 6 14V13H18V14ZM16 10C14.896 10 14 9.105 14 8C14 6.896 14.896 6 16 6C17.104 6 18 6.896 18 8C18 9.105 17.104 10 16 10Z"></path></svg>`;

// src/StickerEmojiPreview/components/PreviewComponent.jsx
var PreviewComponent_default = ({ target: target2, previewComponent }) => {
	const [show, setShow] = Settings_default.useSetting("previewState");
	const ref = useRef();
	React_default.useEffect(() => {
		function keyupHandler(e) {
			if (e.key === "Control") {
				setShow(!show);
			}
		}
		document.addEventListener("keyup", keyupHandler);
		return () => document.removeEventListener("keyup", keyupHandler);
	}, [show]);
	return /* @__PURE__ */ React_default.createElement(
		DiscordPopout, {
			renderPopout: () => /* @__PURE__ */ React_default.createElement(
				"div", {
					className: "stickersPreview",
					style: { width: `${PREVIEW_SIZE}px` }
				},
				previewComponent
			),
			targetElementRef: ref,
			shouldShow: show,
			position: "left",
			align: "bottom",
			animation: "1",
			spacing: 60
		},
		() => React_default.cloneElement(target2, { ref })
	);
};

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary_default = (props) => /* @__PURE__ */ React_default.createElement(BdApi.Components.ErrorBoundary, { ...props, name: Config_default?.info?.name });

// src/StickerEmojiPreview/patches/patchPickerInspector.jsx
function getMediaInfo({ props, type }) {
	if (props.sticker) return [type, props];
	if (props.src)
		return [
			type,
			{ src: props.src.replace(/([?&]size=)(\d+)/, `$1${PREVIEW_SIZE}`) || PREVIEW_UNAVAILABLE }
		];
	return ["img", null];
}

function getPreviewComponent(graphicPrimary) {
	const [TypeComponent, props] = getMediaInfo(graphicPrimary);
	return /* @__PURE__ */ React_default.createElement(TypeComponent, { ...props, disableAnimation: false, size: PREVIEW_SIZE });
}
Plugin_default.onStart(() => {
	const { module: module2, key } = ExpressionPickerInspector_default;
	after(module2, key, (_, [{ graphicPrimary, titlePrimary }], ret) => {
		if (titlePrimary?.toLowerCase().includes("upload")) return;
		return /* @__PURE__ */ React_default.createElement(ErrorBoundary_default, { id: "PreviewComponent", fallback: ret }, /* @__PURE__ */ React_default.createElement(PreviewComponent_default, { target: ret, previewComponent: getPreviewComponent(graphicPrimary) }));
	});
});

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

// src/StickerEmojiPreview/components/SettingComponent.jsx
function SettingComponent() {
	return [{
		settingKey: "previewDefaultState",
		description: "Preview open by default.",
		onChange() {
			Settings_default.setpreviewState(Settings_default.state.previewDefaultState);
		}
	}].map(SettingSwtich);
}

// src/StickerEmojiPreview/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent, null);
module.exports = () => Plugin_default;
