/**
 * @name ViewProfilePicture
 * @description description
 * @version 1.0.0
 * @author Skamt
 * @source https://github.com/Skamt/BDAddons/tree/main/release/ViewProfilePicture
 */
const config = {
	info: {
		name: "ViewProfilePicture",
		version: "1.0.0",
		description: "description",
		source: "https://github.com/Skamt/BDAddons/tree/main/release/ViewProfilePicture",
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
				React,
				React: { useState },
				ModalActions
			}
		} = Api;
		const UserBanner = WebpackModules.getModule(m => m.default.displayName === "UserBanner");
		const ImageModal = WebpackModules.getByDisplayName("ImageModal");
		const { ModalRoot } = WebpackModules.getByProps("ModalRoot");
		const { renderMaskedLinkComponent } = WebpackModules.getByProps("renderMaskedLinkComponent");
		const Tooltip = WebpackModules.getModule(m => m.default.displayName === "Tooltip").default;
		const classes = WebpackModules.getByProps("pencilContainer");
		const viewProfilePictureButton = ({ onClick, pencilContainer }) => {
			return (
				React.createElement(Tooltip, {
						text: "Show profile picture",
						position: "top"
					},
					(props) =>
					React.createElement("div", {
							...
							props,
							onClick: onClick,
							class: `${pencilContainer} viewProfilePicture`
						},
						React.createElement("svg", {
								"aria-label": "Redigera profilen",
								class: "pencilIcon-z04-c5",
								"aria-hidden": "false",
								role: "img",
								width: "18",
								height: "18",
								viewBox: "0 0 384 384"
							},
							React.createElement("path", {
								fill: "currentColor",
								d: "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z"
							})))));
		};;
		const css = Utilities.formatTString(`.\${premiumIconWrapper} + .viewProfilePicture {
	left: 12px;
	right: unset;
	background: var(--background-primary);
}

.\${pencilContainer} + .viewProfilePicture {
	right: 48px;
}

.viewProfilePicture path {
	transform: scale(0.8);
	transform-origin: center;
}
`, classes);
		return class ViewProfilePicture extends Plugin {
			constructor() {
				super();
			}
			ClickHandler(user) {
				const avatarURL = user.getAvatarURL().replace(/(\?size=\d+)/, "?size=4096");
				console.log(avatarURL);
				ModalActions.openModal(props => {
					return React.createElement(
						ModalRoot, { ...props, className: "modal-3Crloo" },
						React.createElement(ImageModal, {
							"src": avatarURL,
							"original": avatarURL,
							"animated": false,
							"placeholder": avatarURL,
							"className": "image-36HiZc",
							"shouldAnimate": true,
							"width": 4096,
							"height": 4096,
							"renderLinkComponent": renderMaskedLinkComponent
						})
					);
				});
			}
			patch() {
				Patcher.after(UserBanner, "default", (_, args, returnValue) => {
					const { user } = returnValue.props;
					returnValue.props.children.props.children.push(
						React.createElement(viewProfilePictureButton, {
							pencilContainer: classes.pencilContainer,
							onClick: e => {
								this.ClickHandler(user);
							}
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
			getSettingsPanel() {
				return this.buildSettingsPanel().getElement();
			}
		};
	};
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ? MissinZeresPluginLibraryClass : initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
