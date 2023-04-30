function main(API) {
	const {
		UI,
		DOM,
		Patcher,
		ReactUtils: { getInternalInstance },
		Webpack: { Filters, getModule }
	} = API;

	return {
		Modules: {
			PendingReplyStore: {
				module: DiscordModules.PendingReplyStore,
				errorNote: "Replies will be ignored"
			},
			EmojiIntentionEnum: {
				module: DiscordModules.EmojiIntentionEnum,
				fallback: { CHAT: 3 },
				errorNote: "fallback is used, there maybe side effects"
			},
			EmojiSendAvailabilityEnum: {
				module: DiscordModules.EmojiSendAvailabilityEnum,
				fallback: { DISALLOW_EXTERNAL: 0, PREMIUM_LOCKED: 2 },
				errorNote: "fallback is used, there maybe side effects"
			},
			EmojiFunctions: {
				module: DiscordModules.EmojiFunctions,
				isBreakable: true
			},
			Dispatcher: {
				module: DiscordModules.Dispatcher,
				errorNote: "replies may missbehave"
			},
			DiscordPermissions: {
				module: DiscordModules.DiscordPermissions,
				fallback: { EMBED_LINKS: 16384n },
				errorNote: "fallback is used, there maybe side effects"
			},
			SelectedChannelStore: {
				module: DiscordModules.SelectedChannelStore,
				isBreakable: true
			},
			MessageActions: {
				module: DiscordModules.MessageActions,
				errorNote: "Send directly is disabled"
			},
			Permissions: {
				module: DiscordModules.Permissions,
				errorNote: "Checking permissions is disabled"
			},
			ChannelStore: {
				module: DiscordModules.ChannelStore,
				isBreakable: true
			},
			UserStore: {
				module: DiscordModules.UserStore,
				errorNote: "Perm checks are disabled"
			},
			InsertText: {
				module: (() => {
					let ComponentDispatch;
					return (content) => {
						if (!ComponentDispatch)
							ComponentDispatch = DiscordModules.ComponentDispatch;

						ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
							plainText: content
						});
					}
				})()
			}
		},
		Plugin(Modules, ParentPlugin) {
			
			// Utilities
			const SelfUtils = {
				showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
				hasEmbedPerms: (channel, user) => !channel.guild_id || Modules.Permissions?.can({ permission: Modules.DiscordPermissions.EMBED_LINKS, context: channel, user }),
				isEmojiSendable: (e) => Modules.EmojiFunctions.getEmojiUnavailableReason(e) === null,
				getEmojiUrl: (emoji, size) => `${emoji.url.replace(/(size=)(\d+)[&]/, '')}&size=${size}`,
				getEmojiWebpUrl: (emoji, size) => SelfUtils.getEmojiUrl(emoji, size).replace('gif', 'webp'),
				getEmojiGifUrl: (emoji, size) => SelfUtils.getEmojiUrl(emoji, size).replace('webp', 'gif')
			}

			// Strings & Constants
			const STRINGS = {
				missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
				disabledAnimatedEmojiErrorMessage: "You have disabled animated emojis in settings."
			};

			// Styles
			function addStyles() {
				DOM.addStyle(require("styles.css"));
			}

			return class Emojis extends ParentPlugin {
				constructor() {
					super();
					this.emojiClickHandler = this.emojiClickHandler.bind(this);
				}

				getEmojiUrl(emoji, size) {
					if (this.settings.sendEmojiAsWebp)
						return SelfUtils.getEmojiWebpUrl(emoji, size);
					if (emoji.animated)
						return SelfUtils.getEmojiGifUrl(emoji, 4096);

					return SelfUtils.getEmojiUrl(emoji, size);
				}

				sendEmojiAsLink(emoji, channel) {
					if (Modules.MessageActions && this.settings.sendDirectly)
						Modules.MessageActions.sendMessage(channel.id, {
							content: this.getEmojiUrl(emoji, this.settings.emojiSize),
							validNonShortcutEmojis: []
						}, undefined, this.getReply(channel.id));
					else
						Modules.InsertText(SelfUtils.getEmojiUrl(emoji, this.settings.emojiSize));
				}

				getReply(channelId) {
					const reply = Modules.PendingReplyStore?.getPendingReply(channelId);
					if (!reply) return {};
					Modules.Dispatcher?.dispatch({ type: "DELETE_PENDING_REPLY", channelId });
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

				handleUnsendableEmoji(emoji, channel, user) {
					if (emoji.animated && !this.settings.shouldSendAnimatedEmojis)
						return SelfUtils.showToast(STRINGS.disabledAnimatedEmojiErrorMessage, "info");
					if (!SelfUtils.hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
						return SelfUtils.showToast(STRINGS.missingEmbedPermissionsErrorMessage, "info");

					this.sendEmojiAsLink(emoji, channel);
				}

				emojiHandler(emoji) {
					const user = this.getCurrentUser();
					const intention = Modules.EmojiIntentionEnum.CHAT;
					const channel = Modules.ChannelStore.getChannel(Modules.SelectedChannelStore.getChannelId());
					if (!SelfUtils.isEmojiSendable({ emoji, channel, intention }))
						this.handleUnsendableEmoji(emoji, channel, user);
				}

				getPickerIntention(event) {
					const picker = event.path.find(i => i.id === 'emoji-picker-tab-panel');
					if (!picker) return [null];
					const pickerInstance = getInternalInstance(picker);
					const { pickerIntention } = API.Utils.findInTree(pickerInstance, m => m && "pickerIntention" in m, { walkable: ["pendingProps", "children", "props"] }) || {};
					return [pickerIntention, picker];
				}

				emojiClickHandler(event) {
					if (event.button === 2) return;
					const [pickerIntention, picker] = this.getPickerIntention(event);
					if (pickerIntention !== Modules.EmojiIntentionEnum.CHAT) return;
					picker.classList.add('CHAT');
					const emojiInstance = getInternalInstance(event.target);
					const props = emojiInstance?.pendingProps;
					if (props && props["data-type"]?.toLowerCase() === "emoji" && props.children) {
						this.emojiHandler(props.children.props.emoji);
					}
				}

				patchEmojiPickerUnavailable() {
					/**
					 * This patches allows server icons to show up on the left side of the picker
					 * if external emojis are disabled, servers get filtered out
					 * and it's handy to scroll through emojis easily
					 */
					Patcher.after(Modules.EmojiFunctions, "isEmojiFiltered", (_, [, , intention], ret) => {
						if (intention !== Modules.EmojiIntentionEnum.CHAT) return ret;
						return false;
					});
					/**
					 * This patch allows emojis to be added to the picker
					 * if external emojis are disabled, they don't get added to the picker
					 * PREMIUM_LOCKED is returned becaause that is what's returned normally 
					 
					 * 0: "DISALLOW_EXTERNAL"
					 * 1: "GUILD_SUBSCRIPTION_UNAVAILABLE"
					 * 2: "PREMIUM_LOCKED"
					 * 3: "ONLY_GUILD_EMOJIS_ALLOWED"
					 * 4: "ROLE_SUBSCRIPTION_LOCKED"
					 * 5: "ROLE_SUBSCRIPTION_UNAVAILABLE"
					 */
					Patcher.after(Modules.EmojiFunctions, "getEmojiUnavailableReason", (_, [{ intention }], ret) => {
						if (intention !== Modules.EmojiIntentionEnum.CHAT) return ret;
						return ret === Modules.EmojiSendAvailabilityEnum.DISALLOW_EXTERNAL ? Modules.EmojiSendAvailabilityEnum.PREMIUM_LOCKED : ret;
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
									} catch { /* empty */ }
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
						this.patchEmojiPickerUnavailable();
						document.addEventListener("mouseup", this.emojiClickHandler);
					} catch (e) {
						console.error(e);
					}
				}

				onStop() {
					this.cleanUp?.();
					DOM.removeStyle();
					Patcher.unpatchAll();
					document.removeEventListener("mouseup", this.emojiClickHandler);
				}

				getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}
			}
		}
	}
}