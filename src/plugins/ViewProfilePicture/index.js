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
	} = new BdApi(config.info.name);

	// https://discord.com/channels/86004744966914048/196782758045941760/1062604534922367107
	function getModuleAndKey(filter) {
		let module;
		const target = BdApi.Webpack.getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true })
		return [module.exports, Object.keys(module.exports).find(k => module.exports[k] === target)];
	}
	
	// Modules
	const Tooltip = DiscordModules.Tooltip;
	const ModalRoot = DiscordModules.ModalRoot;
	const openModal = DiscordModules.openModal;
	const [ImageModalModule, ImageModalKey] = getModuleAndKey(DiscordModules.ImageModal);
	const ModalCarousel = DiscordModules.ModalCarousel;
	const UserBannerMask = DiscordModules.UserBannerMask;
	const ProfileTypeEnum = DiscordModules.ProfileTypeEnum;
	const CurrentUserStore = DiscordModules.CurrentUserStore;
	const SelectedGuildStore = DiscordModules.SelectedGuildStore;
	const renderLinkComponent = DiscordModules.renderLinkComponent;

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
		getImageModalComponent: (Url, props) => React.createElement(ImageModalModule[ImageModalKey], {
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

	return class ViewProfilePicture {
		constructor() {}

		openCarousel(items) {
			openModal(props => React.createElement(DisplayCarousel, { props, items }));
		}

		clickHandler(user, bannerObject, isUserPopout) {
			const { backgroundColor, backgroundImage } = bannerObject;
			const guildId = isUserPopout ? SelectedGuildStore.getGuildId() : "";
			const avatarURL = user.getAvatarURL(guildId, IMG_WIDTH, true);
			const AvatarImageComponent = Utils.getImageModalComponent(avatarURL, { width: IMG_WIDTH, height: IMG_WIDTH });
			const BannerImageComponent = backgroundImage ?
				Utils.getImageModalComponent(`${backgroundImage.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}`, { width: IMG_WIDTH }) :
				React.createElement(ColorModal, { color: backgroundColor });
			this.openCarousel([AvatarImageComponent, BannerImageComponent]);
		}

		patchUserBannerMask() {
			Patcher.after(UserBannerMask, "Z", (_, [{ user, isPremium, profileType }], returnValue) => {
				if (profileType === ProfileTypeEnum.SETTINGS) return;

				const currentUser = CurrentUserStore.getCurrentUser();
				let className = "VPP-Button";
				if (profileType === ProfileTypeEnum.MODAL)
					className += " VPP-profile"

				const bannerObject = Utils.getNestedProp(returnValue, "props.children.1.props.children.props.style");
				const children = Utils.getNestedProp(returnValue, "props.children.1.props.children.props.children");
				className += user.id === currentUser.id ?
					" VPP-self" :
					bannerObject.backgroundImage ?
					" VPP-left" :
					" VPP-right";

				if (Array.isArray(children) && bannerObject)
					children.push(
						React.createElement(ViewProfilePictureButton, {
							className,
							onClick: _ => this.clickHandler(user, bannerObject, ProfileTypeEnum.POPOUT === profileType)
						})
					);
			});
		}

		start() {
			try {
				DOM.addStyle(css);
				this.patchUserBannerMask();
			} catch (e) {
				console.error(e);
			}
		}

		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};