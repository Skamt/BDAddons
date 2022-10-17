module.exports = (API) => {
	const {
		DOM,
		React,
		Patcher,
		React: { useEffect, useState },
		Webpack: { Filters, getModule }
	} = API;

	// Modules
	const Popout = getModule(Filters.byStrings("renderPopout", "animationPosition"), { searchExports: true });
	const ExpressionPickerInspector = getModule((m) => m.Z && m.Z.toString().includes("EMOJI_IS_FAVORITE_ARIA_LABEL"));

	// components
	const previewComponent = require("components/previewComponent.jsx");
	// styles
	const css = require("styles.css");

	return class StickerEmojiPreview {
		start() {
			try {
				DOM.addStyle(config.info.name, css);
				Patcher.after(config.info.name, ExpressionPickerInspector, "Z", (_, args, ret) => {
					if (ret.props.children[0].props.children.props.sticker)
						return React.createElement(previewComponent, {
							previewSize: 300,
							sticker: true,
							element: ret,
							data: ret.props.children[0].props.children.props.sticker
						})
					else {
						return React.createElement(previewComponent, {
							previewSize: 300,
							element: ret,
							data: ret.props.children[0].props.children.props.src || ""
						})
					}
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