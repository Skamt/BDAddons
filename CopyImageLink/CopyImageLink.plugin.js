/**
 * @name CopyImageLink
 * @description Adds (Copy Link) button next to (Open Original) under images
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/CopyImageLink
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js
 */
const config = {
	info: {
		name: "CopyImageLink",
		version: "1.0.0",
		description: "Adds (Copy Link) button next to (Open Original) under images",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/CopyImageLink",
		authors: [{
			name: "Skamt"
		}]
	}
};
class MissinZeresPluginLibraryClass {
	constructor() { this.config = config; }
	load() {
		BdApi.showConfirmationModal('Library plugin is needed',
			[`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`, `Please download it from the officiel website`, 'https://betterdiscord.app/plugin/ZeresPluginLibrary'], {
				confirmText: 'Ok'
			});
	}
	start() {}
	stop() {}
}

function initPlugin([Plugin, Api]) {
	const plugin = (Plugin, Api) => {
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
		const copyButton = ({ onClick }) => {
			return (
				React.createElement(React.Fragment, null,
					React.createElement("span", { className: "copyBtnSpan" }, "|"),
					React.createElement("a", {
						className: "downloadLink-1OAglv anchorUnderlineOnHover-2qPutX copyBtn",
						onClick: onClick
					}, "Copy link")));
		};;
		// styles
		const css = `.copyBtn {
	left: 95px;
	white-space: nowrap;
}

.copyBtnSpan {
	left: 85px;
	position: absolute;
	top: 100%;
	font-weight: 500;
	color: hsl(0, calc(var(--saturation-factor, 1) * 0%), 100%) !important;
	line-height: 30px;
	opacity: 0.5;
}`;
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
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ? MissinZeresPluginLibraryClass : initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
