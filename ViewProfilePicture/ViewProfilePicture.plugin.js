/**
 * @name ViewProfilePicture
 * @description Adds a button to the user popout and profile that allows you to view the Avatar and banner.
 * @version 1.1.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js
 */

const config = {
	info: {
		name: "ViewProfilePicture",
		version: "1.1.0",
		description: "Adds a button to the user popout and profile that allows you to view the Avatar and banner.",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/ViewProfilePicture/ViewProfilePicture.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/ViewProfilePicture",
		authors: [{
			name: "Skamt"
		}]
	}
};

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
				module: getModule(m => m.defaultProps?.shouldShow, { searchExports: true }),
				isBreakable: true
			},
			Dispatcher: {
				module: getModule(Filters.byProps('dispatch', 'subscribe'))
			},
			ModalRoot: {
				module: getModule(Filters.byStrings('onAnimationEnd'), { searchExports: true }),
				fallback: function fallbackModalRoot(props) {
					return React.createElement('div', { ...props, style: { pointerEvents: "all" } })
				},
				errorNote: "Sloppy fallback is used"
			},
			openModal: {
				module: getModule(Filters.byStrings('onCloseCallback', 'Layer'), { searchExports: true }),
				isBreakable: true
			},
			ImageModal: {
				module: getModule(m => {
					if (!m?.toString || typeof(m?.toString) !== "function") return;
					const strs = ["original", "maxHeight", "maxWidth", "noreferrer noopener"];
					const funcStr = m?.toString();
					for (const s of strs)
						if (!funcStr.includes(s)) return false;
					return true;
				}, { searchExports: true }),
				isBreakable: true
			},
			ModalCarousel: {
				module: getModule(m => m.prototype?.navigateTo && m.prototype?.preloadImage),
				isBreakable: true
			},
			UserBannerMask: {
				module: getModule((m) => m.Z && m.Z.toString().includes('overrideAvatarDecorationURL')),
				isBreakable: true
			},
			ProfileTypeEnum: {
				module: getModule(Filters.byProps('POPOUT', 'SETTINGS'), { searchExports: true }),
				fallback: { POPOUT: 0, MODAL: 1, SETTINGS: 2, PANEL: 3, CARD: 4 },
				errorNote: "fallback is used, there maybe side effects"
			},
			UserStore: {
				module: getModule(Filters.byProps('getCurrentUser', 'getUser'))
			},
			SelectedGuildStore: {
				module: getModule(Filters.byProps('getLastSelectedGuildId')),
				errorNote: "Something with servers"
			},
			Color: {
				module: getModule(Filters.byProps('cmyk', 'hex', 'hsl')),
				errorNote: "Colors will be copied in default format"
			},
			renderLinkComponent: {
				module: getModule(m => m.type?.toString().includes('MASKED_LINK')),
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
					Utils.showToast("Copied!", "success");
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
			const ColorModalComponent = ({ color }) =>
				React.createElement("div", {
						className: "VPP-NoBanner",
						style: { backgroundColor: color }
					},
					React.createElement("a", {
						className: "copyColorBtn",
						onClick: (_) => Utils.copy(color)
					}, "Copy Color"));

			// Styles
			function addStyles() {
				DOM.addStyle(`/* Warning circle in popouts of users who left server overlaps VPP button */
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
}`);
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
						React.createElement(ColorModalComponent, { color: Modules.Color ? Modules.Color(backgroundColor).hex() : backgroundColor });
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

const AddonManager = (() => {
	const API = new BdApi(config.info.name);

	const Modals = {
		AddStyles() {
			if (!document.querySelector('head > bd-head > bd-styles > #AddonManagerCSS'))
				BdApi.DOM.addStyle('AddonManagerCSS', `#modal-container {
    position: absolute;
    z-index: 3000;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    overflow: hidden;
    user-select: text;
    font-family: "gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    --backdrop: #000;
    --modal: #57616f;
    --modal: #313437;
    --head: #25272a;
    --note: #dbdee1;
    --module: #27292b;
    --error-message: #b5bac1;
    --footer: #27292c;
    --close-btn: #5865f2;
    --close-btn-hover: #4752c4;
    --close-btn-active: #3c45a5;
    --added: #2dc770;
    --improved: #949cf7;
    --fixed: #f23f42;
    --notice: #f0b132;
}

#modal-container .backdrop {
    background: var(--backdrop);
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: .85;
}

#modal-container .modal {
    background: var(--modal);
    display: inline-flex;
    flex-direction: column;
    color: white;
    overflow: hidden;
    border-radius: 8px;
    margin: auto;
    max-width: 600px;
    max-height: 70vh;
}

#modal-container .head {
    background: var(--head);
    padding: 12px;
}

#modal-container .head > .title {
    font-size: 1.3rem;
    font-weight: bold;
}

#modal-container .head > .version {
    margin: 2px 0 0 0;
    font-size: 12px;
}

#modal-container .body {
    background: var(--body);
    padding: 10px;
    overflow: hidden auto;
    margin-right:1px;
}

#modal-container .body::-webkit-scrollbar {
    width: 5px;
}

#modal-container .body::-webkit-scrollbar-thumb {
    background-color: #171819;
    border-radius:25px;
}

#modal-container .note {
    color: var(--note);
    font-size: 1rem;
    margin: 8px 0;
}

#modal-container .bm {
    margin: 10px 0;
    font-weight: bold;
}

#modal-container .modules {
    margin: 10px 0;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

#modal-container .module {
    padding: 5px 8px;
    background: var(--module);
    border-radius: 3px;
    flex: 1 0 0;
    white-space: nowrap;
    text-transform: capitalize;
    text-align: center;
}

#modal-container .name {
    display: block;
    line-height: 24px;
    font-size: 16px;
    font-weight: 500;
}

#modal-container .errormessage {
    margin: 2px 0;
    font-size: 13px;
    color: var(--error-message);
}

#modal-container .footer {
    background: var(--footer);
    padding: 10px;
    display: flex;
}

#modal-container button {
    margin-left: auto;
    border-radius: 3px;
    border: none;
    min-width: 96px;
    min-height: 38px;
    width: auto;
    color: #fff;
    background-color: var(--close-btn);
}

#modal-container button:hover {
    background-color: var(--close-btn-hover);
}

#modal-container button:active {
    background-color: var(--close-btn-active);
}

#modal-container.hide {
    display: none;
}

/* animations */
#modal-container .backdrop {
    animation: show-backdrop 300ms ease-out;
}

#modal-container.closing .backdrop {
    animation: hide-backdrop 100ms ease-in;
}

@keyframes show-backdrop {
    from {
        opacity: 0;
    }

    to {
        opacity: .85;
    }
}

@keyframes hide-backdrop {
    from {
        opacity: .85;
    }

    to {
        opacity: 0;
    }
}

#modal-container .modal {
    animation: show-modal 300ms ease-out;
}

#modal-container.closing .modal {
    animation: hide-modal 100ms ease-in;
}

@keyframes show-modal {
    from {
        transform: scale(0);
        opacity: 0;
    }

    to {
        opacity: .85;
        transform: scale(1);
    }
}

@keyframes hide-modal {
    from {
        opacity: .85;
        transform: scale(1);
    }

    to {
        transform: scale(0);
        opacity: 0;
    }
}

/* changelog */
#modal-container .changelog {
    padding: 10px;
    max-width: 450px;
}

#modal-container .changelog .title {
    text-transform: uppercase;
    display: flex;
    align-items: center;
    font-weight: 700;
    margin-top: 20px;
    color: var(--c);
}

#modal-container .changelog .title:after {
    content: "";
    height: 1px;
    flex: 1 1 auto;
    margin-left: 8px;
    opacity: .6;
    background: currentColor;
}

#modal-container .changelog ul {
    list-style: none;
    margin: 20px 0 8px 20px;
}

#modal-container .changelog ul > li {
    position:relative;
    line-height: 20px;
    margin-bottom: 8px;
    color: #c4c9ce;
}

#modal-container .changelog ul > li:before {
    content: "";
    position: absolute;
    background:currentColor;
    top: 10px;
    left: -15px;
    width: 6px;
    height: 6px;
    margin-top: -4px;
    margin-left: -3px;
    border-radius: 50%;
    opacity: .5;
}`);
		},
		openModal(content) {
			this.AddStyles();
			const template = document.createElement("template");
			template.innerHTML = `<div id="modal-container">
									<div class="backdrop"></div>
									${content}
								</div>`;
			const modal = template.content.firstElementChild.cloneNode(true);
			modal.onclick = (e) => {
				if (e.target.classList.contains('close-btn') || e.target.classList.contains('backdrop')) {
					modal.classList.add("closing");
					setTimeout(() => { modal.remove(); }, 100);
				}
			};
			document.querySelector('bd-body').append(modal);
		},
		alert(content) {
			this.openModal(`<div class="modal">
				<div class="head">
					<h2 class="title">${config.info.name}</h2>
					<p class="version">version ${config.info.version}</p>
				</div>
				<div class="body">${content}</div>
				<div class="footer"><button class="close-btn">Close</button></div>
			</div>`);
		},
		showMissingModulesModal(missingModules) {
			this.alert(
				`<p class="note">Detected some Missing modules, certain aspects of the plugin may not work properly.</p>
				<h3 class="bm">Missing Modules:</h3>
				<div class="modules">
					${missingModules.map(([moduleName, errorNote]) => `<div class="module">
					<h3 class="name">${moduleName}</h3>
					<p class="errormessage">${errorNote || "No description provided"}</p>
					</div>`).join('')}
				</div>`);
		},
		showBrokenAddonModal(missingModules) {
			this.alert(
				`<p class="note">Plugin is broken, Take a screenshot of this popup and show it to the dev.</p>
				<h3 class="bm">Missing Modules:</h3>
				<div class="modules">
					${missingModules.map(([moduleName]) => `<div class="module">
						<h3 class="name">${moduleName}</h3>
					</div>`).join('')}
				</div>`);
		},
		showChangelogModal() {
			if (!config.changelog || !Array.isArray(config.changelog)) return;

			const changelog = config.changelog?.map(({ title, type, items }) =>
				`<h3 style="--c:var(--${type});" class="title">${title}</h3>
				<ul class="list">
					${items.map(item => `<li>${item}</li>`).join('')}
				</ul>`).join('')
			this.alert(`<div class="changelog">${changelog}</div>`);
		}
	};

	const Data = {
		get() {
			return this.data;
		},
		save(data) {
			this.data = data;
			API.Data.save('metadata', data);
		},
		Init() {
			this.data = API.Data.load('metadata');
			if (!this.data) {
				this.save({
					version: config.info.version,
					changelog: false,
				});
			}
		}
	};

	const Addon = {
		showChangelog() {
			const { version, changelog = false } = Data.get();
			if (version != config.info.version || !changelog) {
				Modals.showChangelogModal();
				Data.save({
					version: config.info.version,
					changelog: true
				});
			}
		},
		handleBrokenAddon(missingModules) {
			this.getPlugin = () => class BrokenAddon {
				stop() {}
				start() {
					Modals.showBrokenAddonModal(missingModules);
				}
			};;
		},
		handleMissingModules(missingModules) {
			Modals.showMissingModulesModal(missingModules);
		},
		checkModules(modules) {
			return Object.entries(modules).reduce((acc, [moduleName, { module, fallback, errorNote, isBreakable, withKey }]) => {
				if ((withKey && !module.module) || !module) {
					if (isBreakable) acc.isAddonBroken = true;
					acc.missingModules.push([moduleName, errorNote]);
					if (fallback) acc.safeModules[moduleName] = fallback;
				} else
					acc.safeModules[moduleName] = module;
				return acc;
			}, { isAddonBroken: false, safeModules: {}, missingModules: [] });
		},
		start(ParentPlugin) {
			const { Modules, Plugin } = main(API);
			const { isAddonBroken, safeModules, missingModules } = this.checkModules(Modules);
			if (isAddonBroken) {
				this.handleBrokenAddon(missingModules);
			} else {
				if (missingModules.length > 0)
					this.handleMissingModules(missingModules);
				this.getPlugin = () => {
					if (!config.zpl) this.showChangelog();
					return Plugin(safeModules, ParentPlugin);
				};
			}
		},
		Init() {
			if (!config.zpl) return this.start();

			if (!global.ZeresPluginLibrary) {
				this.getPlugin = () => class BrokenAddon {
					stop() {}
					start() {
						BdApi.alert("Missing library", [`**ZeresPluginLibrary** is needed to run **${config.info.name}**.`,
							"Please download it from the officiel website",
							"https://betterdiscord.app/plugin/ZeresPluginLibrary"
						]);
					}
				};
			} else
				this.start(global.ZeresPluginLibrary.buildPlugin(config)[0]);

		}
	};

	return {
		Start() {
			Data.Init();
			Addon.Init();

			return Addon.getPlugin();
		}
	}
})();

module.exports = AddonManager.Start();
