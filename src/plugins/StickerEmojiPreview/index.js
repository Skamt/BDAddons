module.exports = () => {
	const {
		DOM,
		React,
		Data,
		Patcher,
		React: { useEffect, useState },
		Webpack: { Filters, getModule }
	} = new BdApi(config.info.name);

	// Modules
	const Popout = DiscordModules.Popout;
	const ExpressionPickerInspector = DiscordModules.ExpressionPickerInspector;
	const SwitchRow = DiscordModules.SwitchRow;
	const DefaultEmojisManager = DiscordModules.DefaultEmojisManager;

	// Constants
	const PREVIEW_SIZE = 300;

	// Components
	const previewComponent = require("components/PreviewComponent.jsx");
	const settingComponent = (props) => {
		const [enabled, setEnabled] = useState(props.value);
		return React.createElement(SwitchRow, {
			value: enabled,
			onChange: e => {
				props.onChange(e);
				setEnabled(e);
			}
		}, props.description);
	}

	// styles
	const css = require("styles.css");

	return class StickerEmojiPreview {

		getMediaInfo({ props, type }, titlePrimary) {
			if (props.sticker)
				return [type, props];
			if (props.src)
				return [type, { src: props.src.replace(/([?&]size=)(\d+)/, `$1${PREVIEW_SIZE}`) }]
			if (titlePrimary)
				return ['img', { src: DefaultEmojisManager.getByName(titlePrimary.split(":")[1]).url }];

			return ['div', {}];
		}

		getPreviewComponent(graphicPrimary, titlePrimary) {
			const [type, props] = this.getMediaInfo(graphicPrimary, titlePrimary);

			return React.createElement(type, {
				...props,
				disableAnimation: false,
				size: PREVIEW_SIZE
			});
		}
		start() {
			try {
				this.settings = Data.load("settings") || { previewDefaultState: false };
				DOM.addStyle(css);
				Patcher.after(ExpressionPickerInspector, "Z", (_, [{ graphicPrimary, titlePrimary }], ret) => {
					return React.createElement(previewComponent, {
						target: ret,
						defaultState: this.settings.previewDefaultState,
						previewComponent: this.getPreviewComponent(graphicPrimary, titlePrimary)
					})
				});
			} catch (e) {
				console.error(e);
			}
		}

		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}

		getSettingsPanel() {
			return React.createElement(settingComponent, {
				description: "Preview open by default.",
				value: this.settings.previewDefaultState,
				onChange: e => {
					this.settings.previewDefaultState = e;
					Data.save("settings", this.settings);
				}
			});
		}
	};
}