module.exports = (Plugin, Api) => {
	const {
		Patcher,
		Utilities,
		WebpackModules,
		PluginUtilities,
		DiscordModules: {
			React,
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
	const Tooltip = WebpackModules.getByDisplayName("Tooltip");
	const classes = {
		...WebpackModules.getByProps("downloadLink"),
		...WebpackModules.getByProps("anchorUnderlineOnHover"),
		...WebpackModules.getByProps("pencilContainer", "popoutNoBannerPremium")
	};

	const viewProfilePictureButton = require("components/viewProfilePictureButton.jsx");
	const displayCarousel = require("components/displayCarousel.jsx");
	const copyButton = require("components/copyButton.jsx");
	const css = Utilities.formatTString(require("styles.css"), classes);

	return class ViewProfilePicture extends Plugin {
		constructor() {
			super();
		}

		showImage(imagesArr) {
			ModalActions.openModal(props => {
				return React.createElement(displayCarousel, {
					props,
					imagesArr,
					bannerColorCopyHandler: this.copyHandler
				});
			});
		}

		clickHandler(userObject, isUserPopout, bannerStyleObject) {
			const { backgroundColor, backgroundImage } = bannerStyleObject;
			const guildId = isUserPopout ? SelectedGuildStore.getGuildId() : "";
			const avatarURL = userObject.getAvatarURL(guildId, IMG_WIDTH, true);
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

		copyHandler(data) {
			DiscordNative.clipboard.copy(data);
			BdApi.showToast(data, { type: "info" });
			BdApi.showToast("Copied!", { type: "success" });
		}

		patchViewButton() {
			Patcher.after(UserBannerMask, "default", (_, [{ user }], returnValue) => {
				const isUserPopout = Utilities.getNestedProp(returnValue, "props.style.minHeight") === 60;
				const bannerStyleObject = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.style");
				const children = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.children");
				children.push(
					React.createElement(viewProfilePictureButton, {
						isUserPopout,
						style: { "--r": isUserPopout ? "48px" : "58px" },
						onClick: _ => this.clickHandler(user, isUserPopout, bannerStyleObject)
					})
				);
			});
		}
		patchCopyButton() {
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

		patch() {
			this.patchViewButton();
			this.patchCopyButton();
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