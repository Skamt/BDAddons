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
		const copyButton = ({ onClick }) => {
			return (
				React.createElement(React.Fragment, null,
					React.createElement("span", { className: "copyBtnSpan" }, "|"),
					React.createElement("a", {
						className: `${classes.downloadLink} ${classes.anchorUnderlineOnHover} copyBtn`,
						onClick: onClick
					}, "Copy link")));
		};;
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
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ? MissinZeresPluginLibraryClass : initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
