/**
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to view the Avatar and banner.
 * @version 1.2.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */

const config = {
	"info": {
		"name": "ViewProfilePicture",
		"version": "1.2.0",
		"description": "Adds a button to the user popout and profile that allows you to view the Avatar and banner.",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture",
		"authors": [{
			"name": "Skamt"
		}]
	}
}

const css = `
/* Warning circle in popouts of users who left server overlaps VPP button */
svg.warningCircleIcon-2osUEe {
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

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => filter(entry) ? (module = m) : false, options);
	module = module?.exports;
	if (!module) return undefined;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return undefined;
	return { module, key };
}

const UserStore = getModule(m => m._dispatchToken && m.getName() === "UserStore");

function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { type });
}

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

function getNestedProp(obj, path) {
	return path.split(".").reduce(function(ob, prop) {
		return ob && ob[prop];
	}, obj);
}

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

const Color = getModule(Filters.byProps("cmyk", "hex", "hsl"), { searchExports: false });

const TheBigBoyBundle = getModule(Filters.byProps("openModal", "FormSwitch", "Anchor"), { searchExports: false });

const ColorModalComponent = ({ color }) => (
	React.createElement('div', {
		className: "VPP-NoBanner",
		style: { backgroundColor: color },
	}, React.createElement('a', {
			className: "copyColorBtn",
			onClick: () => {
				copy(color);
				showToast(`${color} Copied!`, "success");
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

const { Tooltip } = TheBigBoyBundle;

const ViewProfilePictureButtonComponent = props => {
	return (
		React.createElement(Tooltip, {
			text: "View profile picture",
			position: "top",
		}, p => (
			React.createElement('div', {
				...p,
				...props,
			}, React.createElement('svg', {
				'aria-label': p["aria-label"],
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

function getButtonClasses(user, profileType, banner, showOnHover) {
	let res = "VPP-Button";
	if (profileType === ProfileTypeEnum.MODAL) res += " VPP-profile";
	if (isSelf(user)) res += " VPP-self";
	else {
		if (banner) res += " VPP-left";
		else res += " VPP-right";
	}
	if (showOnHover) res += " VPP-hover";
	return res;
}

class ViewProfilePicture {
	constructor() {
		this.settings = Data.load("settings") || { showOnHover: false };
	}

	clickHandler(user, bannerObject, isUserPopout) {
		const { backgroundColor, backgroundImage } = bannerObject;
		const guildId = isUserPopout ? SelectedGuildStore.getGuildId() : "";
		const avatarURL = user.getAvatarURL(guildId, IMG_WIDTH, true);
		const AvatarImageComponent = getImageModalComponent(avatarURL, { width: IMG_WIDTH, height: IMG_WIDTH });
		const BannerImageComponent = backgroundImage ? getImageModalComponent(`${backgroundImage.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}`, { width: IMG_WIDTH }) : React.createElement(ColorModalComponent, { color: Color ? Color(backgroundColor).hex() : backgroundColor, });
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

				const buttonClasses = getButtonClasses(user, profileType, bannerObject?.backgroundImage, this.settings.showOnHover);

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
				value: this.settings.showOnHover,
				onChange: e => {
					this.settings.showOnHover = e;
					Data.save("settings", this.settings);
				},
			})
		);
	}
}

module.exports = ViewProfilePicture;
