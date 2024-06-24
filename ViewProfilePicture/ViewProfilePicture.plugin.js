/**
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to view the Avatar and banner.
 * @version 1.2.10
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */

const config = {
	"info": {
		"name": "ViewProfilePicture",
		"version": "1.2.10",
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
}

const Api = new BdApi(config.info.name);

const UI = Api.UI;
const DOM = Api.DOM;
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;
const findInTree = Api.Utils.findInTree;

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

const zustand = getModule(Filters.byStrings("subscribeWithSelector", "useReducer"), { searchExports: false });

const SettingsStoreSelectors = {};
const persistMiddleware = config => (set, get, api) => config(args => (set(args), Data.save("settings", get().getRawState())), get, api);

const SettingsStore = Object.assign(
	zustand(
		persistMiddleware((set, get) => {
			const settingsObj = Object.create(null);

			for (const [key, value] of Object.entries({
					...config.settings,
					...Data.load("settings")
				})) {
				settingsObj[key] = value;
				settingsObj[`set${key}`] = newValue => set({
					[key]: newValue });
				SettingsStoreSelectors[key] = state => state[key];
			}
			settingsObj.getRawState = () => {
				return Object.entries(get())
					.filter(([, val]) => typeof val !== "function")
					.reduce((acc, [key, val]) => {
						acc[key] = val;
						return acc;
					}, {});
			};
			return settingsObj;
		})
	), {
		useSetting: function(key) {
			return this(state => [state[key], state[`set${key}`]]);
		},
		selectors: SettingsStoreSelectors
	}
);

Object.defineProperty(SettingsStore, "state", {
	writeable: false,
	configurable: false,
	get() {
		return this.getState();
	}
});

const Settings = SettingsStore;

const TheBigBoyBundle = getModule(Filters.byProps("openModal", "FormSwitch", "Anchor"), { searchExports: false });

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

function SettingSwtich({ settingKey, note, hideBorder = false, description }) {
	const [val, set] = Settings.useSetting(settingKey);
	return (
		React.createElement(Switch, {
			value: val,
			note: note,
			hideBorder: hideBorder,
			onChange: set,
		}, description || settingKey)
	);
}

const SettingComponent = () => [{
		settingKey: "showOnHover",
		note: "By default hide ViewProfilePicture button and show on hover.",
		description: "Show on hover"
	},

	{
		settingKey: "bannerColor",
		note: "Always include banner color in carousel, even if a banner is present.",
		description: "Include banner color."
	}
].map(SettingSwtich);

class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };

	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${config?.info?.name || "Unknown Plugin"}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
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
					plugin: config?.info?.name || "Unknown Plugin",
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return (
			React.createElement(this.props.fallback, {
				id: this.props.id,
				plugin: config?.info?.name || "Unknown Plugin",
			})
		);
	}

	render() {
		if (!this.state.hasError) return this.props.children;
		return this.props.fallback ? this.renderFallback() : this.renderErrorBoundary();
	}
}

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

const { Tooltip } = TheBigBoyBundle;

const Tooltip$1 = ({ note, position, children }) => {
	return (
		React.createElement(Tooltip, {
			text: note,
			position: position || "top",
		}, props => {
			children.props = {
				...props,
				...children.props
			};
			return children;
		})
	);
};

function ImageIcon(props) {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "-50 -50 484 484",
			...props,
		}, React.createElement('path', { d: "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z", }))
	);
}

const RenderLinkComponent = getModule(m => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });

const ImageModal = getModule(Filters.byStrings("renderLinkComponent", "MEDIA_MODAL_CLOSE"), { searchExports: true });

const { ModalRoot, ModalSize } = TheBigBoyBundle;

const openModal = (children, tag, className) => {
	const id = `${tag ? `${tag}-` : ""}modal`;
	TheBigBoyBundle.openModal(props => {
		return (
			React.createElement(ErrorBoundary, {
				id: id,
				plugin: config.info.name,
			}, React.createElement(ModalRoot, {
				...props,
				className: className,
				onClick: props.onClose,
				size: ModalSize.DYNAMIC,
			}, children))
		);
	});
};

const getImageModalComponent = (url, rest = {}) => (
	React.createElement(ImageModal, {
		...rest,
		src: url,
		original: url,
		response: true,
		renderForwardComponent: () => null,
		renderLinkComponent: p => React.createElement(RenderLinkComponent, { ...p, }),
	})
);

const promiseHandler = promise => promise.then(data => [undefined, data]).catch(err => [err]);

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

function getImageDimensions(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () =>
			resolve({
				width: img.width,
				height: img.height
			});
		img.onerror = reject;
		img.src = url;
	});
}

function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { timeout: 5000, type });
}

