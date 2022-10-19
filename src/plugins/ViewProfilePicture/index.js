module.exports = () => {
	const {
		UI,
		DOM,
		React,
		Patcher,
		Webpack: {
			Filters,
			getModule
		}
	} = BdApi;

	// Modules
	const openModal = getModule(Filters.byStrings("onCloseCallback", "Layer"), { searchExports: true });
	const SelectedGuildStore = getModule(Filters.byProps("getLastSelectedGuildId"));
	const CurrentUserStore = getModule(Filters.byProps("getCurrentUser", "getUsers"));
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
		showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
		copy: (data) => {
			DiscordNative.clipboard.copy(data);
			Utils.showToast("Color Copied!", "success");
		},
		/* Stolen from Zlib until it gets added to BdApi */
		getNestedProp: (obj, path) => path.split(".").reduce(function(ob, prop) {
			return ob && ob[prop];
		}, obj),
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
			openModal(props => React.createElement(DisplayCarousel, { props, items }));
		}

		clickHandler(userObject, bannerStyleObject, isUserPopout) {
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
			Patcher.after(this.name, UserBannerMask, "Z", (_, [{ user, isPremium, profileType }], returnValue) => {
				const currentUser = CurrentUserStore.getCurrentUser();
				let bannerStyleObject, children, className = "VPP-Button";
				if (ProfileTypeEnum.MODAL === profileType || ProfileTypeEnum.POPOUT === profileType) {
					bannerStyleObject = Utils.getNestedProp(returnValue, "props.children.1.props.children.props.style");
					children = Utils.getNestedProp(returnValue, "props.children.1.props.children.props.children");
					if (user.id === currentUser.id) className += " VPP-current"
					if (isPremium) className += " VPP-premium"
					if (!isPremium && user.id !== currentUser.id) className += " VPP-normal"
					if (ProfileTypeEnum.MODAL === profileType) className += " VPP-profile"
				} else if (ProfileTypeEnum.SETTINGS === profileType) {
					bannerStyleObject = Utils.getNestedProp(returnValue, "props.children.props.style");
					children = Utils.getNestedProp(returnValue, "props.children.props.children");
					className += " VPP-settings VPP-normal"
				}
				children.push(
					React.createElement(ViewProfilePictureButton, {
						className,
						onClick: _ => this.clickHandler(user, bannerStyleObject, ProfileTypeEnum.POPOUT === profileType)
					})
				);
			});
		}

		onStart() {
			try {
				DOM.addStyle(this.name, css);
				this.patchUserBannerMask();
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			DOM.removeStyle(this.name);
			Patcher.unpatchAll(this.name);
		}
	};
};