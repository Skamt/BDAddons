module.exports = () => {
	const {
		UI,
		DOM,
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
	
	const PendingReplyStore = DiscordModules.PendingReplyStore;
	const EmojiIntentionEnum = DiscordModules.EmojiIntentionEnum;
	const EmojiSendAvailabilityEnum = DiscordModules.EmojiSendAvailabilityEnum;
	const EmojiFunctions = DiscordModules.EmojiFunctions;
	const InsertText = (() => {
		let ComponentDispatch;
		return (content) => {
			if (!ComponentDispatch) ComponentDispatch = DiscordModules.ComponentDispatch;
			ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
				plainText: content
			});
		}
	})();

	// Helper functions
	const Utils = {
		showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
		hasEmbedPerms: (channel, user) => !channel.guild_id || Permissions.can({ permission: DiscordPermissions.EMBED_LINKS, context: channel, user }),
		isEmojiSendable: (e) => EmojiFunctions.getEmojiUnavailableReason(e) === null,
		getEmojiUrl: (emoji, size) => `${emoji.url.replace(/(size=)(\d+)[&]/, '')}&size=${size}`,
		getEmojiWebpUrl: (emoji, size) => Utils.getEmojiUrl(emoji, size).replace('gif','webp'),
		getEmojiGifUrl: (emoji, size) => Utils.getEmojiUrl(emoji, size).split('?')[0]
	}

	// Strings & Constants
	const STRINGS = {
		missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
		disabledAnimatedEmojiErrorMessage: "You have disabled animated emojis in settings."
	};

	// styles
	const css = require("styles.css");

	return class Emojis extends Plugin {
		constructor() {
			super();
			this.emojiClickHandler = this.emojiClickHandler.bind(this);
		}

		getEmojiUrl(emoji, size){
			if(this.settings.sendEmojiAsWebp)
				return Utils.getEmojiWebpUrl(emoji, size);
			
			return	Utils.getEmojiGifUrl(emoji);
		}
		sendEmojiAsLink(emoji, channel) {
			if (this.settings.sendDirectly)
				MessageActions.sendMessage(channel.id, {
					content: this.getEmojiUrl(emoji, this.settings.emojiSize),
					validNonShortcutEmojis: []
				}, undefined, this.getReply(channel.id));
			else
				InsertText(Utils.getEmojiUrl(emoji, this.settings.emojiSize));
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
				return Utils.showToast(STRINGS.disabledAnimatedEmojiErrorMessage, "info");
			if (!Utils.hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
				return Utils.showToast(STRINGS.missingEmbedPermissionsErrorMessage, "info");

			this.sendEmojiAsLink(emoji, channel);
		}

		emojiHandler(emoji) {
			const user = UserStore.getCurrentUser();
			const intention = EmojiIntentionEnum.CHAT;
			const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
			if (!Utils.isEmojiSendable({ emoji, channel, intention }))
				this.handleUnsendableEmoji(emoji, channel, user);
		}

		emojiClickHandler(e) {
			if (e.button === 2) return;
			const props = getInternalInstance(e.target)?.pendingProps;
			if (props && props["data-type"]?.toLowerCase() === "emoji" && props.children)
				this.emojiHandler(props.children.props.emoji);
		}

		patchEmojiPickerUnavailable() {
			Patcher.after(EmojiFunctions, "isEmojiFiltered", (_, args, ret) => false);
			Patcher.after(EmojiFunctions, "getEmojiUnavailableReason", (_, args, ret) =>
				ret === EmojiSendAvailabilityEnum.DISALLOW_EXTERNAL ? EmojiSendAvailabilityEnum.PREMIUM_LOCKED : ret
			);
		}

		onStart() {
			try {
				DOM.addStyle(css);
				document.addEventListener("mouseup", this.emojiClickHandler);
				this.patchEmojiPickerUnavailable();
			} catch (e) {
				console.error(e);
			}
		}	

		onStop() {
			document.removeEventListener("mouseup", this.emojiClickHandler);
			DOM.removeStyle();
			Patcher.unpatchAll();
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
}