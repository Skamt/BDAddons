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
			Utilities,
			WebpackModules,
			PluginUtilities,
			DiscordModules: {
				React,
				ModalActions,
				SelectedGuildStore
			}
		} = Api;
		const IMG_WIDTH = 4096;
		const UserBannerMask = WebpackModules.getModule(m => m.default.displayName === "UserBannerMask");
		const ImageModal = WebpackModules.getByDisplayName("ImageModal");
		const ModalCarousel = WebpackModules.getByDisplayName("ModalCarousel");
		const { ModalRoot } = WebpackModules.getByProps("ModalRoot");
		const { renderMaskedLinkComponent } = WebpackModules.getByProps("renderMaskedLinkComponent");
		const Tooltip = WebpackModules.getByDisplayName("Tooltip");
		const classes = {
			...WebpackModules.getByProps("downloadLink"),
			...WebpackModules.getByProps("anchorUnderlineOnHover"),
			...WebpackModules.getByProps("pencilContainer", "popoutNoBannerPremium")
		};
		const viewProfilePictureButton = ({ style, onClick, isUserPopout }) => {
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
		const displayCarousel = ({ props, imagesArr, bannerColorCopyHandler }) => {
			const items = imagesArr.map(({ width, height, src, color }) => ({
				"component": src ? React.createElement(ImageModal, {
					src: src,
					original: src,
					placeholder: src,
					width: width,
					height: height,
					renderLinkComponent: renderMaskedLinkComponent
				}) : React.createElement("div", {
						className: "noBanner wrapper-2bCXfR",
						style: { backgroundColor: color }
					},
					React.createElement("a", {
						className: `${classes.downloadLink} ${classes.anchorUnderlineOnHover}`,
						onClick: (_) => bannerColorCopyHandler(color)
					}, "Copy Color"))
			}));
			return React.createElement(ModalRoot, {
					...
					props,
					className: "viewProfilePicture carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM"
				},
				React.createElement(ModalCarousel, {
					className: "modalCarouselWrapper-YK1MX4",
					items: items
				}));
		};;
		const copyButton = ({ onClick }) => {
			return (
				React.createElement(React.Fragment, null,
					React.createElement("span", { className: "copyBtnSpan" }, "|"),
					React.createElement("a", {
						className: `${classes.downloadLink} ${classes.anchorUnderlineOnHover} copyBtn`,
						onClick: onClick
					}, "Copy link")));
		};;
		const css = Utilities.formatTString(`
.\${premiumIconWrapper} + .viewProfilePicture {
	left: 12px;
	right: unset;
	background: var(--background-primary);
}

.\${premiumIconWrapper} + .viewProfilePicture {
	right: var(--r);
}

.viewProfilePicture path {
	transform: scale(0.8);
	transform-origin: center;
}

.copyBtn {
	left: 95px;
}

.copyBtnSpan {
	left: 85px;
	position: absolute;
	top: 100%;
	font-weight: 500;
	color: hsl(0, calc(var(--saturation-factor, 1) * 0%), 100%) !important;
	line-height: 30px;
	opacity: 0.5;
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
		return class ViewProfilePicture extends Plugin {
			constructor() {
				super();
			}
			showImage(imagesArr) {
				ModalActions.openModal(props => {
					return React.createElement(displayCarousel, {
						props,
						imagesArr,
						bannerColorCopyHandler: this.copyHandler
					});
				});
			}
			clickHandler(userObject, isUserPopout, bannerStyleObject) {
				const { backgroundColor, backgroundImage } = bannerStyleObject;
				const guildId = isUserPopout ? SelectedGuildStore.getGuildId() : "";
				const avatarURL = userObject.getAvatarURL(guildId, IMG_WIDTH, true);
				const bannerImageURL = backgroundImage ? `${backgroundImage.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}` : undefined;
				const bannerColorUrl = backgroundColor;
				this.showImage([{
					src: avatarURL,
					width: IMG_WIDTH,
					height: IMG_WIDTH
				}, {
					src: bannerImageURL,
					color: bannerColorUrl,
					width: IMG_WIDTH
				}]);
			}
			copyHandler(data) {
				DiscordNative.clipboard.copy(data);
				BdApi.showToast(data, { type: "info" });
				BdApi.showToast("Copied!", { type: "success" });
			}
			patchViewButton() {
				Patcher.after(UserBannerMask, "default", (_, [{ user }], returnValue) => {
					const isUserPopout = Utilities.getNestedProp(returnValue, "props.style.minHeight") === 60;
					const bannerStyleObject = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.style");
					const children = Utilities.getNestedProp(returnValue, "props.children.1.props.children.props.children");
					children.push(
						React.createElement(viewProfilePictureButton, {
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
				this.patchCopyButton();
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
