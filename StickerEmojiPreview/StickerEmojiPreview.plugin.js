/**
 * @name StickerEmojiPreview
 * @description Adds a zoomed preview to those tiny Stickers and Emojis
 * @version 1.3.3
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/StickerEmojiPreview
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/StickerEmojiPreview/StickerEmojiPreview.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "StickerEmojiPreview",
		"version": "1.3.3",
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
var Api = new BdApi(Config_default.info.name);
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var Data = /* @__PURE__ */ (() => Api.Data)();
var React = /* @__PURE__ */ (() => Api.React)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
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
	start() {
		this.emit(Events.START);
	}
	stop() {
		this.emit(Events.STOP);
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
var useRef = /* @__PURE__ */ (() => React.useRef)();
var React_default = /* @__PURE__ */ (() => React)();

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();

function getModuleAndKey(filter, options) {
	let module2;
	const target = getModule((entry, m) => filter(entry) ? module2 = m : false, options);
	module2 = module2?.exports;
	if (!module2) return;
	const key = Object.keys(module2).find((k) => module2[k] === target);
	if (!key) return;
	return { module: module2, key };
}

// MODULES-AUTO-LOADER:@Patch/CloseExpressionPicker
var CloseExpressionPicker_default = getModuleAndKey(Filters.byStrings("activeView:null,activeViewType:null"), { searchExports: true }) || {};

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

// common/Utils/index.js
var nop = () => {};

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

// src/StickerEmojiPreview/patches/patchCloseExpressionPicker.js
Plugin_default.on(Events.START, () => {
	const { module: module2, key } = CloseExpressionPicker_default;
	if (!module2 || !key) return Logger_default.patchError("CloseExpressionPicker");
	const unpatch = Patcher.after(module2, key, (_, args, ret) => {
		Settings_default.setpreviewState(Settings_default.state.previewDefaultState);
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// MODULES-AUTO-LOADER:@Patch/ExpressionPickerInspector
var ExpressionPickerInspector_default = getModuleAndKey(Filters.byStrings("graphicPrimary", "titlePrimary"), { searchExports: false }) || {};

// common/DiscordModules/Modules.js
var DiscordPopout = /* @__PURE__ */ (() => getModule((a) => a?.prototype?.render && a.Animation, { searchExports: true }))();

// src/StickerEmojiPreview/Constants.js
var PREVIEW_SIZE = 300;
var PREVIEW_UNAVAILABLE = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="rgb(202 204 206)" d="M12 2C6.477 2 2 6.477 2 12C2 17.522 6.477 22 12 22C17.523 22 22 17.522 22 12C22 6.477 17.523 2 12 2ZM8 6C9.104 6 10 6.896 10 8C10 9.105 9.104 10 8 10C6.896 10 6 9.105 6 8C6 6.896 6.896 6 8 6ZM18 14C18 16.617 15.14 19 12 19C8.86 19 6 16.617 6 14V13H18V14ZM16 10C14.896 10 14 9.105 14 8C14 6.896 14.896 6 16 6C17.104 6 18 6.896 18 8C18 9.105 17.104 10 16 10Z"></path></svg>`;

// src/StickerEmojiPreview/components/PreviewComponent.jsx
var PreviewComponent_default = ({ target, previewComponent }) => {
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
		() => React_default.cloneElement(target, { ref })
	);
};

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

// src/StickerEmojiPreview/patches/patchPickerInspector.jsx
function getMediaInfo({ props, type }) {
	if (props.sticker) return [type, props];
	if (props.src) return [type, { src: props.src.replace(/([?&]size=)(\d+)/, `$1${PREVIEW_SIZE}`) || PREVIEW_UNAVAILABLE }];
	return ["img", null];
}

function getPreviewComponent(graphicPrimary) {
	const [TypeComponent, props] = getMediaInfo(graphicPrimary);
	return /* @__PURE__ */ React.createElement(
		TypeComponent, {
			...props,
			disableAnimation: false,
			size: PREVIEW_SIZE
		}
	);
}
Plugin_default.on(Events.START, () => {
	const { module: module2, key } = ExpressionPickerInspector_default;
	if (!module2 || !key) return Logger_default.patchError("ExpressionPickerInspector");
	const unpatch = Patcher.after(module2, key, (_, [{ graphicPrimary, titlePrimary }], ret) => {
		if (titlePrimary?.toLowerCase().includes("upload")) return;
		return /* @__PURE__ */ React.createElement(
			ErrorBoundary, {
				id: "PreviewComponent",
				plugin: Config_default.info.name,
				fallback: ret
			},
			/* @__PURE__ */
			React.createElement(
				PreviewComponent_default, {
					target: ret,
					previewComponent: getPreviewComponent(graphicPrimary)
				}
			)
		);
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// MODULES-AUTO-LOADER:@Modules/FormSwitch
var FormSwitch_default = getModule(Filters.byStrings("note", "tooltipNote"), { searchExports: true });

// common/Components/Switch/index.jsx
var Switch_default = getModule(Filters.byStrings('"data-toggleable-component":"switch"', 'layout:"horizontal"'), { searchExports: true }) || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("div", { style: { color: "#fff" } }, props.children, /* @__PURE__ */ React.createElement(
		"input", {
			type: "checkbox",
			checked: props.value,
			onChange: (e) => props.onChange(e.target.checked)
		}
	));
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ settingKey, note, onChange = nop, description, ...rest }) {
	const [val, set] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React.createElement(
		Switch_default, {
			...rest,
			checked: val,
			label: description || settingKey,
			description: note,
			onChange: (e) => {
				set(e);
				onChange(e);
			}
		}
	);
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
