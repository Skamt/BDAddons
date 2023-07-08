/**
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to view the Avatar and banner.
 * @version 1.2.1
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */

const config = {
	"info": {
		"name": "ViewProfilePicture",
		"version": "1.2.1",
		"description": "Adds a button to the user popout and profile that allows you to view the Avatar and banner.",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"showOnHover": false
	},
	"changelog": [{
		"title": "Bug fix",
		"type": "fixed",
		"items": ["fixed issue with Clyde profile/banner not working properly"]
	}]
}

const css = `
/* Warning circle in popouts of users who left server overlaps VPP button */
svg:has(path[d="M10 0C4.486 0 0 4.486 0 10C0 15.515 4.486 20 10 20C15.514 20 20 15.515 20 10C20 4.486 15.514 0 10 0ZM9 4H11V11H9V4ZM10 15.25C9.31 15.25 8.75 14.691 8.75 14C8.75 13.31 9.31 12.75 10 12.75C10.69 12.75 11.25 13.31 11.25 14C11.25 14.691 10.69 15.25 10 15.25Z"]){
	top: 75px;
}

/* View Profile Button */
.VPP-Button{
    background-color: hsla(0,calc(var(--saturation-factor, 1)*0%),0%,.3);
    cursor: pointer;
    position: absolute;
    display: flex;
    padding: 5px;
    border-radius: 50%;
    top: 10px;
    color:#fff;
}

/* Popout */
.VPP-right{
    right:12px;
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

.VPP-profile.VPP-right{
    right:16px;
}

.VPP-profile.VPP-self{
	right: 58px;
}

.VPP-profile.VPP-left {
	left: 16px;
}

/* Bigger icon on profile */
.VPP-settings svg,
.VPP-profile svg{
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
.copyColorBtn{
	white-space: nowrap;
    position: absolute;
    top: 100%;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    line-height: 30px;
    transition: opacity .15s ease;
    opacity: .5;
}

.copyColorBtn:hover{
	opacity: 1;
    text-decoration: underline;
}

.VPP-hover {
    opacity:0;
}

.VPP-container:hover .VPP-hover{
    opacity:1;
}`;

const Api = new BdApi(config.info.name);

const UI = Api.UI;
const DOM = Api.DOM;
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;

const Settings = {
	_listeners: [],
	_settings: {},
	_commit() {
		Data.save("settings", this._settings);
		this._notify();
	},
	_notify() {
		this._listeners.forEach(listener => listener?.());
	},
	get(key) {
		return this._settings[key];
	},
	set(key, val) {
		this._settings[key] = val;
		this._commit();
	},
	setMultiple(newSettings) {
		this._settings = {
			...this._settings,
			...newSettings
		};
		this._commit();
	},
	init(defaultSettings) {
		this._settings = Data.load("settings") || defaultSettings;
	},
	addUpdateListener(listener) {
		this._listeners.push(listener);
		return () => this._listeners.splice(this._listeners.length - 1, 1);
	}
};

const Settings$1 = Settings;

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

function getNestedProp(obj, path) {
	return path.split(".").reduce(function(ob, prop) {
		return ob && ob[prop];
	}, obj);
}

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return undefined;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return undefined;
	return { module, key };
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
		this.p(console.error, ...args);
	},
	p(target, ...args) {
		target(`%c[${config.info.name}]`, "color: #3a71c1;font-weight: bold;", ...args);
	}
};

const ProfileTypeEnum = getModule(Filters.byProps("POPOUT", "SETTINGS"), { searchExports: true }) || {
	"POPOUT": 0,
	"MODAL": 1,
	"SETTINGS": 2,
	"PANEL": 3,
	"CARD": 4
};

const UserBannerMask = getModuleAndKey(Filters.byStrings("overrideAvatarDecorationURL"), { searchExports: true });

const SelectedGuildStore = getModule(m => m._dispatchToken && m.getName() === "SelectedGuildStore");

const ImageModal = getModule(Filters.byStrings("original", "maxHeight", "maxWidth", "noreferrer noopener"), { searchExports: true });

