/**
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to view the Avatar and banner.
 * @version 1.0.2
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */
const config = {
	info: {
		name: "ViewProfilePicture",
		version: "1.0.2",
		description: "Adds a button to the user popout and profile that allows you to view the Avatar and banner.",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture",
		authors: [{
			name: "Skamt"
		}]
	}
};

function initPlugin([Plugin, Api]) {
	const plugin = () => {
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
		const Tooltip = getModule(m => m.defaultProps?.shouldShow);
		const ModalRoot = getModule(Filters.byStrings('onAnimationEnd'), { searchExports: true });
		const openModal = getModule(Filters.byStrings('onCloseCallback', 'Layer'), { searchExports: true });
		const ImageModal = getModule(m => {
			if (!m?.toString || typeof(m?.toString) !== "function" || !m.prototype?.render) return;
			const strs = ["original", "maxHeight", "maxWidth", "noreferrer noopener"];
			const funcStr = m?.prototype?.render?.toString();
			for (const s of strs)
				if (!funcStr.includes(s)) return false;
			return true;
		});
		const ModalCarousel = getModule(m => m.prototype?.navigateTo && m.prototype?.preloadImage);
		const UserBannerMask = getModule((m) => m.Z && m.Z.toString().includes('overrideAvatarDecorationURL'));
		const ProfileTypeEnum = getModule(Filters.byProps('POPOUT', 'SETTINGS'), { searchExports: true });
		const CurrentUserStore = getModule(Filters.byProps('getCurrentUser', 'getUsers'));
		const SelectedGuildStore = getModule(Filters.byProps('getLastSelectedGuildId'));
		const renderLinkComponent = getModule(m => m.type?.toString().includes('MASKED_LINK'));
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
		const ViewProfilePictureButton = (props) => {
			return (
				React.createElement(Tooltip, {
						text: "View profile picture",
						position: "top"
					},
					(p) =>
					React.createElement("div", {
							...
							p,
							...
							props
						},
						React.createElement("svg", {
								"aria-label": p["aria-label"],
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
		};
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
		};
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
		};
		// styles
		const css = `/* View Profile Button */
.VPP-Button{
    background-color: hsla(0,calc(var(--saturation-factor, 1)*0%),0%,.3);
    cursor: pointer;
    position: absolute;
    display: flex;
    padding: 5px;
    border-radius: 50%;
    top: 10px;
    color:#fff;
}

/* Popout */
.VPP-right{
    right:12px;
}

.VPP-left {
	left: 12px;
}

.VPP-self {
	right: 48px;
}

/* Profile */
.VPP-profile {
	top: 14px;
}

.VPP-profile..VPP-right{
    right:16px;
}

.VPP-profile.VPP-self{
	right: 58px;
}

.VPP-profile.VPP-left {
	left: 16px;
}

/* Bigger icon on profile */
.VPP-settings svg,
.VPP-profile svg{
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
	background: none;
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

.VPP-carousel .imageWrapper-oMkQl4 > img {
	max-height: 80vh;
}`;
		return class ViewProfilePicture extends Plugin {
			constructor() {
				super();
			}
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
				Patcher.after(this.name, UserBannerMask, "Z", (_, [{ user, isPremium, profileType }], returnValue) => {
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
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ?
	() => ({
		stop() {},
		start() {
			BdApi.UI.showConfirmationModal("Library plugin is needed", [`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`, `Please download it from the officiel website`, "https://betterdiscord.app/plugin/ZeresPluginLibrary"], {
				confirmText: "Ok"
			});
		}
	}) :
	initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
