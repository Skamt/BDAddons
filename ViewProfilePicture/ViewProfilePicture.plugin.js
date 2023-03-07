/**
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to view the Avatar and banner.
 * @version 1.0.5
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */
const config = {
	info: {
		name: "ViewProfilePicture",
		version: "1.0.5",
		description: "Adds a button to the user popout and profile that allows you to view the Avatar and banner.",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture",
		authors: [{
			name: "Skamt"
		}]
	}
};

function getPlugin() {
	const { Modules, Plugin } = (() => {
		const { Webpack: { Filters, getModule } } = BdApi

		// https://discord.com/channels/86004744966914048/196782758045941760/1062604534922367107
		function getModuleAndKey(filter) {
			let module;
			const target = getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true });
			module = module?.exports;
			if (!module) return { module: undefined };
			const key = Object.keys(module).find(k => module[k] === target);
			if (!key) return undefined;
			return { module, key };
		}

		return {
			Modules: {
				Tooltip: { module: getModule(m => m.defaultProps?.shouldShow, { searchExports: true }), isBreakable: true },
				ModalRoot: { module: getModule(Filters.byStrings('onAnimationEnd'), { searchExports: true }), isBreakable: true },
				openModal: { module: getModule(Filters.byStrings('onCloseCallback', 'Layer'), { searchExports: true }), isBreakable: true },
				ImageModal: {
					module: getModuleAndKey(m => {
						if (!m?.toString || typeof(m?.toString) !== "function") return;
						const strs = ["original", "maxHeight", "maxWidth", "noreferrer noopener"];
						const funcStr = m?.toString();
						for (const s of strs)
							if (!funcStr.includes(s)) return false;
						return true;
					}),
					isBreakable: true,
					withKey: true
				},
				ModalCarousel: { module: getModule(m => m.prototype?.navigateTo && m.prototype?.preloadImage), isBreakable: true },
				UserBannerMask: { module: getModule((m) => m.Z && m.Z.toString().includes('overrideAvatarDecorationURL')), isBreakable: true },
				ProfileTypeEnum: { module: getModule(Filters.byProps('POPOUT', 'SETTINGS'), { searchExports: true }), fallback: { POPOUT: 0, MODAL: 1, SETTINGS: 2, PANEL: 3, CARD: 4 } },
				CurrentUserStore: { module: getModule(Filters.byProps('getCurrentUser', 'getUsers')), isBreakable: true },
				SelectedGuildStore: { module: getModule(Filters.byProps('getLastSelectedGuildId')) },
				renderLinkComponent: { module: getModule(m => m.type?.toString().includes('MASKED_LINK')), isBreakable: true }
			},
			Plugin(Modules) {
				const {
					UI,
					DOM,
					React,
					Patcher
				} = new BdApi(config.info.name);
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
				const ErrorBoundary = class ErrorBoundary extends React.Component {
					state = { hasError: false, error: null, info: null };

					componentDidCatch(error, info) {
						this.setState({ error, info, hasError: true });
						const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
						console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
					}

					render() {
						if (this.state.hasError) {
							if (this.props.fallback) return this.props.fallback;
							else {
								return (
									React.createElement("div", { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" } },
										React.createElement("b", { style: { color: "#e0e1e5" } }, "An error has occured while rendering ",
											React.createElement("span", { style: { color: "orange" } }, this.props.id))));

							}
						} else return this.props.children;
					}
				};
				const ErrorComponent = (props) =>
					React.createElement("div", { ...props },
						React.createElement("svg", {
								xmlns: "http://www.w3.org/2000/svg",
								viewBox: "0 0 24 24",
								fill: "red",
								width: "18",
								height: "18"
							},
							React.createElement("path", {
								d: "M0 0h24v24H0z",
								fill: "none"
							}),

							React.createElement("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" })));
				const ViewProfilePictureButtonComponent = (props) => {
					return (
						React.createElement(Modules.Tooltip, {
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
				const DisplayCarouselComponent = ({ props, items }) => {
					return (
						React.createElement(Modules.ModalRoot, {
								...
								props,
								className: "VPP-carousel carouselModal-1eUFoq zoomedCarouselModalRoot-beLNhM"
							},
							React.createElement(Modules.ModalCarousel, {
								startWith: 0,
								className: "modalCarouselWrapper-YK1MX4",
								items: items.map((item) => ({ "component": item }))
							})));

				};
				const ColorModalComponent = ({ color, bannerColorCopyHandler }) => {
					return (
						React.createElement("div", {
								className: "VPP-NoBanner",
								style: { backgroundColor: color }
							},
							React.createElement("a", {
								className: "copyColorBtn",
								onClick: (_) => Utils.copy(color)
							}, "Copy Color")));

				};

				// Styles
				const css = `/* Warning circle in popouts of users who left server overlaps VPP button */
svg.warningCircleIcon-2osUEe {
    top: 75px;
}

/* View Profile Button */
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
	position: relative;
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
}

/* Copy color button */
.copyColorBtn{
	white-space: nowrap;
    position: absolute;
    top: 100%;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    line-height: 30px;
    transition: opacity .15s ease;
    opacity: .5;
}

.copyColorBtn:hover{
	opacity: 1;
    text-decoration: underline;
}`;

				return class ViewProfilePicture {

					openCarousel(items) {
						Modules.openModal(props =>
							React.createElement(ErrorBoundary, {
									id: "DisplayCarouselComponent",
									plugin: config.info.name,
									closeModal: props.onClose
								},
								React.createElement(DisplayCarouselComponent, { props, items }))
						);
					}

					clickHandler(user, bannerObject, isUserPopout) {
						const { backgroundColor, backgroundImage } = bannerObject;
						const guildId = isUserPopout ? Modules.SelectedGuildStore.getGuildId() : "";
						const avatarURL = user.getAvatarURL(guildId, IMG_WIDTH, true);
						const AvatarImageComponent = Utils.getImageModalComponent(avatarURL, { width: IMG_WIDTH, height: IMG_WIDTH });
						const BannerImageComponent = backgroundImage ?
							Utils.getImageModalComponent(`${backgroundImage.match(/(?<=\().*(?=\?)/)?.[0]}?size=${IMG_WIDTH}`, { width: IMG_WIDTH }) :
							React.createElement(ColorModalComponent, { color: backgroundColor });
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
									React.createElement(ErrorBoundary, {
											id: "ViewProfilePictureButtonComponent",
											plugin: config.info.name,
											fallback: React.createElement(ErrorComponent, { className })
										},
										React.createElement(ViewProfilePictureButtonComponent, {
											className,
											onClick: _ => this.clickHandler(user, bannerObject, Modules.ProfileTypeEnum.POPOUT === profileType)
										}))
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
				}
			}
		}
	})();
	return [Plugin, Modules]
}

function pluginErrorAlert(content) {
	BdApi.alert(config.info.name, content);
}

function getErrorPlugin(message) {
	return () => ({
		stop() {},
		start() {
			pluginErrorAlert(message);
		}
	})
}

function checkModules(Modules) {
	return Object.entries(Modules).reduce((acc, [moduleName, { module, fallback, isBreakable, withKey }]) => {
		if ((withKey && !module.module) || !module) {
			if (isBreakable) acc[0] = true;
			acc[2].push(moduleName);
			if (fallback) acc[1][moduleName] = fallback;
		} else
			acc[1][moduleName] = module;
		return acc;
	}, [false, {},
		[]
	]);
}

function initPlugin() {
	const [Plugin, Modules] = getPlugin();

	const [pluginBreakingError, SafeModules, BrokenModules] = checkModules(Modules);
	if (pluginBreakingError)
		return getErrorPlugin([
			"**Plugin is broken:** Take a screenshot of this popup and show it to the dev.",
			`\`\`\`md\nMissing modules:\n\n${BrokenModules.map((moduleName,i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
		]);
	else {
		if (BrokenModules.length > 0)
			pluginErrorAlert([
				"Detected some Missing modules, certain aspects of the plugin may not work properly.",
				`\`\`\`md\n[Missing modules]\n\n${BrokenModules.map((moduleName,i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
			]);
		return Plugin(SafeModules);
	}
}

module.exports = initPlugin();
