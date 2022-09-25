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
				React: { useState },
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
		const Tooltip = WebpackModules.getModule(m => m.default.displayName === "Tooltip").default;
		const classes = WebpackModules.getByProps("pencilContainer", "popoutNoBannerPremium");
		const viewProfilePictureButton = ({ onClick, pencilContainer }) => {
			return (
				React.createElement(Tooltip, {
						text: "Show profile picture",
						position: "top"
					},
					(props) =>
					React.createElement("div", {
							...
							props,
							onClick: onClick,
							className: `${pencilContainer} viewProfilePicture`
						},
						React.createElement("svg", {
								"aria-label": "Redigera profilen",
								className: "pencilIcon-z04-c5",
								"aria-hidden": "false",
								role: "img",
								width: "18",
								height: "18",
								viewBox: "0 0 384 384"
							},
							React.createElement("path", {
								fill: "currentColor",
								d: "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z"
							})))));
		};;
		const displayCarousel = ({ p, data }) => {
			const items = data.map(({ url, width, height }) => ({
				"component": React.createElement(ImageModal, {
					src: url,
					width: width,
					height: height,
					original: url,
					renderLinkComponent: renderMaskedLinkComponent
				}),
				"width": width,
				"height": height,
				"src": url
			}));
			return (
				React.createElement(React.Fragment, null,
					React.createElement("style", null, `
				.modalCarouselWrapper-YK1MX4 {
					position: static; 
				} 
				.carouselModal-1eUFoq:not(#idontthinkso) {
					height: auto; 
					width: auto; 
					box-shadow: none; 
					position: static; 
					transform: none !important; 
				} 
				.arrowContainer-2wpC4q {
					margin: 0 15px; 
					opacity: 0.8; 
					background: var(--background-primary); 
					border-radius: 50%; 
				}`),
					React.createElement(ModalRoot, {
							...
							p,
							className: "carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM"
						},
						React.createElement(ModalCarousel, {
							className: "modalCarouselWrapper-YK1MX4",
							items: items
						}))));
		};;
		const copyButton = (props) => {
			return (
				React.createElement(React.Fragment, null,
					React.createElement("span", { className: "copyBtnSpan" }, "|"),
					React.createElement("a", { onClick: props.onClick, className: `copyBtn ${props.className}` }, "Copy link")));
		};;
		const css = Utilities.formatTString(`.\${premiumIconWrapper} + .viewProfilePicture {
	left: 12px;
	right: unset;
	background: var(--background-primary);
}

.\${pencilContainer} + .viewProfilePicture {
	right: 48px;
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
    color: hsl(0,calc(var(--saturation-factor, 1)*0%),100%)!important;
    line-height: 30px;
    opacity: .5;
}
`, classes);
		return class ViewProfilePicture extends Plugin {
			constructor() {
				super();
			}
			clickHandler({ userObject, rawBannerUrl = "", minHeight }) {
				const guildId = minHeight === 120 ? SelectedGuildStore.getGuildId() : "";
				const avatarURL = userObject.getAvatarURL(guildId, IMG_WIDTH, true) || "";
				const bannerURL = `${rawBannerUrl.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}`;
				this.showImage([{
					url: avatarURL,
					width: IMG_WIDTH,
					height: IMG_WIDTH
				}, {
					url: bannerURL,
					width: IMG_WIDTH
				}]);
			}
			copyHandler(url) {
				DiscordNative.clipboard.copy(url);
				BdApi.showToast("Link Copied!", { type: "success" })
			}
			showImage(imgsArr) {
				ModalActions.openModal(props => {
					return React.createElement(displayCarousel, {
						p: props,
						data: imgsArr.filter(m => !m.url.includes("undefined"))
					});
				});
			}
			patch() {
				Patcher.after(UserBannerMask, "default", (_, [{ user }], returnValue) => {
					returnValue.props.children[1].props.children.props.children.push(
						React.createElement(viewProfilePictureButton, {
							pencilContainer: classes.pencilContainer,
							onClick: _ => {
								this.clickHandler({
									userObject: user,
									rawBannerUrl: returnValue.props.children[1].props.children.props.style.backgroundImage,
									minHeight: returnValue.props.style.minHeight
								});
							}
						})
					);
				});
				Patcher.after(ImageModal.prototype, "render", (_, __, returnValue) => {
					const { className, href } = returnValue.props.children[2].props;
					returnValue.props.children.push(
						React.createElement(copyButton, {
							c: className,
							className: `${className} anchorUnderlineOnHover-2qPutX`,
							onClick: _ => {
								this.copyHandler(href);
							}
						})
					);
				});
			}
			clean() {
				PluginUtilities.removeStyle(this.getName());
				Patcher.unpatchAll();
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
