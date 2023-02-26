/**
 * @name Emojis
 * @description Send emoji as link if it can't be sent it normally.
 * @version 1.0.1
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Emojis
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Emojis/Emojis.plugin.js
 */
const config = {
	info: {
		name: "Emojis",
		version: "1.0.1",
		description: "Send emoji as link if it can't be sent it normally.",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/Emojis/Emojis.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/Emojis",
		authors: [{
			name: "Skamt"
		}]
	},
	defaultConfig: [{
		type: "switch",
		id: "sendDirectly",
		name: "Send Directly",
		note: "Send the emoji link in a message directly instead of putting it in the chat box.",
		value: false
	}, {
		type: "switch",
		id: "ignoreEmbedPermissions",
		name: "Ignore Embed Permissions",
		note: "Send emoji links regardless of embed permissions, meaning links will not turn into images.",
		value: false
	}, {
		type: "switch",
		id: "shouldSendAnimatedEmojis",
		name: "Send animated emojis",
		note: "Animated emojis are sent as GIFs, making most of them hidden by discord's GIF tag.",
		value: false
	}, {
		type: "switch",
		id: "sendEmojiAsWebp",
		name: "Send animated as webp",
		note: "Meaning the emoji will show only the first frame, making them act as normal emoji, unless the first frame is empty.",
		value: false
	}, {
		type: "slider",
		id: "emojiSize",
		name: "Emoji Size",
		note: "The size of the Emoji in pixels.",
		value: 96,
		markers: [40, 48, 60, 64, 80, 96],
		stickToMarkers: true
	}]
};

function initPlugin([Plugin, Api]) {
	const plugin = () => {
		const {
			UI,
			DOM,
			Utils,
			Patcher,
			ReactUtils: {
				getInternalInstance
			},
			Webpack: {
				Filters,
				getModule
			}
		} = new BdApi(config.info.name);

		// Modules
		const { DiscordModules: { Dispatcher, DiscordPermissions, SelectedChannelStore, MessageActions, Permissions, ChannelStore, UserStore } } = Api;

		const PendingReplyStore = getModule(m => m.getPendingReply);
		const EmojiIntentionEnum = getModule(Filters.byProps('GUILD_ROLE_BENEFIT_EMOJI'), { searchExports: true });
		const EmojiSendAvailabilityEnum = getModule(Filters.byProps('GUILD_SUBSCRIPTION_UNAVAILABLE'), { searchExports: true });
		const EmojiFunctions = getModule(Filters.byProps('getEmojiUnavailableReason'), { searchExports: true });
		const InsertText = (() => {
			let ComponentDispatch;
			return (content) => {
				if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners('INSERT_TEXT').length, { searchExports: true });
				ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
					plainText: content
				});
			}
		})();

		// Helper functions
		const SelfUtils = {
			showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
			hasEmbedPerms: (channel, user) => !channel.guild_id || Permissions.can({ permission: DiscordPermissions.EMBED_LINKS, context: channel, user }),
			isEmojiSendable: (e) => EmojiFunctions.getEmojiUnavailableReason(e) === null,
			getEmojiUrl: (emoji, size) => `${emoji.url.replace(/(size=)(\d+)[&]/, '')}&size=${size}`,
			getEmojiWebpUrl: (emoji, size) => SelfUtils.getEmojiUrl(emoji, size).replace('gif', 'webp'),
			getEmojiGifUrl: (emoji, size) => SelfUtils.getEmojiUrl(emoji, size).replace('webp', 'gif')
		}

		// Strings & Constants
		const STRINGS = {
			missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
			disabledAnimatedEmojiErrorMessage: "You have disabled animated emojis in settings."
		};

		// styles
		const css = `.CHAT .premiumPromo-1eKAIB {
    display:none;
}
.emojiItemDisabled-3VVnwp {
    filter: unset;
}`;

		return class Emojis extends Plugin {
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
				if (this.settings.sendDirectly)
					MessageActions.sendMessage(channel.id, {
						content: this.getEmojiUrl(emoji, this.settings.emojiSize),
						validNonShortcutEmojis: []
					}, undefined, this.getReply(channel.id));
				else
					InsertText(SelfUtils.getEmojiUrl(emoji, this.settings.emojiSize));
			}

			getReply(channelId) {
				const reply = PendingReplyStore.getPendingReply(channelId);
				if (!reply) return {};
				Dispatcher.dispatch({ type: "DELETE_PENDING_REPLY", channelId });
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
				const user = UserStore.getCurrentUser();
				const intention = EmojiIntentionEnum.CHAT;
				const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
				if (!SelfUtils.isEmojiSendable({ emoji, channel, intention }))
					this.handleUnsendableEmoji(emoji, channel, user);
			}

			getPickerIntention(event) {
				const picker = event.path.find(i => i.id === 'emoji-picker-tab-panel');
				if (!picker) return [null];
				const pickerInstance = getInternalInstance(picker);
				const { pickerIntention } = BdApi.Utils.findInTree(pickerInstance, m => m && "pickerIntention" in m, { walkable: ["pendingProps", "children", "props"] }) || {};
				return [pickerIntention, picker];
			}

			emojiClickHandler(event) {
				if (event.button === 2) return;
				const [pickerIntention, picker] = this.getPickerIntention(event);
				if (pickerIntention !== EmojiIntentionEnum.CHAT) return;
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
				Patcher.after(EmojiFunctions, "isEmojiFiltered", (_, [, , intention], ret) => {
					if (intention !== EmojiIntentionEnum.CHAT) return ret;
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
				Patcher.after(EmojiFunctions, "getEmojiUnavailableReason", (_, [{ intention }], ret) => {
					if (intention !== EmojiIntentionEnum.CHAT) return ret;
					return ret === EmojiSendAvailabilityEnum.DISALLOW_EXTERNAL ? EmojiSendAvailabilityEnum.PREMIUM_LOCKED : ret;
				});
			}

			onStart() {
				try {
					DOM.addStyle(css);
					this.patchEmojiPickerUnavailable();
					document.addEventListener("mouseup", this.emojiClickHandler);
				} catch (e) {
					console.error(e);
				}
			}

			onStop() {
				DOM.removeStyle();
				Patcher.unpatchAll();
				document.removeEventListener("mouseup", this.emojiClickHandler);
			}

			getSettingsPanel() {
				return this.buildSettingsPanel().getElement();
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
