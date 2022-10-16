/**
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to view the Avatar and banner.
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */
const config = {
	info: {
		name: "ViewProfilePicture",
		version: "1.0.0",
		description: "Adds a button to the user popout and profile that allows you to view the Avatar and banner.",
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
		const ViewProfilePictureButton = ({ onClick }) => {
			return (
				React.createElement(Tooltip, {
						text: "Show profile picture",
						position: "top"
					},
					(props) =>
					React.createElement("div", {
							...
							props,
							className: "VPP-Button pencilContainer-11Kuga",
							onClick: onClick
						},
						React.createElement("svg", {
								"aria-label": props["aria-label"],
								className: "pencilIcon-z04-c5",
								"aria-hidden": "false",
								role: "img",
								width: "18",
								height: "18",
								viewBox: "-50 -50 484 484"
							},
							React.createElement("path", {
								fill: "currentColor",
								d: "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z"
							})))));
		};;
		const DisplayCarousel = ({ props, items }) => {
			return (
				React.createElement(ModalRoot, {
						...
						props,
						className: "VPP-carousel carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM"
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
						className: "VPP-NoBanner wrapper-2bCXfR",
						style: { backgroundColor: color }
					},
					React.createElement("a", {
						className: "downloadLink-1OAglv anchorUnderlineOnHover-2qPutX",
						onClick: (_) => Utils.copy(color)
					}, "Copy Color")));
		};;
		// styles
		const css = `/* View Profile Button */

[class*=popoutBanner-] > div + .VPP-Button{
    right:48px;
}

[class*=profileBanner-] > div + .VPP-Button {
    right:58px;
    top:14px;
}

[class*=profileBanner-] .VPP-Button > svg{
    height: 24px;
    width: 24px;
}

/* div replacement if No banner */

.VPP-NoBanner {
    width: 70vw;
    height: 50vh;
}

/* Carousel Modal */

.VPP-carousel.carouselModal-1eUFoq:not(#idontthinkso) {
    height: auto;
    width: auto;
    position: static;
    box-shadow: none;
    transform: none !important;
    background:none;
}

.VPP-carousel .modalCarouselWrapper-YK1MX4 {
    position: static;
}

.VPP-carousel .arrowContainer-2wpC4q {
    margin: 0 15px;
    opacity: 0.8;
    background: var(--background-primary);
    border-radius: 50%;
}

.VPP-carousel .imageWrapper-oMkQl4.imageWrapperBackground-3Vss_C {
    min-height: 50vh;
}
.VPP-carousel .imageWrapper-oMkQl4 > img{
     max-height: 80vh;
}`;
		return class ViewProfilePicture extends Plugin {
			constructor() {
				super();
			}
			openCarousel(items) {
				ModalActions.openModal(props => React.createElement(DisplayCarousel, { props, items }));
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
				Patcher.after(UserBannerMask, "Z", (_, [{ user, profileType }], returnValue) => {
					let bannerStyleObject, children;
					if (ProfileTypeEnum.MODAL === profileType || ProfileTypeEnum.POPOUT === profileType) {
						bannerStyleObject = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.style");
						children = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.children");
					} else if (ProfileTypeEnum.SETTINGS === profileType) {
						bannerStyleObject = Utilities.getNestedProp(returnValue, "props.children.props.style");
						children = Utilities.getNestedProp(returnValue, "props.children.props.children");
					}
					children.push(
						React.createElement(ViewProfilePictureButton, {
							onClick: _ => this.clickHandler(user, bannerStyleObject, ProfileTypeEnum.POPOUT === profileType)
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
