/**
 * @name StickerEmojiPreview
 * @description Adds a zoomed preview to those tiny Stickers and Emojis
 * @version 1.0.1
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/StickerEmojiPreview
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/StickerEmojiPreview/StickerEmojiPreview.plugin.js
 */
const config = {
	info: {
		name: "StickerEmojiPreview",
		version: "1.0.1",
		description: "Adds a zoomed preview to those tiny Stickers and Emojis",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/StickerEmojiPreview/StickerEmojiPreview.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/StickerEmojiPreview",
		authors: [{
			name: "Skamt"
		}]
	}
};
module.exports = (() => {
	const {
		DOM,
		React,
		Patcher,
		React: { useEffect, useState },
		Webpack: { Filters, getModule }
	} = BdApi;
	// Modules
	const Popout = getModule(Filters.byStrings('renderPopout', 'animationPosition'), { searchExports: true });
	const ExpressionPickerInspector = getModule((m) => m.Z && m.Z.toString().includes('EMOJI_IS_FAVORITE_ARIA_LABEL'));
	const SwitchRow = getModule(m => m.toString().includes('helpdeskArticleId'));
	// Constants
	const PREVIEW_SIZE = 300;
	// components
	const previewComponent = ({ target, previewComponent, previewSize, defaultState }) => {
		const [show, setShow] = useState(defaultState);
		useEffect(() => {
			function keyupHandler(e) {
				if (e.key === "Control")
					setShow(!show);
			}
			document.addEventListener("keyup", keyupHandler);
			return () => document.removeEventListener("keyup", keyupHandler);
		}, [show]);
		return (
			React.createElement(Popout, {
					renderPopout: () =>
						React.createElement("div", {
								className: "stickersPreview",
								style: { width: `${previewSize}px` }
							},
							previewComponent),
					shouldShow: show,
					position: Popout.Positions.LEFT,
					align: Popout.Align.BOTTOM,
					animation: Popout.Animation["SCALE"],
					spacing: 60
				},
				() => target));
	};
	const settingComponent = (props) => {
		const [enabled, setEnabled] = useState(props.value);
		return React.createElement(SwitchRow, {
			children: props.description,
			value: enabled,
			onChange: e => {
				props.onChange(e);
				setEnabled(e);
			}
		});
	}
	// styles
	const css = `.stickersPreview {
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
	return class StickerEmojiPreview {
		start() {
			try {
				this.settings = BdApi.loadData(config.info.name, "settings") || { previewDefaultState: false };
				DOM.addStyle(config.info.name, css);
				Patcher.after(config.info.name, ExpressionPickerInspector, "Z", (_, [{ graphicPrimary }], ret) => {
					return React.createElement(previewComponent, {
						previewSize: PREVIEW_SIZE,
						target: ret,
						defaultState: this.settings.previewDefaultState,
						previewComponent: React.createElement(graphicPrimary.type, {
							...graphicPrimary.props,
							src: graphicPrimary.props.src?.replace(/([?&]size=)(\d+)/, `$1${PREVIEW_SIZE}`),
							disableAnimation: false,
							size: PREVIEW_SIZE
						})
					})
				})
			} catch (e) {
				console.error(e);
			}
		}
		stop() {
			DOM.removeStyle(config.info.name);
			Patcher.unpatchAll(config.info.name);
		}
		getSettingsPanel() {
			return React.createElement(settingComponent, {
				description: "Preview open by default.",
				value: this.settings.previewDefaultState,
				onChange: e => {
					this.settings.previewDefaultState = e;
					BdApi.saveData(config.info.name, "settings", this.settings);
				}
			});
		}
	};
})();
