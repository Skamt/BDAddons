function main(API) {
	const { Webpack: { Filters, getModule } } = API;

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
			Tooltip: {
				module: DiscordModules.Tooltip,
				isBreakable: true
			},
			Dispatcher: {
				module: DiscordModules.Dispatcher
			},
			ModalRoot: {
				module: DiscordModules.ModalRoot,
				fallback: function fallbackModalRoot(props) {
					return React.createElement('div', { ...props, style: { pointerEvents: "all" } })
				},
				errorNote: "Sloppy fallback is used"
			},
			openModal: {
				module: DiscordModules.openModal,
				isBreakable: true
			},
			ImageModal: {
				module: getModule(DiscordModules.ImageModal, { searchExports: true }),
				isBreakable: true
			},
			ModalCarousel: {
				module: DiscordModules.ModalCarousel,
				isBreakable: true
			},
			UserBannerMask: {
				module: DiscordModules.UserBannerMask,
				isBreakable: true
			},
			ProfileTypeEnum: {
				module: DiscordModules.ProfileTypeEnum,
				fallback: { POPOUT: 0, MODAL: 1, SETTINGS: 2, PANEL: 3, CARD: 4 },
				errorNote: "fallback is used, there maybe side effects"
			},
			UserStore: {
				module: DiscordModules.UserStore
			},
			SelectedGuildStore: {
				module: DiscordModules.SelectedGuildStore,
				errorNote: "Something with servers"
			},
			renderLinkComponent: {
				module: DiscordModules.renderLinkComponent,
				fallback: function fallbackRenderLinkComponent(props) {
					return React.createElement('a', props)
				},
				errorNote: "Sloppy falback is used"
			}
		},
		Plugin(Modules) {
			const {
				UI,
				DOM,
				React,
				Patcher
			} = API;

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
				getImageModalComponent: (Url, props) => React.createElement(Modules.ImageModal, {
					...props,
					src: Url,
					original: Url,
					renderLinkComponent: p => React.createElement(Modules.renderLinkComponent, p)
				})
			};

			// Constants
			const IMG_WIDTH = 4096;

			// Components
			const ErrorBoundary = require("components/ErrorBoundary.jsx");
			const ErrorComponent = require("components/ErrorComponent.jsx");
			const ViewProfilePictureButtonComponent = require("components/ViewProfilePictureButtonComponent.jsx");
			const DisplayCarouselComponent = require("components/DisplayCarouselComponent.jsx");
			const ColorModalComponent = require("components/ColorModalComponent.jsx");

			// Styles
			function addStyles() {
				DOM.addStyle(require("styles.css"));
			}

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

						const currentUser = this.getCurrentUser();
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

				setUpCurrentUser() {
					const [getCurrentUser, cleanUp] = (() => {
						let currentUser = null;
						if (!Modules.Dispatcher) return [() => Modules.CurrentUserStore?.getCurrentUser() || {}];

						const resetCurrentUser = () => currentUser = null;
						Modules.Dispatcher.subscribe('LOGOUT', resetCurrentUser);
						return [
							() => {
								if (currentUser) return currentUser;
								const user = Modules.CurrentUserStore?.getCurrentUser();
								if (user) {
									currentUser = user;
								} else {
									try {
										const target = document.querySelector('.panels-3wFtMD .container-YkUktl');
										const instance = API.ReactUtils.getInternalInstance(target);
										const props = API.Utils.findInTree(instance, a => a?.currentUser, { walkable: ["return", "pendingProps"] });
										currentUser = props.currentUser;
									} catch {}
								}
								return currentUser || {};
							},
							() => Modules.Dispatcher.unsubscribe('LOGOUT', resetCurrentUser)
						]
					})();
					this.getCurrentUser = getCurrentUser;
					this.cleanUp = cleanUp;
				}

				start() {
					try {
						addStyles();
						this.setUpCurrentUser();
						this.patchUserBannerMask();
					} catch (e) {
						console.error(e);
					}
				}

				stop() {
					this.cleanUp?.();
					DOM.removeStyle();
					Patcher.unpatchAll();
				}
			}
		}
	}
}