/**
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to view the Avatar and banner.
 * @version 1.3.11
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "ViewProfilePicture",
		"version": "1.3.11",
		"description": "Adds a button to the user popout and profile that allows you to view the Avatar and banner.",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"showOnHover": false,
		"bannerColor": false
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
var findInTree = /* @__PURE__ */ (() => Api.Utils.findInTree)();

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
		const wrapper2 = () => {
			handler();
			this.off(event, wrapper2);
		};
		this.listeners[event].add(wrapper2);
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

// src/ViewProfilePicture/styles.css
StylesLoader_default.push(`/* View Profile Button */
.VPP-Button {
	background: rgb(1 0 1 / 54%);
	cursor: pointer;
	display: flex;
	border-radius: 50%;
	color: #fff;
	width: 32px;
	height: 32px;
	justify-content: center;
	align-items: center;
}

.VPP-Button svg {
	height: 18px;
	width: 18px;
}

/* Profile Modal_V2 */
.VPP-float {
	position: absolute;
	top: 12px;
	right: 12px;
	z-index: 3;
}

.VPP-Button:hover {
	background: rgb(1 0 1 / 64%);
}

.VPP-hover {
	opacity: 0;
}

.VPP-container:hover .VPP-hover {
	opacity: 1;
}
`);

// common/Utils/index.js
function fit({ width, height, gap = 0.8 }) {
	const ratio = Math.min(innerWidth / width, innerHeight / height);
	width = Math.round(width * ratio);
	height = Math.round(height * ratio);
	return {
		width,
		height,
		maxHeight: height * gap,
		maxWidth: width * gap
	};
}
var promiseHandler = (promise) => promise.then((data) => [void 0, data]).catch((err) => [err]);
var nop = () => {};

function getImageDimensions(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve({
			width: img.width,
			height: img.height
		});
		img.onerror = reject;
		img.src = url;
	});
}

// common/Utils/css.js
function join(...args) {
	const classNames = /* @__PURE__ */ new Set();
	for (const arg of args) {
		if (arg && typeof arg === "string") classNames.add(arg);
		else if (Array.isArray(arg)) arg.forEach((name) => classNames.add(name));
		else if (arg && typeof arg === "object") Object.entries(arg).forEach(([name, value]) => value && classNames.add(name));
	}
	return Array.from(classNames).join(" ");
}
var classNameFactory = (prefix = "", connector = "-") => (...args) => {
	const classNames = /* @__PURE__ */ new Set();
	for (const arg of args) {
		if (arg && typeof arg === "string") classNames.add(arg);
		else if (Array.isArray(arg)) arg.forEach((name) => classNames.add(name));
		else if (arg && typeof arg === "object") Object.entries(arg).forEach(([name, value]) => value && classNames.add(name));
	}
	return Array.from(classNames, (name) => `${prefix}${connector}${name}`).join(" ");
};

// common/React.jsx
var React_default = /* @__PURE__ */ (() => React)();

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

// common/Components/icons/ErrorIcon/index.jsx
var ErrorIcon_default = (props) => /* @__PURE__ */ React.createElement("div", { ...props }, /* @__PURE__ */ React.createElement(
	"svg", {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		fill: "red",
		width: "18",
		height: "18"
	},
	/* @__PURE__ */
	React.createElement(
		"path", {
			d: "M0 0h24v24H0z",
			fill: "none"
		}
	),
	/* @__PURE__ */
	React.createElement("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" })
));

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getById = /* @__PURE__ */ (() => Webpack.getById)();

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

// MODULES-AUTO-LOADER:@Modules/Tooltip
var Tooltip_default = getModule(Filters.byPrototypeKeys("renderTooltip"), { searchExports: true });

// common/Components/Tooltip/index.jsx
var Tooltip_default2 = ({ note, position, children }) => {
	return /* @__PURE__ */ React.createElement(
		Tooltip_default, {
			text: note,
			position: position || "top"
		},
		(props) => React.cloneElement(children, {
			...props,
			...children.props
		})
	);
};

// common/Components/icons/ImageIcon/index.jsx
function ImageIcon(props) {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "-50 -50 484 484",
			...props
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z" })
	);
}

// common/DiscordModules/Modules.js
var MediaViewerModal = /* @__PURE__ */ (() => getMangled("Media Viewer Modal", { MediaViewerModal: (a) => typeof a !== "string" }).MediaViewerModal)();

// MODULES-AUTO-LOADER:@Modules/Color
var Color_default = getModule(Filters.byKeys("Color", "hex", "hsl"), { searchExports: false });