const Toast = {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
};

const Color = getModule(Filters.byProps("Color", "hex", "hsl"), { searchExports: false });

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
		style: { backgroundColor: Color(color).css() },
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

const ModalCarousel$1 = getModule(Filters.byPrototypeFields("navigateTo", "preloadImage"), { searchExports: false });

class ModalCarousel extends ModalCarousel$1 {
	preloadNextImages() {}
}

const { Spinner } = TheBigBoyBundle;

function fit({ width, height }) {
	const ratio = Math.min(innerWidth / width, innerHeight / height);

	return {
		width: Math.round(width * ratio),
		height: Math.round(height * ratio)
	};
}

function Banner({ url, src }) {
	const [loaded, setLoaded] = React.useState(false);
	const dimsRef = React.useRef();

	React.useEffect(() => {
		(async () => {
			const [err, dims] = await promiseHandler(getImageDimensions(src));
			dimsRef.current = fit(err ? {} : dims);
			setLoaded(true);
		})();
	}, []);

	if (!loaded) return React.createElement(Spinner, { type: Spinner.Type.SPINNING_CIRCLE, });
	return getImageModalComponent(url, dimsRef.current);
}

const ViewProfilePictureButtonComponent = ({ className, user, displayProfile }) => {
	const showOnHover = Settings(Settings.selectors.showOnHover);
	if (showOnHover) className += " VPP-hover";

	const handler = () => {

		const avatarURL = user.getAvatarURL(displayProfile.guildId, 4096, true);
		const bannerURL = displayProfile.getBannerURL({ canAnimate: true, size: 4096 });

		const items = [
				getImageModalComponent(avatarURL, { width: 4096, height: 4096 }),
				bannerURL && (
					React.createElement(Banner, {
						url: bannerURL,
						src: displayProfile.getBannerURL({ canAnimate: true, size: 20 }),
					})
				),
				(!bannerURL || Settings.getState().bannerColor) && displayProfile.accentColor && React.createElement(ColorModalComponent, { color: displayProfile.accentColor, })
			]
			.filter(Boolean)
			.map(item => ({ component: item }));

		openModal(
			React.createElement(ModalCarousel, {
				startWith: 0,
				className: "VPP-carousel",
				items: items,
			}),
			"VPP-carousel",
			"VPP-carousel-modal"
		);
	};

	return (
		React.createElement(Tooltip$1, { note: "View profile picture", }, React.createElement('div', {
			role: "button",
			onClick: handler,
			className: className,
		}, React.createElement(ImageIcon, { height: "18", width: "18", })))
	);
};

const UserProfileModalforwardRef = getModule(Filters.byProps("Overlay", "render"));
const typeFilter = Filters.byStrings("BITE_SIZE", "FULL_SIZE");

const patchVPPButton = () => {
	if (!UserProfileModalforwardRef) return Logger.patch("patchVPPButton");

	Patcher.after(UserProfileModalforwardRef, "render", (_, [props], ret) => {
		const buttonsWrapper = findInTree(ret, a => typeFilter(a?.type), { walkable: ["props", "children"] });
		if (!buttonsWrapper) return;
		ret.props.className = `${ret.props.className} VPP-container`;
		buttonsWrapper.props.children = [

			React.createElement(ErrorBoundary, {
				id: "ViewProfilePictureButtonComponent",
				plugin: config.info.name,
				fallback: React.createElement(ErrorIcon, { className: "VPP-Button", }),
			}, React.createElement(ViewProfilePictureButtonComponent, {
				className: "VPP-Button",
				user: props.user,
				displayProfile: props.displayProfile,
			})),
			buttonsWrapper.props.children
		];
	});
};

class ViewProfilePicture {
	start() {
		try {

			DOM.addStyle(css);
			patchVPPButton();
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

const css = `/* View Profile Button */
.VPP-Button {
	background: hsl(var(--black-500-hsl)/.7);
	cursor: pointer;
	display: flex;
	border-radius: 50%;
	top: 10px;
	color: #fff;
	width: 32px;
	height: 32px;
	justify-content: center;
	align-items: center;
}

.VPP-Button:hover{
	background: hsl(var(--black-500-hsl)/.85);
}

/* div replacement if No banner */
.VPP-NoBanner {
	width: 70vw;
	height: 50vh;
	position: relative;
}

/* Carousel Modal */
.VPP-carousel-modal {
	background: #0000;
	width: 100vw;
	height: 100vh;
	box-shadow: none !important;
}

.VPP-carousel {
	position: static;
	margin: auto;
}

.VPP-carousel button {
	margin: 0 15px;
	opacity: 0.8;
	background: var(--background-primary);
	border-radius: 50%;
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
