module.exports = (Plugin, Api) => {
	const {
		Patcher,
		Filters,
		Utilities,
		WebpackModules,
		PluginUtilities,
		DiscordModules: { React, ModalActions, SelectedGuildStore }
	} = Api;

	const IMG_WIDTH = 4096;
	const filter = (exp) => Object.keys(exp).find(k => exp[k].toString().includes("overrideAvatarDecorationURL"));
	const UserBannerMask = BdApi.Webpack.getModule((exp) => filter(exp), { searchGetters: false });
	const key = filter(UserBannerMask);
	Object.defineProperty(UserBannerMask, key, {
		value: UserBannerMask[key],
		configurable: true,
		enumerable: true,
		writable: true
	});
	const ImageModal = WebpackModules.getModule(m => m?.prototype?.render?.toString().includes("OPEN_ORIGINAL_IMAGE"));
	const ModalCarousel = WebpackModules.getModule(m => m.prototype.navigateTo && m.prototype.preloadImage);
	const ModalRoot = WebpackModules.getModule(Filters.byString("onAnimationEnd"));
	const renderMaskedLinkComponent = e => BdApi.React.createElement(BdApi.Webpack.getModule(m => m.type.toString().includes("MASKED_LINK")), e);
	const Tooltip = WebpackModules.getModule(m => m.defaultProps.shouldShow);

	const ViewProfilePictureButton = require("components/ViewProfilePictureButton.jsx");
	const DisplayCarousel = require("components/DisplayCarousel.jsx");
	const ColorModal = require("components/ColorModal.jsx");

	const css = require("styles.css")

	const getImage = (Url, props) => {
		return React.createElement(ImageModal, {
			...props,
			src: Url,
			original: Url,
			renderLinkComponent: renderMaskedLinkComponent
		});
	}

	return class ViewProfilePicture extends Plugin {
		constructor() {
			super();
		}

		showImage(items) {
			ModalActions.openModal(props => {
				return React.createElement(DisplayCarousel, {
					props,
					items
				});
			});
		}

		clickHandler(userObject, isUserPopout, bannerStyleObject) {
			const { backgroundColor, backgroundImage } = bannerStyleObject;
			const guildId = isUserPopout ? SelectedGuildStore.getGuildId() : "";
			const avatarURL = userObject.getAvatarURL(guildId, IMG_WIDTH, true);
			const bannerImageURL = backgroundImage ? `${backgroundImage.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}` : undefined;
			const bannerColorUrl = backgroundColor;

			this.showImage([
				getImage(avatarURL, { width: IMG_WIDTH, height: IMG_WIDTH }),
				bannerImageURL ?
				getImage(bannerImageURL, { width: IMG_WIDTH }) :
				React.createElement(ColorModal, {
					color: bannerColorUrl,
					bannerColorCopyHandler: this.copyHandler
				})
			]);
		}

		copyHandler(data) {
			DiscordNative.clipboard.copy(data);
			BdApi.showToast(data, { type: "info" });
			BdApi.showToast("Copied!", { type: "success" });
		}

		patchViewButton() {
			Patcher.after(UserBannerMask, key, (_, [{ user }], returnValue) => {
				let bannerStyleObject, children;
				const isSettings = Utilities.getNestedProp(returnValue, "props.children.props.children");
				const isUserPopout = Utilities.getNestedProp(returnValue, "props.style.minWidth") === 340;
				if (isSettings) {
					bannerStyleObject = Utilities.getNestedProp(returnValue, "props.children.props.style");
					children = isSettings;
				} else {
					bannerStyleObject = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.style");
					children = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.children");
				}
				children.push(
					React.createElement(ViewProfilePictureButton, {
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