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

	// Modules
	const StickerStore = WebpackModules.getByProps("getStickerById");
	const StickSendEnum = WebpackModules.getByProps("SENDABLE_WITH_BOOSTED_GUILD");
	const StickTypeEnum = WebpackModules.getByProps("GUILD", "STANDARD");
	const StickerFormat = WebpackModules.getByProps("APNG", "LOTTIE");
	const ComponentDispatch = WebpackModules.getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length);
	const DiscordPermissions = WebpackModules.getModule(m => m.ADMINISTRATOR && typeof(m.ADMINISTRATOR) === "bigint");
	const getStickerSendability = WebpackModules.getModule(Filters.byString("SENDABLE_WITH_PREMIUM", "canUseStickersEverywhere"));

	// Strings & Constants
	const TAGS = {
		ANIMATED_STICKER_TAG: "ANIMATED_STICKER_TAG",
		LOTTIE_STICKER_TAG: "LOTTIE_STICKER_TAG"
	}
	const STRINGS = {
		sendLottieStickerErrorMessage: "Official Discord Stickers are not supported.",
		missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
		disabledAnimatedStickersErrorMessage: "You have disabled animated stickers in settings."
	};

	// Helper functions
	const Utils = {
		showToast: (content, options) => BdApi.showToast(`${config.info.name}: ${content}`, options),
		hasEmbedPerms: (channel, user) => !channel.guild_id || Permissions.can({ permission: DiscordPermissions.EMBED_LINKS, context: channel, user }),
		isAnimatedSticker: sticker => sticker["format_type"] === StickerFormat.APNG,
		isLottieSticker: sticker => sticker.type === StickTypeEnum.STANDARD,
		isStickerSendable: (sticker, channel, user) => getStickerSendability(sticker, user, channel) === StickSendEnum.SENDABLE,
		updateStickers: () => StickerStore.stickerMetadata.forEach((value, key) => StickerStore.getStickerById(key)),
		getStickerUrl: (stickerId, size) => `https://media.discordapp.net/stickers/${stickerId}.webp?size=${size}&passthrough=false&quality=lossless`,
		isTagged: (str) => Object.values(TAGS).some(tag => str.includes(tag)),
	}

	// styles
	const css = require("styles.css");

	return class FreeStickers extends Plugin {
		constructor() {
			super();
			this.stickerClickHandler = this.stickerClickHandler.bind(this);
		}

		handleUnsendableSticker(sticker, channel, user) {
			if (Utils.isLottieSticker(sticker))
				return Utils.showToast(STRINGS.sendLottieStickerErrorMessage, { type: "danger" });
			if (Utils.isAnimatedSticker(sticker) && !this.settings.shouldSendAnimatedStickers)
				return Utils.showToast(STRINGS.disabledAnimatedStickersErrorMessage, { type: "info" });
			if (!Utils.hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
				return Utils.showToast(STRINGS.missingEmbedPermissionsErrorMessage, { type: "info" });

			this.sendStickerAsLink(sticker, channel);
		}

		sendStickerAsLink(sticker, channel) {
			if (this.settings.sendDirectly)
				MessageActions.sendMessage(channel.id, {
					content: Utils.getStickerUrl(sticker.id, this.settings.stickerSize),
					validNonShortcutEmojis: []
				});
			else
				ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
					plainText: Utils.getStickerUrl(sticker.id, this.settings.stickerSize)
				});
		}

		stickerHandler(stickerId) {
			const user = UserStore.getCurrentUser();
			const sticker = StickerStore.getStickerById(stickerId);
			const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
			if (!Utils.isStickerSendable(sticker, channel, user))
				this.handleUnsendableSticker(sticker, channel, user);
		}

		stickerClickHandler(e) {
			const props = e.target.__reactProps$;
			if (props && props["data-type"] && props["data-type"].toLowerCase() === "sticker")
				this.stickerHandler(props["data-id"]);
		}

		patchGetStickerById() {
			/** 
			 * this patch is to add a tag to lottie and animated stickers, to style them
			 * lottie stickers will be put back to grayscale
			 * animated stickers will be highlighted if setting is set to true
			 */
			Patcher.after(StickerStore, "getStickerById", (_, args, sticker) => {
				if (!sticker) return;
				if (!Utils.isTagged(sticker.description || ""))
					this.tagSticker(sticker)
				else if (!this.settings.shouldHighlightAnimated)
					this.unTagSticker(sticker)
			});
		}

		tagSticker(sticker) {
			if (Utils.isLottieSticker(sticker))
				return sticker.description += TAGS.LOTTIE_STICKER_TAG;
			if (Utils.isAnimatedSticker(sticker) && this.settings.shouldHighlightAnimated)
				return sticker.description += TAGS.ANIMATED_STICKER_TAG;
		}

		unTagSticker(sticker) {
			sticker.description = sticker.description.replace(TAGS.ANIMATED_STICKER_TAG, "");
		}

		onStart() {
			try {
				PluginUtilities.addStyle(this.getName(), css);
				document.addEventListener("click", this.stickerClickHandler);
				this.patchGetStickerById();
				Utils.updateStickers();
			} catch (e) {
				Logger.err(e);
			}
		}

		onStop() {
			PluginUtilities.removeStyle(this.getName());
			document.removeEventListener("click", this.stickerClickHandler);
			Patcher.unpatchAll();
			Utils.updateStickers();
		}

		getSettingsPanel() {
			const panel = this.buildSettingsPanel();
			panel.addListener((id, checked) => {
				if (id === "shouldHighlightAnimated")
					Utils.updateStickers();
			});
			return panel.getElement();
		}
	};
};