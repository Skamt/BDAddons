function main(Api) {
	const { Webpack: { Filters, getModule } } = BdApi;

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
				module: getModuleAndKey(DiscordModules.StickerModule),
				withKey: true,
				errorNote: "Animated Stickers will not be highlighted."
			},
			Dispatcher: { module: DiscordModules.Dispatcher },
			PendingReplyStore: {
				module: DiscordModules.PendingReplyStore,
				errorNote: "Replies will be ignored"
			},
			Permissions: {
				module: DiscordModules.Permissions,
				errorNote: "Checking permissions is disabled"
			},
			ChannelStore: {
				module: DiscordModules.ChannelStore,
				isBreakable: true
			},
			DiscordPermissions: {
				module: DiscordModules.DiscordPermissions,
				fallback: { EMBED_LINKS: 16384n, USE_EXTERNAL_EMOJIS: 262144n },
				errorNote: "fallback is used, there maybe side effects"
			},
			MessageActions: {
				module: DiscordModules.MessageActions,
				isBreakable: true
			},
			UserStore: {
				module: DiscordModules.UserStore,
				errorNote: "Embed permission checks is disabled."
			},
			StickerStore: {
				module: DiscordModules.StickerStore,
				isBreakable: true
			},
			StickerTypeEnum: {
				module: DiscordModules.StickerTypeEnum,
				fallback: { STANDARD: 1, GUILD: 2 },
				errorNote: "fallback is used, there maybe side effects"
			},
			StickerFormatEnum: {
				module: DiscordModules.StickerFormatEnum,
				fallback: { PNG: 1, APNG: 2, LOTTIE: 3, GIF: 4 },
				errorNote: "fallback is used, there maybe side effects"
			},
			InsertText: {
				module: (() => {
					let ComponentDispatch;
					return (content) => {
						if (!ComponentDispatch) ComponentDispatch = DiscordModules.ComponentDispatch;
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
		Plugin(ParentPlugin, Modules) {
			const {
				UI,
				DOM,
				Patcher
			} = new BdApi(config.info.name);

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
			function addStyles(){
				DOM.addStyle(require("styles.css"));
			}

			return class SendStickersAsLinks extends ParentPlugin {
				constructor() {
					super();
				}

				sendMessage({sticker, channel}) {
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
						this.sendMessage(sticker, channel)
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
										const instance = BdApi.ReactUtils.getInternalInstance(target);
										const props = BdApi.Utils.findInTree(instance, a => a?.currentUser, { walkable: ["return", "pendingProps"] });
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