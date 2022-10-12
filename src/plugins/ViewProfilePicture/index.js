module.exports = (Plugin, Api) => {
	const { Filters, getModule } = BdApi.Webpack;
	const {
		Logger,
		Patcher,
		Toasts,
		Utilities,
		PluginUtilities,
		DiscordModules: {
			React,
			ModalActions,
			SelectedGuildStore
		}
	} = Api;

	// Modules
	const UserBannerMask = getModule((m) => m.Z && m.Z.toString().includes("overrideAvatarDecorationURL"));
	const ProfileTypeEnum = getModule(Filters.byProps("POPOUT"), { searchExports: true });
	const ImageModal = getModule(m => m?.prototype?.render?.toString().includes("OPEN_ORIGINAL_IMAGE"));
	const ModalCarousel = getModule(m => m.prototype.navigateTo && m.prototype.preloadImage);
	const ModalRoot = getModule(Filters.byStrings("onAnimationEnd"), { searchExports: true });
	const Tooltip = getModule(m => m.defaultProps.shouldShow);
	const renderLinkComponent = getModule(m => m.type.toString().includes("MASKED_LINK"));

	// Constants
	const IMG_WIDTH = 4096;

	// Helper functions
	const Utils = {
		showToast: (content, type) => Toasts[type](`[${config.info.name}] ${content}`),
		copy: (data) => {
			DiscordNative.clipboard.copy(data);
			Utils.showToast(data, "info");
			Utils.showToast("Copied!", "success");
		},
		getImageModalComponent: (Url, props) => React.createElement(ImageModal, {
			...props,
			src: Url,
			original: Url,
			renderLinkComponent: p => React.createElement(renderLinkComponent, p)
		})
	};

	// components
	const ViewProfilePictureButton = require("components/ViewProfilePictureButton.jsx");
	const DisplayCarousel = require("components/DisplayCarousel.jsx");
	const ColorModal = require("components/ColorModal.jsx");

	// styles
	const css = require("styles.css");

	return class ViewProfilePicture extends Plugin {
		constructor() {
			super();
		}

		openCarousel(items) {
			ModalActions.openModal(props => React.createElement(DisplayCarousel, { props, items }));
		}

		clickHandler(userObject, isUserPopout, bannerStyleObject) {
			const { backgroundColor, backgroundImage } = bannerStyleObject;
			const guildId = isUserPopout ? SelectedGuildStore.getGuildId() : "";
			const avatarURL = userObject.getAvatarURL(guildId, IMG_WIDTH, true);
			const AvatarImageComponent = Utils.getImageModalComponent(avatarURL, { width: IMG_WIDTH, height: IMG_WIDTH });
			const BannerImageComponent = backgroundImage ?
				Utils.getImageModalComponent(`${backgroundImage.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}`, { width: IMG_WIDTH }) :
				React.createElement(ColorModal, { color: backgroundColor });
			this.openCarousel([AvatarImageComponent, BannerImageComponent]);
		}

		patchUserBannerMask() {
			Patcher.after(UserBannerMask, "Z", (_, [{ user, profileType }], returnValue) => {
				let bannerStyleObject, children, isUserPopout;
				if (ProfileTypeEnum.MODAL === profileType || ProfileTypeEnum.POPOUT === profileType) {
					if (ProfileTypeEnum.POPOUT === profileType) isUserPopout = true;
					bannerStyleObject = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.style");
					children = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.children");
				} else if (ProfileTypeEnum.SETTINGS === profileType) {
					bannerStyleObject = Utilities.getNestedProp(returnValue, "props.children.props.style");
					children = Utilities.getNestedProp(returnValue, "props.children.props.children");
				}
				children.push(
					React.createElement(ViewProfilePictureButton, {
						width: isUserPopout ? 18 : 24,
						height: isUserPopout ? 18 : 24,
						style: { "--r": isUserPopout ? "48px" : "58px" },
						onClick: _ => this.clickHandler(user, isUserPopout, bannerStyleObject)
					})
				);
			});
		}

		onStart() {
			try {
				PluginUtilities.addStyle(this.getName(), css);
				this.patchUserBannerMask();
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