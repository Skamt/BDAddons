module.exports = (Plugin, Api) => {
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

	const viewProfilePictureButton = require("components/viewProfilePictureButton.jsx");
	const css = Utilities.formatTString(require("styles.css"), classes);

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