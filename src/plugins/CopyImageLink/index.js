module.exports = (Plugin, Api) => {
	const { getModule } = BdApi.Webpack;
	const {
		Logger,
		Toasts,
		Patcher,
		Utilities,
		PluginUtilities,
		DiscordModules: {
			React
		}
	} = Api;

	// Modules
	const ImageModal = getModule(m => m?.prototype?.render?.toString().includes("OPEN_ORIGINAL_IMAGE"));

	// Helper functions
	const Utils = {
		showToast: (content, type) => Toasts[type](`[${config.info.name}] ${content}`),
		copy: (data) => {
			DiscordNative.clipboard.copy(data);
			Utils.showToast(data, "info");
			Utils.showToast("Copied!", "success");
		}
	}

	// components
	const copyButton = require("components/copyButton.jsx");

	// styles
	const css = require("styles.css");

	return class CopyImageLink extends Plugin {
		constructor() {
			super();
		}

		onStart() {
			try {
				PluginUtilities.addStyle(this.getName(), css);
				Patcher.after(ImageModal.prototype, "render", (_, __, returnValue) => {
					const children = Utilities.getNestedProp(returnValue, "props.children");
					const { href } = Utilities.getNestedProp(returnValue, "props.children.2.props");
					children.push(React.createElement(copyButton, { onClick: e => Utils.copy(href) }));
				});
			} catch (e) {
				Logger.err(e);
			}
		}

		onStop() {
			PluginUtilities.removeStyle(this.getName());
			Patcher.unpatchAll();
		}
	};
};