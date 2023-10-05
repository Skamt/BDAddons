/**
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to view the Avatar and banner.
 * @version 1.2.3
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */

const config = {
	"info": {
		"name": "ViewProfilePicture",
		"version": "1.2.3",
		"description": "Adds a button to the user popout and profile that allows you to view the Avatar and banner.",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"showOnHover": false
	}
}

const css = `
/* Warning circle in popouts of users who left server overlaps VPP button */
svg:has(path[d="M10 0C4.486 0 0 4.486 0 10C0 15.515 4.486 20 10 20C15.514 20 20 15.515 20 10C20 4.486 15.514 0 10 0ZM9 4H11V11H9V4ZM10 15.25C9.31 15.25 8.75 14.691 8.75 14C8.75 13.31 9.31 12.75 10 12.75C10.69 12.75 11.25 13.31 11.25 14C11.25 14.691 10.69 15.25 10 15.25Z"]) {
	top: 75px;
}

/* View Profile Button */
.VPP-Button {
	background-color: hsla(0, calc(var(--saturation-factor, 1) * 0%), 0%, 0.3);
	cursor: pointer;
	position: absolute;
	display: flex;
	padding: 5px;
	border-radius: 50%;
	top: 10px;
	color: #fff;
}

/* Popout */
.VPP-right {
	right: 12px;
}

.VPP-left {
	left: 12px;
}

.VPP-self {
	right: 48px;
}

/* Profile */
.VPP-profile {
	top: 14px;
}

.VPP-profile.VPP-right {
	right: 16px;
}

.VPP-profile.VPP-self {
	right: 58px;
}

.VPP-profile.VPP-left {
	left: 16px;
}

/* Bigger icon on profile */
.VPP-settings svg,
.VPP-profile svg {
	height: 24px;
	width: 24px;
}

/* div replacement if No banner */
.VPP-NoBanner {
	width: 70vw;
	height: 50vh;
	position: relative;
}

/* Carousel Modal */
.VPP-carousel.carouselModal-1eUFoq:not(#idontthinkso) {
	height: auto;
	width: auto;
	position: static;
	box-shadow: none;
	transform: none !important;
	background: none;
}

.VPP-carousel .modalCarouselWrapper-YK1MX4 {
	position: static;
}

.VPP-carousel .arrowContainer-2wpC4q {
	margin: 0 15px;
	opacity: 0.8;
	background: var(--background-primary);
	border-radius: 50%;
}

.VPP-carousel .imageWrapper-oMkQl4.imageWrapperBackground-3Vss_C {
	min-height: 50vh;
}

.VPP-carousel .imageWrapper-oMkQl4 > img {
	max-height: 80vh;
}

/* Copy color button */
.VPP-copy-color-container {
	position: absolute;
	top: 100%;
	display: flex;
	cursor: pointer;
	gap: 5px;
	
}

.VPP-copy-color-label,
.VPP-copy-color {
	font-size: 14px;
	font-weight: 500;
	color: #fff;
	line-height: 30px;
	transition: opacity 0.15s ease;
	opacity: 0.5;
	text-transform: uppercase;
}

.VPP-copy-color:hover {
	opacity: 1;
	text-decoration: underline;
}

.VPP-separator {
	line-height: 30px;
	opacity: 0.5;
	color: #fff;
}

.VPP-copy-color-label {
	text-transform: capitalize;
}

.VPP-hover {
	opacity: 0;
}

.VPP-container:hover .VPP-hover {
	opacity: 1;
}

.VPP-colorFormat-options {
	display: flex;
}

.VPP-colorFormat-options > div {
	flex: 1;
}
`;

const Api = new BdApi(config.info.name);

const UI = Api.UI;
const DOM = Api.DOM;
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;
const Filters$1 = Api.Webpack.Filters;
const getInternalInstance = Api.ReactUtils.getInternalInstance;

const findInTree = Api.Utils.findInTree;

class ChangeEmitter {
	constructor() {
		this.listeners = new Set();
	}

	isInValid(handler) {
		return !handler || typeof handler !== "function";
	}

	on(handler) {
		if (this.isInValid(handler)) return;
		this.listeners.add(handler);
		return () => this.off(handler);
	}

	off(handler) {
		if (this.isInValid(handler)) return;
		this.listeners.delete(handler);
	}

	emit(payload) {
		for (const listener of this.listeners) {
			try {
				listener(payload);
			} catch (err) {
				console.error(`Could not run listener`, err);
			}
		}
	}
}

const Settings = new(class Settings extends ChangeEmitter {
	constructor() {
		super();
	}

	init(defaultSettings) {
		this.settings = Data.load("settings") || defaultSettings;
	}

	get(key) {
		return this.settings[key];
	}

	set(key, val) {
		this.settings[key] = val;
		this.commit();
	}

	setMultiple(newSettings) {
		this.settings = Object.assign(this.settings, newSettings);
		this.commit();
	}

	commit() {
		Data.save("settings", this.settings);
		this.emit();
	}
})();

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return undefined;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return undefined;
	return { module, key };
}