const RenderLinkComponent = getModule(m => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });

const Color = getModule(Filters.byProps("Color", "hex", "hsl"), { searchExports: false });

const TheBigBoyBundle = getModule(Filters.byProps("openModal", "FormSwitch", "Anchor"), { searchExports: false });

function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { type });
}

const Toast = {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
};

const ColorModalComponent = ({ color }) => (
	React.createElement('div', {
		className: "VPP-NoBanner",
		style: { backgroundColor: color },
	}, React.createElement('a', {
			className: "copyColorBtn",
			onClick: () => {
				copy(color);
				Toast.success(`${color} Copied!`);
			},
		}, "Copy Color"

	))
);

const ModalCarousel = getModule(Filters.byPrototypeFields("navigateTo", "preloadImage"), { searchExports: false });

const ModalRoot = getModule(Filters.byStrings("onAnimationEnd"), { searchExports: true });

const DisplayCarouselComponent = ({ props, items }) => {
	return (
		React.createElement(ModalRoot, {
			...props,
			className: "VPP-carousel carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM",
		}, React.createElement(ModalCarousel, {
			startWith: 0,
			className: "modalCarouselWrapper-YK1MX4",
			items: items.map(item => ({ "component": item })),
		}))
	);
};

class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };

	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;
			else {
				return (
					React.createElement('div', { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" }, }, React.createElement('b', { style: { color: "#e0e1e5" }, }, "An error has occured while rendering ", React.createElement('span', { style: { color: "orange" }, }, this.props.id)))
				);
			}
		} else return this.props.children;
	}
}

const ErrorComponent = props => (
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

function useSettings(key) {
	const target = Settings$1.get(key);
	const [state, setState] = React.useState(target);
	React.useEffect(() => {
		function settingsChangeHandler() {
			const newVal = Settings$1.get(key);
			setState(newVal);
		}
		return Settings$1.addUpdateListener(settingsChangeHandler);
	}, []);

	return state;
}

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
				}

				, React.createElement('svg', {
					'aria-label': tooltipProps["aria-label"],
					'aria-hidden': "false",
					role: "img",
					width: "18",
					height: "18",
					viewBox: "-50 -50 484 484",
				}, React.createElement('path', {
					fill: "currentColor",
					d: "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z",
				}))
			)
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

const SettingComponent = props => {
	const [enabled, setEnabled] = React.useState(props.value);
	return (
		React.createElement(Switch, {
			value: enabled,
			note: props.note,
			hideBorder: true,
			onChange: e => {
				props.onChange(e);
				setEnabled(e);
			},
		}, props.description)
	);
};

const changelogStyles = `
#changelog-container {
	font-family: "gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
	--added: #2dc770;
	--improved: #949cf7;
	--fixed: #f23f42;
	--notice: #f0b132;
	color:white;

    padding: 10px;
    max-width: 450px;
}
#changelog-container .title {
    text-transform: uppercase;
    display: flex;
    align-items: center;
    font-weight: 700;
    margin-top: 20px;
	color: var(--c);
}
#changelog-container .title:after {
    content: "";
    height: 1px;
    flex: 1 1 auto;
    margin-left: 8px;
    opacity: .6;
    background: currentColor;
}
#changelog-container ul {
    list-style: none;
    margin: 20px 0 8px 20px;
}
#changelog-container ul > li {
    position:relative;
    line-height: 20px;
    margin-bottom: 8px;
    color: #c4c9ce;
}
#changelog-container ul > li:before {
    content: "";
    position: absolute;
    background:currentColor;
    top: 10px;
    left: -15px;
    width: 6px;
    height: 6px;
    margin-top: -4px;
    margin-left: -3px;
    border-radius: 50%;
    opacity: .5;
}`;

class ChangelogComponent extends React.Component {
	constructor() {
		super();
	}

	componentWillUnmount() {
		BdApi.DOM.removeStyle("Changelog");
	}

