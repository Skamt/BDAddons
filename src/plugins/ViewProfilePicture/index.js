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
		const target = getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true });
		module = module?.exports;
		if (!module) return undefined;
		const key = Object.keys(module).find(k => module[k] === target);
		if (!key) return undefined;
		return { module, key };
	}

	// Modules
	const Modules = {
		Tooltip: DiscordModules.Tooltip,
		ModalRoot: DiscordModules.ModalRoot,
		openModal: DiscordModules.openModal,
		ImageModal: DiscordModules.ImageModal,
		ModalCarousel: DiscordModules.ModalCarousel,
		UserBannerMask: DiscordModules.UserBannerMask,
		ProfileTypeEnum: DiscordModules.ProfileTypeEnum,
		CurrentUserStore: DiscordModules.CurrentUserStore,
		SelectedGuildStore: DiscordModules.SelectedGuildStore,
		renderLinkComponent: DiscordModules.renderLinkComponent
	}

	failsafe;

	// Utilities
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
		getImageModalComponent: (Url, props) => React.createElement(Modules.ImageModal.module[Modules.ImageModal.key], {
			...props,
			src: Url,
			original: Url,
			renderLinkComponent: p => React.createElement(Modules.renderLinkComponent, p)
		})
	};

	// Constants
	const IMG_WIDTH = 4096;

	// Components
	const ViewProfilePictureButton = require("components/ViewProfilePictureButton.jsx");
	const DisplayCarousel = require("components/DisplayCarousel.jsx");
	const ColorModal = require("components/ColorModal.jsx");

	// Styles
	const css = require("styles.css");

	return class ViewProfilePicture {
		constructor() {}

		openCarousel(items) {
			Modules.openModal(props => React.createElement(DisplayCarousel, { props, items }));
		}

		clickHandler(user, bannerObject, isUserPopout) {
			const { backgroundColor, backgroundImage } = bannerObject;
			const guildId = isUserPopout ? Modules.SelectedGuildStore.getGuildId() : "";
			const avatarURL = user.getAvatarURL(guildId, IMG_WIDTH, true);
			const AvatarImageComponent = Utils.getImageModalComponent(avatarURL, { width: IMG_WIDTH, height: IMG_WIDTH });
			const BannerImageComponent = backgroundImage ?
				Utils.getImageModalComponent(`${backgroundImage.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}`, { width: IMG_WIDTH }) :
				React.createElement(ColorModal, { color: backgroundColor });
			this.openCarousel([AvatarImageComponent, BannerImageComponent]);
		}

		patchUserBannerMask() {
			Patcher.after(Modules.UserBannerMask, "Z", (_, [{ user, isPremium, profileType }], returnValue) => {
				if (profileType === Modules.ProfileTypeEnum.SETTINGS) return;

				const currentUser = Modules.CurrentUserStore.getCurrentUser();
				let className = "VPP-Button";
				if (profileType === Modules.ProfileTypeEnum.MODAL)
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
							onClick: _ => this.clickHandler(user, bannerObject, Modules.ProfileTypeEnum.POPOUT === profileType)
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
}