const ImageModal = getModule(Filters$1.byStrings("original", "maxHeight", "maxWidth", "noreferrer noopener"), { searchExports: true });

const ModalRoot = getModule(Filters$1.byStrings("onAnimationEnd"), { searchExports: true });

const RenderLinkComponent = getModule(m => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });

const TheBigBoyBundle = getModule(Filters$1.byProps("openModal", "FormSwitch", "Anchor"), { searchExports: false });

class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };

	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}

	renderErrorBoundary() {
		return (
			React.createElement('div', { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" }, }, React.createElement('b', { style: { color: "#e0e1e5" }, }, "An error has occured while rendering ", React.createElement('span', { style: { color: "orange" }, }, this.props.id)))
		);
	}

	renderFallback() {
		if (React.isValidElement(this.props.fallback)) {
			if (this.props.passMetaProps)
				this.props.fallback.props = {
					id: this.props.id,
					plugin: this.props.plugin,
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return (
			React.createElement(this.props.fallback, {
				id: this.props.id,
				plugin: this.props.plugin,
			})
		);
	}

	render() {
		if (!this.state.hasError) return this.props.children;
		return this.props.fallback ? this.renderFallback() : this.renderErrorBoundary();
	}
}

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

function getNestedProp(obj, path) {
	return path.split(".").reduce(function(ob, prop) {
		return ob && ob[prop];
	}, obj);
}

const UserStore = getModule(m => m._dispatchToken && m.getName() === "UserStore");

function isSelf(user) {
	const currentUser = UserStore.getCurrentUser();
	return user?.id === currentUser?.id;
}

const Logger = {
	error(...args) {
		this.p(console.error, ...args);
	},
	patch(patchId) {
		console.error(`%c[${config.info.name}] %c Error at %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
	},
	log(...args) {
		this.p(console.log, ...args);
	},
	p(target, ...args) {
		target(`%c[${config.info.name}]`, "color: #3a71c1;font-weight: bold;", ...args);
	}
};

const ErrorIcon = props => (
	React.createElement('div', { ...props, }, React.createElement('svg', {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		fill: "red",
		width: "18",
		height: "18",
	}, React.createElement('path', {
		d: "M0 0h24v24H0z",
		fill: "none",
	}), React.createElement('path', { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z", })))
);

const ProfileTypeEnum = getModule(Filters$1.byProps("POPOUT", "SETTINGS"), { searchExports: true }) || {
	"POPOUT": 0,
	"MODAL": 1,
	"SETTINGS": 2,
	"PANEL": 3,
	"CARD": 4
};

const UserBannerMask = getModuleAndKey(Filters$1.byStrings("showPremiumBadgeUpsell"), { searchExports: true });

const SelectedGuildStore = getModule(m => m._dispatchToken && m.getName() === "SelectedGuildStore");

function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { type });
}

const Toast = {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
};

const Color = getModule(Filters$1.byProps("Color", "hex", "hsl"), { searchExports: false });

function copyColor(type, color) {
	let c = color;
	try {
		switch (type) {
			case "hex":
				c = Color(color).hex();
				break;
			case "rgba":
				c = Color(color).css("rgba");
				break;
			case "hsla":
				c = Color(color).css("hsla");
				break;
		}
	} finally {
		copy(c);
		Toast.success(`${c} Copied!`);
	}
}

const ColorModalComponent = ({ color }) => (
	React.createElement('div', {
		className: "VPP-NoBanner",
		style: { backgroundColor: color },
	}, React.createElement('div', { className: "VPP-copy-color-container", }, React.createElement('a', { className: "VPP-copy-color-label", }, "Copy Color:"), React.createElement('a', {
			className: "VPP-copy-color",
			onClick: () => copyColor("hex", color),
		}, "hex"

	), React.createElement('span', { className: "VPP-separator", }, "|"), React.createElement('a', {
			className: "VPP-copy-color",
			onClick: () => copyColor("rgba", color),
		}, "rgba"

	), React.createElement('span', { className: "VPP-separator", }, "|"), React.createElement('a', {
			className: "VPP-copy-color",
			onClick: () => copyColor("hsla", color),
		}, "hsla"

	)))
);

const ModalCarousel = getModule(Filters$1.byPrototypeFields("navigateTo", "preloadImage"), { searchExports: false });

const DisplayCarouselComponent = ({ items }) => {
	return (
		React.createElement(ModalCarousel, {
			startWith: 0,
			className: "modalCarouselWrapper-YK1MX4",
			items: items.map(item => ({ "component": item })),
		})
	);
};

function useSettings(key) {
	const target = Settings.get(key);
	const [state, setState] = React.useState(target);
	React.useEffect(() => {
		function settingsChangeHandler() {
			const newVal = Settings.get(key);
			setState(newVal);
		}
		return Settings.on(settingsChangeHandler);
	}, []);

	return state;
}

getModule(Filters.byStrings("useStateFromStores"), { searchExports: true });

const { Tooltip } = TheBigBoyBundle;

const ViewProfilePictureButtonComponent = props => {
	const showOnHover = useSettings("showOnHover");
	return (
		React.createElement(Tooltip, {
			text: "View profile picture",
			position: "top",
		}, tooltipProps => (
			React.createElement('div', {
				...tooltipProps,
				...props,
				className: `${props.className} ${showOnHover && "VPP-hover"}`,
			}, React.createElement('svg', {
				'aria-label': tooltipProps["aria-label"],
				'aria-hidden': "false",
				role: "img",
				width: "18",
				height: "18",
				viewBox: "-50 -50 484 484",
			}, React.createElement('path', {
				fill: "currentColor",
				d: "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z",
			})))
		))
	);
};

const Switch = TheBigBoyBundle.FormSwitch ||
	function SwitchComponentFallback(props) {
		return (
			React.createElement('div', { style: { color: "#fff" }, }, props.children, React.createElement('input', {
				type: "checkbox",
				checked: props.value,
				onChange: e => props.onChange(e.target.checked),
			}))
		);
	};

function ShowOnHoverSwitch() {
	const [enabled, setEnabled] = React.useState(Settings.get("showOnHover"));
	return (
		React.createElement(Switch, {
				value: enabled,
				note: "By default hide ViewProfilePicture button and show on hover.",
				hideBorder: true,
				onChange: e => {
					Settings.set("showOnHover", e);
					setEnabled(e);
				},
			}, "Show on hover"

		)
	);
}

const SettingComponent = () => React.createElement(ShowOnHoverSwitch, null);

const getImageModalComponent = (url, rest) => (
	React.createElement(ImageModal, {
		...rest,
		src: url,
		original: url,
		renderLinkComponent: p => React.createElement(RenderLinkComponent, { ...p, }),
	})
);

const IMG_WIDTH = 4096;

function openCarousel(items) {
	TheBigBoyBundle.openModal(props => (
		React.createElement(ErrorBoundary, {
			id: "DisplayCarouselComponent",
			plugin: config.info.name,
		}, React.createElement(ModalRoot, {
			...props,
			className: "VPP-carousel carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM",
		}, React.createElement(DisplayCarouselComponent, { items: items, })))
	));
}

function closeModal() {
	const target = document.querySelector(".VPP-container");
	if (!target) return;
	const instance = getInternalInstance(target);
	if (!instance) return;
	const closeObj = findInTree(instance, a => a?.onClose, { walkable: ["return", "pendingProps"] });
	closeObj && closeObj.onClose && typeof closeObj.onClose === "function" && closeObj.onClose();
}

function getButtonClasses(user, profileType, banner) {
	let res = "VPP-Button";
	if (profileType === ProfileTypeEnum.MODAL) res += " VPP-profile";
	if (isSelf(user)) res += " VPP-self";
	else {
		if (banner) res += " VPP-left";
		else res += " VPP-right";
	}
	return res;
}

class ViewProfilePicture {
	constructor() {
		Settings.init(config.settings);
	}

	clickHandler(user, bannerObject, isUserPopout) {
		const { backgroundColor, backgroundImage } = bannerObject;
		const guildId = isUserPopout ? SelectedGuildStore.getGuildId() : "";
		const avatarURL = user.getAvatarURL(guildId, IMG_WIDTH, true);
		const AvatarImageComponent = getImageModalComponent(avatarURL, { width: IMG_WIDTH, height: IMG_WIDTH });
		const BannerImageComponent = backgroundImage ? getImageModalComponent(`${backgroundImage.match(/(?<=url\()(.+?)(?=\?|\))/)?.[0]}?size=${IMG_WIDTH}`, { width: IMG_WIDTH }) : React.createElement(ColorModalComponent, { color: backgroundColor, });
		closeModal();
		openCarousel([AvatarImageComponent, BannerImageComponent]);
	}

	patchUserBannerMask() {
		if (!UserBannerMask) return Logger.patch("patchUserBannerMask");

		const { module, key } = UserBannerMask;

		Patcher.after(module, key, (_, [{ user, profileType }], returnValue) => {
			if (profileType === ProfileTypeEnum.SETTINGS) return;

			returnValue.props.className += " VPP-container";

			const bannerObject = getNestedProp(returnValue, "props.children.props.style");
			const children = getNestedProp(returnValue, "props.children.props.children");

			const buttonClasses = getButtonClasses(user, profileType, bannerObject?.backgroundImage);

			if (Array.isArray(children) && bannerObject) {
				children.push(
					React.createElement(ErrorBoundary, {
						id: "ViewProfilePictureButtonComponent",
						plugin: config.info.name,
						fallback: React.createElement(ErrorIcon, { className: buttonClasses, }),
					}, React.createElement(ViewProfilePictureButtonComponent, {
						className: buttonClasses,
						onClick: () => this.clickHandler(user, bannerObject, ProfileTypeEnum.POPOUT === profileType),
					}))
				);
			}
		});
	}

	start() {
		try {
			DOM.addStyle(css);
			this.patchUserBannerMask();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}

	getSettingsPanel() {
		return React.createElement(SettingComponent, null);
	}
}

module.exports = ViewProfilePicture;
