module.exports = () => {
	const {
		DOM,
		React,
		Patcher,
		React: { useEffect, useState },
		Webpack: { Filters, getModule }
	} = BdApi;

	// Modules
	const Popout = getModule(Filters.byStrings("renderPopout", "animationPosition"), { searchExports: true });
	const ExpressionPickerInspector = getModule((m) => m.Z && m.Z.toString().includes("EMOJI_IS_FAVORITE_ARIA_LABEL"));

	// Constants
	const PREVIEW_SIZE = 300;
	// components
	const previewComponent = require("components/previewComponent.jsx");
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