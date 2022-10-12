module.exports = (Plugin, Api) => {
	const { Filters, getModule } = BdApi.Webpack;
	const {
		Logger,
		Toasts,
		Patcher,
		PluginUtilities,
		DiscordModules: {
			Permissions,
			UserStore,
			ChannelStore,
			DiscordPermissions,
			SelectedChannelStore,
			MessageActions
		}
	} = Api;

	// Modules
	const EmojiIntentionEnum = getModule(Filters.byProps("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true });
	const EmojiSendAvailabilityEnum = getModule(Filters.byProps("GUILD_SUBSCRIPTION_UNAVAILABLE"), { searchExports: true });
	const EmojiFunctions = getModule(Filters.byProps("getEmojiUnavailableReason"), { searchExports: true });
	const InsertText = (() => {
		let ComponentDispatch;
		return (...args) => {
			if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length, { searchExports: true });
			ComponentDispatch.dispatchToLastSubscribed(...args);
		}
	})();

	// Helper functions
	const Utils = {
		showToast: (content, type) => Toasts[type](`[${config.info.name}] ${content}`),
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

		sendEmojiAsLink(emoji, channel) {
			if (this.settings.sendDirectly)
				MessageActions.sendMessage(channel.id, {
					content: Utils.getEmojiUrl(emoji, this.settings.emojiSize),
					validNonShortcutEmojis: []
				});
			else
				InsertText("INSERT_TEXT", {
					plainText: Utils.getEmojiUrl(emoji, this.settings.emojiSize)
				});
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
			const props = e.target.__reactProps$;
			if (props && props["data-type"] && props["data-type"].toLowerCase() === "emoji")
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
				PluginUtilities.addStyle(this.getName(), css);
				document.addEventListener("mouseup", this.emojiClickHandler);
				this.patchEmojiPickerUnavailable();
			} catch (e) {
				Logger.err(e);
			}
		}

		onStop() {
			document.removeEventListener("mouseup", this.emojiClickHandler);
			PluginUtilities.removeStyle(this.getName());
			Patcher.unpatchAll();
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
}