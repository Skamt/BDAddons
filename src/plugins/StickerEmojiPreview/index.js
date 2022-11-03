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

	// Constants
	const PREVIEW_SIZE = 300;

	// components
	const previewComponent = require("components/PreviewComponent.jsx");
	
	// styles
	const css = require("styles.css");

	return class StickerEmojiPreview {
		start() {
			try {
				DOM.addStyle(config.info.name, css);
				Patcher.after(config.info.name, ExpressionPickerInspector, "Z", (_, [{ graphicPrimary }], ret) => {
					return React.createElement(previewComponent, {
						previewSize: PREVIEW_SIZE,
						target: ret,
						previewComponent : React.createElement(graphicPrimary.type,{
							...graphicPrimary.props,
							src : graphicPrimary.props.src?.replace(/([?&]size=)(\d+)/, `$1${PREVIEW_SIZE}`),
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
	};
}