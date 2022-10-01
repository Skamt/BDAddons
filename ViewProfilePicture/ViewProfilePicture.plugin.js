/**
 * @name ViewProfilePicture
 * @description description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */
const config = {
	info: {
		name: "ViewProfilePicture",
		version: "1.0.0",
		description: "description",
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
		const classes = {
			...WebpackModules.getByProps("downloadLink"),
			...WebpackModules.getByProps("anchorUnderlineOnHover"),
			...WebpackModules.getByProps("pencilContainer", "popoutNoBannerPremium")
		};
		const ViewProfilePictureButton = ({ style, onClick, isUserPopout }) => {
			return React.createElement(Tooltip, {
					text: "Show profile picture",
					position: "top"
				},
				(props) =>
				React.createElement("div", {
						...
						props,
						style: style,
						className: `${classes.pencilContainer} viewProfilePicture`,
						onClick: onClick
					},
					React.createElement("svg", {
							"aria-label": "Redigera profilen",
							className: "pencilIcon-z04-c5",
							"aria-hidden": "false",
							role: "img",
							width: isUserPopout ? 18 : 24,
							height: isUserPopout ? 18 : 24,
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
						className: "viewProfilePicture carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM"
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
						className: "noBanner wrapper-2bCXfR",
						style: { backgroundColor: color }
					},
					React.createElement("a", {
						className: `${classes.downloadLink} ${classes.anchorUnderlineOnHover}`,
						onClick: (_) => bannerColorCopyHandler(color)
					}, "Copy Color")));
		};;
		const css = Utilities.formatTString(`
.\${pencilContainer} + .viewProfilePicture {
	left: 12px;
	right: unset;
	/*background: var(--background-primary);*/
}

.\${pencilContainer} + .viewProfilePicture {
	right: var(--r);
	left: unset;
}

.viewProfilePicture path {
	transform: scale(0.8);
	transform-origin: center;
}



.noBanner {
	width: 70vw;
	height: 50vh;
}

.viewProfilePicture.carouselModal-1eUFoq:not(#idontthinkso) {
	height: auto;
	width: auto;
	box-shadow: none;
	position: static;
	transform: none !important;
}

.viewProfilePicture .modalCarouselWrapper-YK1MX4 {
	position: static;
}

.viewProfilePicture .arrowContainer-2wpC4q {
	margin: 0 15px;
	opacity: 0.8;
	background: var(--background-primary);
	border-radius: 50%;
}`, classes);
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
				const bannerURL = backgroundImage ? `${backgroundImage.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}` : undefined;
				const bannerColorUrl = backgroundColor;
				this.showImage([
					getImage(avatarURL, { width: IMG_WIDTH, height: IMG_WIDTH }),
					bannerURL ?
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
				Patcher.after(UserBannerMask, "Z", (_, [{ user }], returnValue) => {
					const isUserPopout = Utilities.getNestedProp(returnValue, "props.style.minHeight") === 60;
					const bannerStyleObject = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.style");
					const children = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.children");
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
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ? MissinZeresPluginLibraryClass : initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
