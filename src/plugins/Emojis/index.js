module.exports = (Plugin, Api) => {
	const {
		Logger,
		Filters,
		Patcher,
		Settings,
		WebpackModules,
		PluginUtilities,
		DiscordModules: {
			Permissions,
			UserStore,
			ChannelStore,
			SelectedChannelStore,
			MessageActions
		}
	} = Api;

	const EmojiIntentionEnum = WebpackModules.getByProps('GUILD_ROLE_BENEFIT_EMOJI');
	const EmojiSendAvailabilityEnum = WebpackModules.getByProps('GUILD_SUBSCRIPTION_UNAVAILABLE');
	const EmojiFunctions = WebpackModules.getByProps('getEmojiUnavailableReason');
	const DiscordPermissions = WebpackModules.getModule(m => m.ADMINISTRATOR && typeof(m.ADMINISTRATOR) === "bigint");
	const ComponentDispatch = WebpackModules.getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length);

	// Helper functions
	const showToast = (content, options) => BdApi.showToast(`${config.info.name}: ${content}`, options);
	const hasEmbedPerms = (channel, user) => !channel.guild_id || Permissions.can({ permission: DiscordPermissions.EMBED_LINKS, context: channel, user });
	const isEmojiSendable = (e) => EmojiFunctions.getEmojiUnavailableReason(e) === null;
	const getEmojiUrl = (emoji, size) => emoji.url.replace(/([?&]size=)(\d+)/, `$1${size}`)

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
					content: getEmojiUrl(emoji, this.settings.emojiSize),
					validNonShortcutEmojis: []
				});
			else
				ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
					plainText: getEmojiUrl(emoji, this.settings.emojiSize)
				});
		}

		handleUnsendableEmoji(emoji, channel, user) {
			if (emoji.animated && !this.settings.shouldSendAnimatedEmojis)
				return showToast(STRINGS.disabledAnimatedEmojiErrorMessage, { type: "info" });
			if (!hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
				return showToast(STRINGS.missingEmbedPermissionsErrorMessage, { type: "info" });

			this.sendEmojiAsLink(emoji, channel);
		}

		emojiHandler(emoji) {
			const user = UserStore.getCurrentUser();
			const intention = EmojiIntentionEnum.CHAT;
			const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
			if (!isEmojiSendable({ emoji, channel, intention }))
				this.handleUnsendableEmoji(emoji, channel, user);
		}

		emojiClickHandler(e) {
			const props = e.target.__reactProps$;
			if (props && props["data-type"] && props["data-type"].toLowerCase() === "emoji")
				this.emojiHandler(props.children.props.emoji);
		}

		onStart() {
			try {
				PluginUtilities.addStyle(this.getName(), css);
				document.addEventListener("mouseup", this.emojiClickHandler);
			} catch (e) {
				Logger.err(e);
			}
		}
		onStop() {
			document.removeEventListener("mouseup", this.emojiClickHandler);
			PluginUtilities.removeStyle(this.getName());
		}
		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
}