	render() {
		BdApi.DOM.addStyle("Changelog", changelogStyles);
		const { id, changelog } = this.props;
		return React.createElement('div', { id: id, }, changelog);
	}
}

function showChangelog() {
	if (!config.changelog || !Array.isArray(config.changelog)) return;
	const changelog = config.changelog?.map(({ title, type, items }) => [
		React.createElement('h3', {
			style: { "--c": `var(--${type})` },
			className: "title",
		}, title),
		React.createElement('ul', null, items.map(item => (
			React.createElement('li', null, item)
		)))
	]);

	UI.showConfirmationModal(
		`${config.info.name} v${config.info.version}`,
		React.createElement(ChangelogComponent, {
			id: "changelog-container",
			changelog: changelog,
		})
	);
}

function shouldChangelog() {
	const { version = config.info.version, changelog = false } = Data.load("metadata") || {};
	if (version != config.info.version || !changelog) {
		Data.save("metadata", { version: config.info.version, changelog: true });
		return showChangelog;
	}
}

const getImageModalComponent = (Url, props) => (
	React.createElement(ImageModal, {
		...props,
		src: Url,
		original: Url,
		renderLinkComponent: p => React.createElement(RenderLinkComponent, { ...p, }),
	})
);

const IMG_WIDTH = 4096;

function openCarousel(items) {
	TheBigBoyBundle.openModal(props => (
		React.createElement(ErrorBoundary, {
			id: "DisplayCarouselComponent",
			plugin: config.info.name,
			closeModal: props.onClose,
		}, React.createElement(DisplayCarouselComponent, {
			props: props,
			items: items,
		}))
	));
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
		Settings$1.init(config.settings);
	}

	clickHandler(user, bannerObject, isUserPopout) {
		const { backgroundColor, backgroundImage } = bannerObject;
		const guildId = isUserPopout ? SelectedGuildStore.getGuildId() : "";
		const avatarURL = user.getAvatarURL(guildId, IMG_WIDTH, true);
		const AvatarImageComponent = getImageModalComponent(avatarURL, { width: IMG_WIDTH, height: IMG_WIDTH });
		const BannerImageComponent = backgroundImage ? getImageModalComponent(`${backgroundImage.match(/(?<=url\()(.+?)(?=\?|\))/)?.[0]}?size=${IMG_WIDTH}`, { width: IMG_WIDTH }) : React.createElement(ColorModalComponent, { color: Color ? Color(backgroundColor).hex() : backgroundColor, });
		openCarousel([AvatarImageComponent, BannerImageComponent]);
	}

	patchUserBannerMask() {
		const { module, key } = UserBannerMask;
		if (module && key)
			Patcher.after(module, key, (_, [{ user, profileType }], returnValue) => {
				if (profileType === ProfileTypeEnum.SETTINGS) return;

				returnValue.props.className += " VPP-container";

				const bannerObject = getNestedProp(returnValue, "props.children.1.props.children.props.style");
				const children = getNestedProp(returnValue, "props.children.1.props.children.props.children");

				const buttonClasses = getButtonClasses(user, profileType, bannerObject?.backgroundImage);

				if (Array.isArray(children) && bannerObject) {
					children.push(
						React.createElement(ErrorBoundary, {
							id: "ViewProfilePictureButtonComponent",
							plugin: config.info.name,
							fallback: React.createElement(ErrorComponent, { className: buttonClasses, }),
						}, React.createElement(ViewProfilePictureButtonComponent, {
							className: buttonClasses,
							onClick: () => this.clickHandler(user, bannerObject, ProfileTypeEnum.POPOUT === profileType),
						}))
					);
				}
			});
		else Logger.patch("patchUserBannerMask");
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
		return (
			React.createElement(SettingComponent, {
				description: "Show on hover",
				note: "By default hide ViewProfilePicture button and show on hover.",
				value: Settings$1.get("showOnHover"),
				onChange: e => Settings$1.set("showOnHover", e),
			})
		);
	}
}
shouldChangelog()?.();

module.exports = ViewProfilePicture;
