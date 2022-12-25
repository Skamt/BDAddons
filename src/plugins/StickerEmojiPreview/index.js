module.exports = () => {
	const {
		DOM,
		React,
		Patcher,
		React: { useEffect, useState },
		Webpack: { Filters, getModule }
	} = BdApi;

	// Modules
	const Popout = DiscordModules.Popout;
	const ExpressionPickerInspector = DiscordModules.ExpressionPickerInspector;
	const SwitchRow = DiscordModules.SwitchRow;

	// Constants
	const PREVIEW_SIZE = 300;

	// components
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
}