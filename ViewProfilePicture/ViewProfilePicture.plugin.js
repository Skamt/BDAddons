/**
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to open up the Avatar and banner.
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */
const config = {
	info: {
		name: "ViewProfilePicture",
		version: "1.0.0",
		description: "Adds a button to the user popout and profile that allows you to open up the Avatar and banner.",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture",
		authors: [{
			name: "Skamt"
		}]
	}
};
class MissinZeresPluginLibraryClass {
	constructor() { this.config = config; }
	load() {
		BdApi.showConfirmationModal('Library plugin is needed',
			[`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`, `Please download it from the officiel website`, 'https://betterdiscord.app/plugin/ZeresPluginLibrary'], {
				confirmText: 'Ok'
			});
	}
	start() {}
	stop() {}
}

function initPlugin([Plugin, Api]) {
	const plugin = (Plugin, Api) => {
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
		const ViewProfilePictureButton = ({ style, onClick, width, height }) => {
			return React.createElement(Tooltip, {
					text: "Show profile picture",
					position: "top"
				},
				(props) =>
				React.createElement("div", {
						...
						props,
						style: style,
						className: "pencilContainer-11Kuga viewProfilePicture-Button",
						onClick: onClick
					},
					React.createElement("svg", {
							"aria-label": "Redigera profilen",
							className: "pencilIcon-z04-c5",
							"aria-hidden": "false",
							role: "img",
							width: width,
							height: height,
							viewBox: "0 0 384 384"
						},
						React.createElement("path", {
							fill: "currentColor",
							d: "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z"
						}))));
		};;
		const DisplayCarousel = ({ props, items }) => {
			return (
				React.createElement(ModalRoot, {
						...
						props,
						className: "viewProfilePicture-carousel carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM"
					},
					React.createElement(ModalCarousel, {
						startWith: 0,
						className: "modalCarouselWrapper-YK1MX4",
						items: items.map((item) => ({ "component": item }))
					})));
		};;
		const ColorModal = ({ color, bannerColorCopyHandler }) => {
			return (
				React.createElement("div", {
						className: "viewProfilePicture-NoBanner wrapper-2bCXfR",
						style: { backgroundColor: color }
					},
					React.createElement("a", {
						className: "downloadLink-1OAglv anchorUnderlineOnHover-2qPutX",
						onClick: (_) => Utils.copy(color)
					}, "Copy Color")));
		};;
		// styles
		const css = `.premiumIconWrapper-yyGDql + .viewProfilePicture-Button {
    left: 12px;
    right: unset;
}

.pencilContainer-11Kuga + .viewProfilePicture-Button {
    right: var(--r);
}

.viewProfilePicture-Button path {
    transform: scale(0.8);
    transform-origin: center;
}

.viewProfilePicture-NoBanner {
    width: 70vw;
    height: 50vh;
}

.viewProfilePicture-carousel.carouselModal-1eUFoq:not(#idontthinkso) {
    height: auto;
    width: auto;
    position: static;
    box-shadow: none;
    transform: none !important;
    background:none;
}

.viewProfilePicture-carousel .modalCarouselWrapper-YK1MX4 {
    position: static;
}

.viewProfilePicture-carousel .arrowContainer-2wpC4q {
    margin: 0 15px;
    opacity: 0.8;
    background: var(--background-primary);
    border-radius: 50%;
}

.viewProfilePicture-carousel .imageWrapper-oMkQl4.imageWrapperBackground-3Vss_C {
    min-height: 50vh;
}
.viewProfilePicture-carousel .imageWrapper-oMkQl4 > img{
     max-height: 80vh;
}`;
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
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ? MissinZeresPluginLibraryClass : initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
