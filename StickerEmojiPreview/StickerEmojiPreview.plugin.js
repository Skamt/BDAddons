/**
 * @name StickerEmojiPreview
 * @description Adds a zoomed preview to those tiny Stickers and Emojis
 * @version 1.2.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/StickerEmojiPreview
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/StickerEmojiPreview/StickerEmojiPreview.plugin.js
 */

const config = {
	"info": {
		"name": "StickerEmojiPreview",
		"version": "1.2.0",
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
}

const css = `
.stickersPreview {
	width:400px;
	font-size: 14px;
	background: var(--background-floating);
	border-radius: 5px;
	padding: .5em;
	box-shadow: var(--elevation-high);
}

.stickersPreview img{
	min-width:100%;
	max-width:100%;
}

.animated img{
	border:1px dashed #ff8f09;
	padding:1px;
	box-sizing:border-box;
}`;

const Api = new BdApi(config.info.name);
const DOM = Api.DOM;
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;

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

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return undefined;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return undefined;
	return { module, key };
}

const TheBigBoyBundle = getModule(Filters.byProps("openModal", "FormSwitch", "Anchor"), { searchExports: false });

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

const nop = () => {};

const ExpressionPickerInspector = getModuleAndKey(Filters.byStrings("EMOJI_IS_FAVORITE_ARIA_LABEL"), { searchExports: false }) || {};

const CloseExpressionPicker = getModuleAndKey(Filters.byStrings("activeView:null,activeViewType:null"), { searchExports: true }) || {};

const PREVIEW_SIZE = 300;
const PREVIEW_UNAVAILABLE = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="rgb(202 204 206)" d="M12 2C6.477 2 2 6.477 2 12C2 17.522 6.477 22 12 22C17.523 22 22 17.522 22 12C22 6.477 17.523 2 12 2ZM8 6C9.104 6 10 6.896 10 8C10 9.105 9.104 10 8 10C6.896 10 6 9.105 6 8C6 6.896 6.896 6 8 6ZM18 14C18 16.617 15.14 19 12 19C8.86 19 6 16.617 6 14V13H18V14ZM16 10C14.896 10 14 9.105 14 8C14 6.896 14.896 6 16 6C17.104 6 18 6.896 18 8C18 9.105 17.104 10 16 10Z"></path></svg>`;

const { Popout } = TheBigBoyBundle;

const PreviewComponent = ({ target, defaultState, setPreviewState, previewComponent }) => {
	const [show, setShow] = React.useState(defaultState);
	React.useEffect(() => {
		function keyupHandler(e) {
			if (e.key === "Control") {
				setPreviewState(!show);
				setShow(!show);
			}
		}
		document.addEventListener("keyup", keyupHandler);
		return () => document.removeEventListener("keyup", keyupHandler);
	}, [show]);

	return (
		React.createElement(Popout, {
			renderPopout: () => (
				React.createElement('div', {
					className: "stickersPreview",
					style: { width: `${PREVIEW_SIZE}px` },
				}, previewComponent)
			),
			shouldShow: show,
			position: "left",
			align: "bottom",
			animation: "3",
			spacing: 60,
		}, () => target)
	);
};

function getMediaInfo({ props, type }) {
	if (props.sticker) return [type, props];
	if (props.src) return [type, { src: props.src.replace(/([?&]size=)(\d+)/, `$1${PREVIEW_SIZE}`) || PREVIEW_UNAVAILABLE }];

	return ["img", null];
}

function getPreviewComponent(graphicPrimary) {
	const [TypeComponent, props] = getMediaInfo(graphicPrimary);

	return (
		React.createElement(TypeComponent, {
			...props,
			disableAnimation: false,
			size: PREVIEW_SIZE,
		})
	);
}

const patchPickerInspector = () => {
	/**
	 * Main patch for the plugin
	 */
	const { module, key } = ExpressionPickerInspector;
	if (module && key)
		Patcher.after(module, key, (_, [{ graphicPrimary, titlePrimary }], ret) => {
			if (titlePrimary?.toLowerCase().includes("upload")) return;
			return (
				React.createElement(ErrorBoundary, {
					id: "PreviewComponent",
					plugin: config.info.name,
					fallback: ret,
				}, React.createElement(PreviewComponent, {
					target: ret,
					defaultState: CloseExpressionPicker ? Settings.get("previewState") : false,
					setPreviewState: CloseExpressionPicker ? e => Settings.set("previewState", e) : nop,
					previewComponent: getPreviewComponent(graphicPrimary),
				}))
			);
		});
	else Logger.patch("UserBannerMask");
};

const patchCloseExpressionPicker = () => {
	/**
	 * a listener for when experession picker is closed
	 */
	const { module, key } = CloseExpressionPicker;
	if (module && key)
		Patcher.after(module, key, () => {
			Settings.set("previewState", Settings.get("previewDefaultState"));
		});
	else Logger.patch("CloseExpressionPicker");
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
			hideBorder: true,
			onChange: e => {
				props.onChange(e);
				setEnabled(e);
			},
		}, props.description)
	);
};

class StickerEmojiPreview {
	constructor() {
		Settings.init(config.settings);
	}

	start() {
		try {
			DOM.addStyle(css);
			patchPickerInspector();
			patchCloseExpressionPicker();
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
				description: "Preview open by default.",
				value: Settings.get("previewDefaultState"),
				onChange: e =>
					Settings.setMultiple({
						previewDefaultState: e,
						previewState: e
					}),
			})
		);
	}
}

module.exports = StickerEmojiPreview;
