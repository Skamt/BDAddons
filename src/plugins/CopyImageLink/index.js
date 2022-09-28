module.exports = (Plugin, Api) => {
	const {
		Patcher,
		Utilities,
		WebpackModules,
		PluginUtilities,
		DiscordModules: {
			React
		}
	} = Api;

	const ImageModal = WebpackModules.getModule(m => m?.prototype?.render?.toString().includes("OPEN_ORIGINAL_IMAGE"));
	const classes = {
		...WebpackModules.getByProps("downloadLink"),
		...WebpackModules.getByProps("anchorUnderlineOnHover")
	};

	const copyButton = require("components/copyButton.jsx");
	const css = Utilities.formatTString(require("styles.css"), classes);

	return class CopyImageLink extends Plugin {
		constructor() {
			super();
		}

		copyHandler(data) {
			DiscordNative.clipboard.copy(data);
			BdApi.showToast(data, { type: "info" });
			BdApi.showToast("Copied!", { type: "success" });
		}

		patch() {
			Patcher.after(ImageModal.prototype, "render", (_, __, returnValue) => {
				const children = Utilities.getNestedProp(returnValue, "props.children");
				const { href } = Utilities.getNestedProp(returnValue, "props.children.2.props");
				children.push(
					React.createElement(copyButton, {
						onClick: _ => this.copyHandler(href)
					})
				);
			});
		}

		clean() {
			PluginUtilities.removeStyle(this.getName());
			Patcher.unpatchAll();
		}
		
		onStart() {
			try {
				this.patch();
				PluginUtilities.addStyle(this.getName(), css);
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			try {
				this.clean();
			} catch (e) {
				console.error(e);
			}
		}
	};
};