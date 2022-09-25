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
	const classes = WebpackModules.getByProps("pencilContainer", "popoutNoBannerPremium");
	const viewProfilePictureButton = require("components/viewProfilePictureButton.jsx");
	const displayCarousel = require("components/displayCarousel.jsx");
	const css = Utilities.formatTString(require("styles.css"), classes);

	return class ViewProfilePicture extends Plugin {
		constructor() {
			super();
		}

		clickHandler({ userObject, rawBannerUrl = "", minHeight }) {
			const guildId = minHeight === 120 ? SelectedGuildStore.getGuildId() : '';
			const avatarURL = userObject.getAvatarURL(guildId, IMG_WIDTH, true) || "";
			const bannerURL = `${rawBannerUrl.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}`;
			this.showImage([{
				url: avatarURL,
				width: IMG_WIDTH,
				height: IMG_WIDTH
			}, {
				url: bannerURL,
				width: IMG_WIDTH
			}]);
		}

		showImage(imgsArr) {
			console.log(imgsArr);
			ModalActions.openModal(props => {
				return React.createElement(displayCarousel, {
					p: props,
					data: imgsArr.filter(m => !m.url.includes("undefined"))
				});
			});
		}


		patch() {
			Patcher.after(UserBannerMask, "default", (_, [{ user }], returnValue) => {
				returnValue.props.children[1].props.children.props.children.push(
					React.createElement(viewProfilePictureButton, {
						pencilContainer: classes.pencilContainer,
						onClick: e => {
							this.clickHandler({
								userObject: user,
								rawBannerUrl: returnValue.props.children[1].props.children.props.style.backgroundImage,
								minHeight: returnValue.props.style.minHeight
							});
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
	};
};