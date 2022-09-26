module.exports = (Plugin, Api) => {
	const {
		Patcher,
		Utilities,
		WebpackModules,
		PluginUtilities,
		DiscordModules: {
			React,
			React: { useState },
			ModalActions,
			SelectedGuildStore
		}
	} = Api;

	const IMG_WIDTH = 4096;
	const UserBannerMask = WebpackModules.getModule(m => m.default.displayName === "UserBannerMask");
	const ImageModal = WebpackModules.getByDisplayName("ImageModal");
	const ModalCarousel = WebpackModules.getByDisplayName("ModalCarousel");
	const { ModalRoot } = WebpackModules.getByProps("ModalRoot");
	const { renderMaskedLinkComponent } = WebpackModules.getByProps("renderMaskedLinkComponent");
	const Tooltip = WebpackModules.getModule(m => m.default.displayName === "Tooltip").default;
	const classes = {
		...WebpackModules.getByProps("pencilContainer", "popoutNoBannerPremium"),
		...WebpackModules.getByProps("anchorUnderlineOnHover")
	};

	const viewProfilePictureButton = require("components/viewProfilePictureButton.jsx");
	const displayCarousel = require("components/displayCarousel.jsx");
	const copyButton = require("components/copyButton.jsx");
	const css = Utilities.formatTString(require("styles.css"), classes);

	return class ViewProfilePicture extends Plugin {
		constructor() {
			super();
		}

		clickHandler(user, e, isUserPopout) {
			const { backgroundColor, backgroundImage } = Utilities.getNestedProp(e, "props.children.1.props.children.props.style");
			const guildId = isUserPopout ? SelectedGuildStore.getGuildId() : "";
			const avatarURL = user.getAvatarURL(guildId, IMG_WIDTH, true);
			const bannerImageURL = backgroundImage ? `${backgroundImage.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}` : undefined;
			const bannerColorUrl = backgroundColor;
			this.showImage([{
				src: avatarURL,
				width: IMG_WIDTH,
				height: IMG_WIDTH
			}, {
				src: bannerImageURL,
				color: bannerColorUrl,
				width: IMG_WIDTH
			}]);
		}

		copyHandler(url) {
			DiscordNative.clipboard.copy(url);
			BdApi.showToast(url, { type: "info" });
			BdApi.showToast("Link Copied!", { type: "success" });
		}

		showImage(imagesArr) {
			ModalActions.openModal(props => {
				return React.createElement(displayCarousel, {
					props,
					data: imagesArr
				});
			});
		}

		patchViewButton() {
			Patcher.after(UserBannerMask, "default", (_, [{ user }], returnValue) => {
				const isUserPopout = Utilities.getNestedProp(returnValue, "props.style.minHeight") === 60;
				const children = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.children");
				children.push(
					React.createElement(viewProfilePictureButton, {
						isUserPopout,
						style: { "--r": isUserPopout ? "48px" : "58px" },
						className: `${classes.pencilContainer} viewProfilePicture`,
						onClick: _ => this.clickHandler(user, returnValue, isUserPopout)
					})
				);
			});
		}

		patchCopyButton() {
			Patcher.after(ImageModal.prototype, "render", (_, __, returnValue) => {
				const children = Utilities.getNestedProp(returnValue, "props.children");
				const { className, href } = Utilities.getNestedProp(returnValue, "props.children.2.props");
				children.push(
					React.createElement(copyButton, {
						className: `${className} ${classes.anchorUnderlineOnHover} copyBtn`,
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
				this.patchViewButton();
				this.patchCopyButton();
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