// src/ViewProfilePicture/components/VPPButton.jsx
function getColorImg(color) {
	const canvas = document.createElement("canvas");
	const width = window.innerWidth * 0.7;
	const height = window.innerHeight * 0.5;
	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = Color_default(color || "#555").hex();
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	return {
		url: canvas.toDataURL(),
		...fit({ width, height })
	};
}
async function getFittedDims(url) {
	const [err, dims] = await promiseHandler(getImageDimensions(url));
	return err ? {} : fit(dims);
}
var palletHook = getModule(Filters.byStrings("toHexString", "toHsl", "palette"), { searchExports: true }) || {};
var VPPButton_default = ({ className, user, displayProfile }) => {
	const showOnHover = Settings_default(Settings_default.selectors.showOnHover);
	const colorFromPfp = palletHook(user.getAvatarURL(displayProfile?.guildId, 80))[0];
	const handler = async () => {
		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const bannerURL = displayProfile.getBannerURL({ canAnimate: true, size: 4096 });
		const color = displayProfile.accentColor || displayProfile.primaryColor || colorFromPfp;
		const items = [{
				url: avatarURL,
				...fit({ width: 4096, height: 4096 })
			},
			bannerURL && {
				url: bannerURL,
				...await getFittedDims(displayProfile.getBannerURL({ canAnimate: true, size: 20 }))
			},
			(!bannerURL || Settings_default.getState().bannerColor) && getColorImg(color)
		].filter(Boolean).map((a) => ({ "type": "IMAGE", ...a }));
		MediaViewerModal({ items });
	};
	return /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: "View profile picture" }, /* @__PURE__ */ React_default.createElement(
		"div", {
			onClick: handler,
			className: join(className, showOnHover && "VPP-hover")
		},
		/* @__PURE__ */
		React_default.createElement(ImageIcon, null)
	));
};

// src/ViewProfilePicture/patches/patchVPPButton.jsx
var UserProfileModalforwardRef = getModule(Filters.byKeys("Overlay", "render"));
var wrapper = getById(587168).A;
var UserProfileBanner = getMangled(Filters.bySource("avatarOffsetX", "foreignObject"), {
	Banner: Filters.byStrings("canUsePremiumProfileCustomization")
});
Plugin_default.on(Events.START, () => {
	Patcher.after(UserProfileBanner, "Banner", (_, [props], ret) => {
		if (props.themeType !== "MODAL_V2") return ret;
		return [
			ret,
			/* @__PURE__ */
			React.createElement(
				ErrorBoundary, {
					id: "VPPButton",
					plugin: Config_default.info.name,
					fallback: /* @__PURE__ */ React.createElement(ErrorIcon_default, { className: "VPP-Button" })
				},
				/* @__PURE__ */
				React.createElement(
					VPPButton_default, {
						className: join("VPP-Button", "VPP-float"),
						user: props.user,
						displayProfile: props.displayProfile
					}
				)
			)
		];
	});
	Patcher.after(UserProfileModalforwardRef, "render", (_, [props], ret) => {
		ret.props.className = `${ret.props.className} VPP-container`;
		const target = findInTree(ret, (a) => a?.type === wrapper, { walkable: ["props", "children"] });
		if (!target) return;
		const children = Array.isArray(target.props.children) ? target.props.children : [target.props.children];
		children.unshift(
			/* @__PURE__ */
			React.createElement(
				ErrorBoundary, {
					id: "VPPButton",
					plugin: Config_default.info.name,
					fallback: /* @__PURE__ */ React.createElement(ErrorIcon_default, { className: "VPP-Button" })
				},
				/* @__PURE__ */
				React.createElement(
					VPPButton_default, {
						className: join("VPP-Button"),
						user: props.user,
						displayProfile: props.displayProfile
					}
				)
			)
		);
		target.props.children = children;
	});
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
	return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
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
	), border && /* @__PURE__ */ React.createElement(Divider, { gap: 15 }));
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

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

// common/Components/FieldSet/index.jsx
var c2 = classNameFactory("fieldset");

function FieldSet({ label, description, children, contentGap = 16 }) {
	return /* @__PURE__ */ React_default.createElement("fieldset", { className: c2("container") }, label && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c2("label"),
			tag: "legend",
			variant: "text-lg/medium"
		},
		label
	), description && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c2("description"),
			variant: "text-sm/normal",
			color: "text-secondary"
		},
		description
	), /* @__PURE__ */ React_default.createElement("div", { className: c2("content"), style: { gap: contentGap } }, children));
}

// src/ViewProfilePicture/components/SettingComponent.jsx
function SettingComponent() {
	return /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [{
			settingKey: "showOnHover",
			note: "By default hide ViewProfilePicture button and show on hover.",
			description: "Show on hover"
		},
		{
			settingKey: "bannerColor",
			note: "Always include banner color in carousel, even if a banner is present.",
			description: "Include banner color."
		}
	].map(SettingSwtich));
}

// src/ViewProfilePicture/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent, null);
Plugin_default.on(Events.STOP, () => {
	Patcher.unpatchAll();
});
module.exports = () => Plugin_default;
