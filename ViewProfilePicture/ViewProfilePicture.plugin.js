/**
 * @runAt idle
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to view the Avatar and banner.
 * @version 1.3.16
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "ViewProfilePicture",
		"version": "1.3.16",
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

// src/ViewProfilePicture/styles.css
StylesLoader_default.push(`/* View Profile Button */
.VPP-Button {
	background: rgb(1 0 1 / 54%);
	cursor: pointer;
	display: flex;
	border-radius: 50%;
	color: #fff;
	width: 32px !important;
	height: 32px !important;
	align-items: center;
	justify-content: center;
}

.VPP-Button svg {
	height: 16px;
	width: 16px;
}

/* Profile Modal_V2 */
.VPP-float {
	position: absolute;
	top: 12px;
	right: 12px;
	z-index: 3;
}

.VPP-float.isMe{
	left:12px;
	right:unset;
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

// common/Utils/Array.js
var add = (array, item, index) => array.toSpliced(index ?? array.length, 0, item);

// common/React.jsx
var useState = /* @__PURE__ */ (() => BdApi.React.useState)();
var useMemo = /* @__PURE__ */ (() => BdApi.React.useMemo)();
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;

function insertChild(el, child, index) {
	if (!el?.props?.children || !child) return;
	const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
	el.props.children = add(children, child, index);
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
var join = (...args) => Array.from(transform(...args)).join(" ");
var classNameFactory = (prefix = "", connector = "-") => (...args) => Array.from(transform(...args), (name) => `${prefix}${connector}${name}`).join(" ");

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary_default = (props) => /* @__PURE__ */ React_default.createElement(BdApi.Components.ErrorBoundary, { ...props, name: Config_default?.info?.name });

// common/Components/icons/ErrorIcon/index.jsx
var ErrorIcon_default = (props) => /* @__PURE__ */ React_default.createElement("div", { ...props }, /* @__PURE__ */ React_default.createElement(
	"svg", {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		fill: "red",
		width: "18",
		height: "18"
	},
	/* @__PURE__ */
	React_default.createElement(
		"path", {
			d: "M0 0h24v24H0z",
			fill: "none"
		}
	),
	/* @__PURE__ */
	React_default.createElement("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" })
));

// common/Utils/index.js
function hasOwn(object, key) {
	return object && key && key in object;
}

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

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = /* @__PURE__ */ (() => getStore("UserStore"))();

// common/DiscordModules/Modules.js
var Spinner = /* @__PURE__ */ (() => getModule((a) => a?.Type?.CHASING_DOTS, { searchExports: true }))();
var Color = /* @__PURE__ */ (() => getModule(Filters.byKeys("Color", "hex", "hsl"), { searchExports: false }))();
var MediaViewerModal = /* @__PURE__ */ (() => getMangled("Media Viewer Modal", { MediaViewerModal: (a) => typeof a !== "string" }).MediaViewerModal)();

// common/Utils/User.js
function isSelf(user) {
	const currentUser = UserStore_default.getCurrentUser();
	return user?.id === currentUser?.id;
}

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

// MODULES-AUTO-LOADER:@Modules/Tooltip
var Tooltip_default = /* @__PURE__ */ (() => getModule(Filters.byPrototypeKeys("renderTooltip"), { searchExports: true }))();

// common/Components/Tooltip/index.jsx
var Tooltip_default2 = ({ note, position, children }) => {
	return /* @__PURE__ */ React_default.createElement(
		Tooltip_default, {
			text: note,
			position: position || "top"
		},
		(props) => (
			// eslint-disable-next-line @eslint-react/no-clone-element
			React_default.cloneElement(children, {
				...props,
				...children.props
			})
		)
	);
};

// common/Components/icon/index.jsx
function svg(svgProps, ...paths) {
	return (comProps) => (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		/* @__PURE__ */
		React_default.createElement(
			"svg", {
				fill: "currentColor",
				width: "24",
				height: "24",
				viewBox: "0 0 24 24",
				...svgProps,
				...comProps
			},
			paths.map((p) => typeof p === "string" ? /* @__PURE__ */ path(null, p) : p)
		)
	);
}

function path(props, d) {
	return /* @__PURE__ */ React_default.createElement(
		"path", {
			...props,
			d
		}
	);
}
var ImageIcon = /* @__PURE__ */ svg({ viewBox: "-50 -50 484 484" }, "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z");

// common/Utils/Color.js
function colorToImg(c3) {
	const canvas = document.createElement("canvas");
	const width = window.innerWidth * 0.7;
	const height = window.innerHeight * 0.5;
	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = Color(c3 || "#555").hex();
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	return {
		url: canvas.toDataURL(),
		...fit({ width, height })
	};
}

// src/ViewProfilePicture/components/VPPButton.jsx
async function getFittedDims(url) {
	const [err, dims] = await promiseHandler(getImageDimensions(url));
	return err ? {} : fit(dims);
}
var palletHook = getModule(Filters.byStrings("toHexString", "toHsl", "palette"), { searchExports: true }) || {};
var VPPButton_default = ({ className, user, displayProfile }) => {
	const [fetching, setFetching] = useState(false);
	const showOnHover = Settings_default(Settings_default.selectors.showOnHover);
	const colorFromPfp = palletHook(user.getAvatarURL(displayProfile?.guildId, 80))[0];
	const handler = async () => {
		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const bannerURL = displayProfile.getBannerURL({ canAnimate: true, size: 4096 });
		const color = displayProfile.accentColor ?? (displayProfile.primaryColor || colorFromPfp);
		const items = [{
			url: avatarURL,
			...fit({ width: 4096, height: 4096 })
		}];
		if (bannerURL) {
			setFetching(true);
			items.push(
				bannerURL && {
					url: bannerURL,
					...await getFittedDims(displayProfile.getBannerURL({ canAnimate: true, size: 20 }))
				}
			);
			setFetching(false);
		}
		if (!bannerURL || Settings_default.state.bannerColor) items.push(colorToImg(color));
		MediaViewerModal({ items: items.map((a) => ({ type: "IMAGE", ...a })) });
	};
	return /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: "View profile picture" }, /* @__PURE__ */ React_default.createElement(
		"div", {
			onClick: fetching ? null : handler,
			className: join("VPP-Button", className, showOnHover && "VPP-hover")
		},
		fetching ? /* @__PURE__ */ React_default.createElement(Spinner, { type: Spinner.Type.SPINNING_CIRCLE_SIMPLE }) : /* @__PURE__ */ React_default.createElement(ImageIcon, null)
	));
};

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
var before = (...args) => patch("before", ...args);

