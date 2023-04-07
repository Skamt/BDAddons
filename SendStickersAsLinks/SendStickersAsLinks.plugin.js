/**
 * @name SendStickersAsLinks
 * @description Enables you to send custom Stickers as links, (custom stickers as in the ones that are added by servers, not official discord stickers).
 * @version 2.1.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js
 */

const config = {
	info: {
		name: "SendStickersAsLinks",
		version: "2.1.0",
		description: "Enables you to send custom Stickers as links, (custom stickers as in the ones that are added by servers, not official discord stickers).",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks",
		authors: [{
			name: "Skamt"
		}]
	},
	defaultConfig: [{
		type: "switch",
		id: "sendDirectly",
		name: "Send Directly",
		note: "Send the sticker link in a message directly instead of putting it in the chat box.",
		value: false
	}, {
		type: "switch",
		id: "ignoreEmbedPermissions",
		name: "Ignore Embed Permissions",
		note: "Send sticker links regardless of embed permissions, meaning links will not turn into images.",
		value: false
	}, {
		type: "switch",
		id: "shouldSendAnimatedStickers",
		name: "Send animated stickers",
		note: "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)",
		value: false
	}, {
		type: "switch",
		id: "shouldHighlightAnimated",
		name: "Highlight animated stickers",
		value: true
	}, {
		type: "slider",
		id: "stickerSize",
		name: "Sticker Size",
		note: "The size of the sticker in pixels. 160 is recommended.",
		value: 160,
		markers: [80, 100, 128, 160],
		stickToMarkers: true
	}],
	zpl: true
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
			StickerModule: {
				module: getModuleAndKey(Filters.byStrings('sticker', 'withLoadingIndicator')),
				withKey: true,
				errorNote: "Animated Stickers will not be highlighted."
			},
			Dispatcher: {
				module: getModule(Filters.byProps('dispatch', 'subscribe'))
			},
			PendingReplyStore: {
				module: getModule(m => m.getPendingReply),
				errorNote: "Replies will be ignored"
			},
			Permissions: {
				module: getModule(Filters.byProps('computePermissions')),
				errorNote: "Checking permissions is disabled"
			},
			ChannelStore: {
				module: getModule(Filters.byProps('getChannel', 'getDMFromUserId')),
				isBreakable: true
			},
			DiscordPermissions: {
				module: getModule(Filters.byProps('ADD_REACTIONS'), { searchExports: true }),
				fallback: { EMBED_LINKS: 16384n, USE_EXTERNAL_EMOJIS: 262144n },
				errorNote: "fallback is used, there maybe side effects"
			},
			MessageActions: {
				module: getModule(Filters.byProps('jumpToMessage', '_sendMessage')),
				isBreakable: true
			},
			UserStore: {
				module: getModule(Filters.byProps('getCurrentUser', 'getUser')),
				errorNote: "Embed permission checks is disabled."
			},
			StickerStore: {
				module: getModule(Filters.byProps('getStickerById')),
				isBreakable: true
			},
			StickerTypeEnum: {
				module: getModule(Filters.byProps('GUILD', 'STANDARD'), { searchExports: true }),
				fallback: { STANDARD: 1, GUILD: 2 },
				errorNote: "fallback is used, there maybe side effects"
			},
			StickerFormatEnum: {
				module: getModule(Filters.byProps('APNG', 'LOTTIE'), { searchExports: true }),
				fallback: { PNG: 1, APNG: 2, LOTTIE: 3, GIF: 4 },
				errorNote: "fallback is used, there maybe side effects"
			},
			InsertText: {
				module: (() => {
					let ComponentDispatch;
					return (content) => {
						if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners('INSERT_TEXT').length, { searchExports: true });
						ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
							plainText: content
						});
					}
				})()
			},
			...(() => {
				const result = {
					StickersSendability: { module: undefined, isBreakable: true },
					StickersSendabilityEnum: {
						module: undefined,
						fallback: {
							NONSENDABLE: 2,
							SENDABLE: 0,
							SENDABLE_WITH_BOOSTED_GUILD: 3,
							SENDABLE_WITH_PREMIUM: 1
						},
						errorNote: "fallback is used, there maybe side effects"
					},
					getStickerSendability: { module: undefined, isBreakable: true },
					isStickerSendable: { module: undefined, isBreakable: true }
				};
				result.StickersSendability.module = getModule(m => Object.keys(m).some(key => m[key]?.SENDABLE_WITH_BOOSTED_GUILD));
				if (!result.StickersSendability) return result;
				const exports = Object.entries(result.StickersSendability.module).map(([key, fn]) => (fn.key = key, fn));
				result.StickersSendabilityEnum.module = exports.splice(exports.findIndex(Filters.byProps('SENDABLE_WITH_BOOSTED_GUILD')), 1)[0];
				result.getStickerSendability.module = exports.splice(exports.findIndex(Filters.byStrings('canUseStickersEverywhere')), 1)[0];
				result.isStickerSendable.module = exports[0];
				return result;
			})()
		},
		Plugin(Modules, ParentPlugin) {
			const {
				UI,
				DOM,
				Patcher
			} = API;

			// Utilities
			const Utils = {
				showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
				getStickerUrl: (stickerId, size) => `https://media.discordapp.net/stickers/${stickerId}?size=${size}&passthrough=false`,
				hasEmbedPerms: (channel, user) => !channel.guild_id || Modules.Permissions?.can({ permission: Modules.DiscordPermissions.EMBED_LINKS, context: channel, user }),
				isLottieSticker: sticker => sticker.type === Modules.StickerTypeEnum.STANDARD,
				isAnimatedSticker: sticker => sticker["format_type"] === Modules.StickerFormatEnum.APNG,
				isStickerSendable: (sticker, channel, user) => Modules.getStickerSendability(sticker, user, channel) === Modules.StickersSendabilityEnum.SENDABLE
			};

			// Strings & Constants
			const TAGS = {
				ANIMATED_STICKER_TAG: "ANIMATED_STICKER_TAG"
			};
			const STRINGS = {
				sendLottieStickerErrorMessage: "Official Discord Stickers are not supported.",
				missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
				disabledAnimatedStickersErrorMessage: "You have disabled animated stickers in settings."
			};

			// Styles
			function addStyles() {
				DOM.addStyle(`.animatedSticker{
    position:relative;
}

.animatedSticker:before{
    content:'';
    padding:2px;
    background:linear-gradient(-135deg, #42ff42 8%, transparent 0);
    position:absolute;
    width:100%;
    height:100%;
    top:-2px;
    left:-2px;
    z-index:55;
}

.stickerInspected-mwnU6w .animatedSticker:before{
    border-radius:4px;
}`);
			}

			return class SendStickersAsLinks extends ParentPlugin {
				constructor() {
					super();
				}

				sendMessage({ sticker, channel }) {
					Modules.MessageActions.sendMessage(channel.id, {
						content: Utils.getStickerUrl(sticker.id, this.settings.stickerSize),
						validNonShortcutEmojis: []
					}, undefined, this.getReply(channel.id));
				}

				handleUnsendableSticker({ user, sticker, channel }) {
					if (Utils.isAnimatedSticker(sticker) && !this.settings.shouldSendAnimatedStickers)
						return Utils.showToast(STRINGS.disabledAnimatedStickersErrorMessage, "info");
					if (!Utils.hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
						return Utils.showToast(STRINGS.missingEmbedPermissionsErrorMessage, "info");

					this.sendStickerAsLink(sticker, channel);
				}

				sendStickerAsLink(sticker, channel) {
					if (this.settings.sendDirectly)
						this.sendMessage({ sticker, channel })
					else
						Modules.InsertText(Utils.getStickerUrl(sticker.id, this.settings.stickerSize));
				}

				getReply(channelId) {
					const reply = Modules.PendingReplyStore?.getPendingReply(channelId);
					if (!reply) return {};
					return {
						messageReference: {
							guild_id: reply.channel.guild_id,
							channel_id: reply.channel.id,
							message_id: reply.message.id
						},
						allowedMentions: reply.shouldMention ? undefined : {
							parse: ["users", "roles", "everyone"],
							replied_user: false
						}
					}
				}

				handleSticker(channelId, stickerId) {
					const user = this.getCurrentUser();
					const sticker = Modules.StickerStore.getStickerById(stickerId);
					const channel = Modules.ChannelStore.getChannel(channelId);
					return {
						user,
						sticker,
						channel,
						isSendable: Utils.isStickerSendable(sticker, channel, user)
					}
				}

				patchSendSticker() {
					/** 
					 * The existance of this plugin implies the existance of this patch 
					 */
					Patcher.instead(Modules.MessageActions, 'sendStickers', (_, args, originalFunc) => {
						const [channelId, [stickerId]] = args;
						const stickerObj = this.handleSticker(channelId, stickerId);
						if (stickerObj.isSendable)
							originalFunc.apply(_, args)
						else
							this.handleUnsendableSticker(stickerObj);
					});
				}

				patchStickerAttachement() {
					/** 
					 * Since we enabled stickers to be clickable
					 * If you click on a sticker while the textarea has some text
					 * the sticker will be added as attachment, and therefore triggers an api request
					 * must intercept, adapt, overcome, what..?
					 */
					Patcher.before(Modules.MessageActions, 'sendMessage', (_, args) => {
						const [channelId, , , attachments] = args;
						if (attachments && attachments.stickerIds && attachments.stickerIds.filter) {
							const [stickerId] = attachments.stickerIds;
							const stickerObj = this.handleSticker(channelId, stickerId);
							if (!stickerObj.isSendable) {
								delete args[3].stickerIds;
								setTimeout(() => {
									this.sendMessage(stickerObj);
								}, 0)
							}
						}
					})
				}

				patchChannelGuildPermissions() {
					if (Modules.Permissions)
						Patcher.after(Modules.Permissions, "can", (_, [{ permission }], ret) =>
							ret || Modules.DiscordPermissions.USE_EXTERNAL_EMOJIS === permission
						);
				}

				patchStickerClickability() {
					// if it's a guild sticker return true to make it clickable 
					// ignoreing discord's stickers because ToS, and they're not regular images
					Patcher.after(Modules.StickersSendability, Modules.isStickerSendable.key, (_, args, returnValue) => {
						return args[0].type === Modules.StickerTypeEnum.GUILD;
					});
				}

				patchGetStickerById() {
					if (Modules.StickerModule)
						Patcher.after(Modules.StickerModule, Modules.StickerModule.key, (_, args, returnValue) => {
							const { size, sticker } = returnValue.props.children[0].props;
							if (size === 96) {
								if (this.settings.shouldHighlightAnimated && !Utils.isLottieSticker(sticker) && Utils.isAnimatedSticker(sticker)) {
									returnValue.props.children[0].props.className += " animatedSticker"
								}
							}
						});
				}

				patchStickerSuggestion() {
					// Enable suggestions for custom stickers only 
					if (Modules.StickersSendability)
						Patcher.after(Modules.StickersSendability, Modules.getStickerSendability.key, (_, args, returnValue) => {
							if (args[0].type === Modules.StickerTypeEnum.GUILD) {
								const { SENDABLE } = Modules.StickersSendabilityEnum;
								return returnValue !== SENDABLE ? SENDABLE : returnValue;
							}
						});
				}

				setUpCurrentUser() {
					const [getCurrentUser, cleanUp] = (() => {
						let currentUser = null;
						if (!Modules.Dispatcher) return [() => Modules.UserStore?.getCurrentUser() || {}];

						const resetCurrentUser = () => currentUser = null;
						Modules.Dispatcher.subscribe('LOGOUT', resetCurrentUser);
						return [
							() => {
								if (currentUser) return currentUser;
								const user = Modules.UserStore?.getCurrentUser();
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

				onStart() {
					try {
						addStyles();
						this.setUpCurrentUser();
						this.patchStickerClickability();
						this.patchSendSticker();
						this.patchGetStickerById();
						this.patchStickerAttachement();
						this.patchStickerSuggestion();
						this.patchChannelGuildPermissions();
					} catch (e) {
						console.error(e);
					}
				}

				onStop() {
					this.cleanUp?.();
					DOM.removeStyle();
					Patcher.unpatchAll();
				}

				getSettingsPanel() {
					const panel = this.buildSettingsPanel();
					return panel.getElement();
				}
			};
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
