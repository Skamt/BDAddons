module.exports = (Plugin, Api) => {
	const { Filters, getModule } = BdApi.Webpack;
	const {
		Logger,
		Patcher,
		Utilities,
		PluginUtilities,
		DiscordModules: {
			React,
			ModalActions,
			SelectedGuildStore
		}
	} = Api;

	ModalActions.openModal = getModule(Filters.byStrings("onCloseCallback", "Layer"), { searchExports: true });

	// Filters
	const UserBannerMaskFilter = (exp) => Object.keys(exp).find(k => exp[k].toString().includes("overrideAvatarDecorationURL"));
	// Modules
	const UserBannerMask = getModule((exp) => UserBannerMaskFilter(exp), { searchGetters: false });
	const UserBannerMaskPatchFunctionName = UserBannerMaskFilter(UserBannerMask);
	const ProfileTypeEnum = getModule(Filters.byProps("POPOUT"), { searchExports: true });;
	const ImageModal = getModule(m => m?.prototype?.render?.toString().includes("OPEN_ORIGINAL_IMAGE"));
	const ModalCarousel = getModule(m => m.prototype.navigateTo && m.prototype.preloadImage);
	const ModalRoot = getModule(Filters.byStrings("onAnimationEnd"), { searchExports: true });
	const renderMaskedLinkComponent = e => BdApi.React.createElement(getModule(m => m.type.toString().includes("MASKED_LINK")), e);
	const Tooltip = getModule(m => m.defaultProps.shouldShow);

	// Constants
	const IMG_WIDTH = 4096;

	// Helper functions
	const Utils = {
		copy: (data) => {
			DiscordNative.clipboard.copy(data);
			BdApi.showToast(data, { type: "info" });
			BdApi.showToast("Copied!", { type: "success" });
		},
		getImageModalComponent: (Url, props) => React.createElement(ImageModal, {
			...props,
			src: Url,
			original: Url,
			renderLinkComponent: renderMaskedLinkComponent
		})
	}

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
			Patcher.after(UserBannerMask, UserBannerMaskPatchFunctionName, (_, [{ user, profileType }], returnValue) => {
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