// src/ViewProfilePicture/patches/UserProfileBanner.jsx
var UserProfileBanner = getMangled(Filters.bySource("themeType", "showGifTag", "canUsePremiumProfileCustomization"), {
	Banner: Filters.byStrings("canUsePremiumProfileCustomization")
});
Plugin_default.onStart(() => {
	after(UserProfileBanner, "Banner", ({ args: [props], ret }) => {
		if (props.themeType !== "MODAL_V2") return ret;
		const isMe = isSelf(props.user);
		return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, ret, /* @__PURE__ */ React_default.createElement(
			ErrorBoundary_default, {
				id: "UserProfileBanner",
				fallback: /* @__PURE__ */ React_default.createElement(ErrorIcon_default, { className: "VPP-Button" })
			},
			/* @__PURE__ */
			React_default.createElement(
				VPPButton_default, {
					className: join("VPP-float", { isMe }),
					user: props.user,
					displayProfile: props.displayProfile
				}
			)
		));
	});
});

// src/ViewProfilePicture/patches/UserProfileModal.jsx
var UserProfileModal = getModule(Filters.byKeys("Overlay", "render"));
Plugin_default.onStart(() => {
	before(UserProfileModal, "render", ({ args: [props] }) => {
		const target2 = useMemo(() => props?.children.find((a) => a?.props?.children && !a?.props?.className), [props?.children]);
		if (!target2) return;
		props.className = `${props.className} VPP-container`;
		insertChild(
			target2,
			/* @__PURE__ */
			React_default.createElement(
				ErrorBoundary_default, {
					id: "UserProfileModal",
					fallback: /* @__PURE__ */ React_default.createElement(ErrorIcon_default, { className: "VPP-Button" })
				},
				/* @__PURE__ */
				React_default.createElement(
					VPPButton_default, {
						user: props.user,
						displayProfile: props.displayProfile
					}
				)
			),
			0
		);
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
var c2 = classNameFactory("fieldset");

function FieldSet({ label, description, children, gap = 15, direction = FieldSet.direction.VERTICAL }) {
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
	), /* @__PURE__ */ React_default.createElement(
		"div", {
			className: c2("content", direction),
			style: { gap }
		},
		children
	));
}
FieldSet.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// src/ViewProfilePicture/components/SettingComponent.jsx
function SettingComponent() {
	return /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [{
			border: true,
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
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent, null);

// src/ViewProfilePicture/index.jsx
module.exports = () => Plugin_default;
