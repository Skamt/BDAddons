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
	} = BdApi;

	// Modules
	const SelectedChannelStore = DiscordModules.SelectedChannelStore;
	const UserStore = DiscordModules.UserStore;
	const Permissions = DiscordModules.Permissions;
	const ChannelStore = DiscordModules.ChannelStore;
	const DiscordPermissions = DiscordModules.DiscordPermissions;
	const MessageActions = DiscordModules.MessageActions;
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
		get name() { return config.info.name }

		sendEmojiAsLink(emoji, channel) {
			if (this.settings.sendDirectly)
				MessageActions.sendMessage(channel.id, {
					content: Utils.getEmojiUrl(emoji, this.settings.emojiSize),
					validNonShortcutEmojis: []
				});
			else
				InsertText(Utils.getEmojiUrl(emoji, this.settings.emojiSize));
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
			if(e.button === 2) return;
			const props = getInternalInstance(e.target)?.pendingProps;
			if (props && props["data-type"]?.toLowerCase() === "emoji" && props.children)
				this.emojiHandler(props.children.props.emoji);
		}

		patchEmojiPickerUnavailable() {
			Patcher.after(this.name, EmojiFunctions, "isEmojiFiltered", (_, args, ret) => false);
			Patcher.after(this.name, EmojiFunctions, "getEmojiUnavailableReason", (_, args, ret) =>
				ret === EmojiSendAvailabilityEnum.DISALLOW_EXTERNAL ? EmojiSendAvailabilityEnum.PREMIUM_LOCKED : ret
			);
		}

		onStart() {
			try {
				DOM.addStyle(this.name, css);
				document.addEventListener("mouseup", this.emojiClickHandler);
				this.patchEmojiPickerUnavailable();
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			document.removeEventListener("mouseup", this.emojiClickHandler);
			DOM.removeStyle(this.name);
			Patcher.unpatchAll(this.name);
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
}