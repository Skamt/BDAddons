module.exports = (Plugin, Api) => {
	const {
		Filters,
		Patcher,
		Settings,
		WebpackModules,
		PluginUtilities,
		DiscordModules: { Permissions, UserStore, ChannelStore, SelectedChannelStore, MessageActions }
	} = Api;

	const DiscordPermissions = WebpackModules.getModule(m => m.ADMINISTRATOR === 8n);
	const getStickerSendability = WebpackModules.getModule(Filters.byString("SENDABLE_WITH_PREMIUM", "canUseStickersEverywhere"));
	const StickerStore = WebpackModules.getByProps("getStickerById");
	const StickSendEnum = WebpackModules.getByProps("SENDABLE_WITH_BOOSTED_GUILD");
	const StickerFormat = WebpackModules.getByProps("APNG", "LOTTIE");
	const ComponentDispatch = WebpackModules.getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length);

	const ANIMATED_STICKER_TAG = "ANIMATED_STICKER_TAG";
	const LOTTIE_STICKER_TAG = "LOTTIE_STICKER_TAG";
	const STRINGS = {
		sendLottieSticker: "Official Discord Stickers are not supported.",
		missingEmbedPermissions: "Missing Embed Permissions",
		disabledAnimatedStickers: "You have disabled animated stickers in settings."
	};

	const showToast = (content, options) => BdApi.showToast(`${config.info.name}: ${content}`, options);
	const hasEmbedPerms = (channel, user) => channel.guild_id || Permissions.can({ permission: DiscordPermissions.EMBED_LINKS, context: channel, user });
	const isAnimatedSticker = sticker => sticker["format_type"] === StickerFormat.APNG;
	const isLottieSticker = sticker => sticker["pack_id"] || sticker["format_type"] === StickerFormat.LOTTIE;
	const isStickerSendable = (sticker, channel, user) => getStickerSendability(sticker, user, channel) === StickSendEnum.SENDABLE;
	const updateStickers = () => StickerStore.stickerMetadata.forEach((value, key) => StickerStore.getStickerById(key));

	const css = require("styles.css");

	return class FreeStickers extends Plugin {
		constructor() {
			super();
			this.stickerClickHandler = this.stickerClickHandler.bind(this);
		}
		onStart() {
			try {
				document.addEventListener("click", this.stickerClickHandler);
				PluginUtilities.addStyle(this.getName(), css);
				this.patchGetStickerById();
				updateStickers();
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			document.removeEventListener("click", this.stickerClickHandler);
			PluginUtilities.removeStyle(this.getName());
			Patcher.unpatchAll();
		}

		getSettingsPanel() {
			const panel = this.buildSettingsPanel();
			panel.addListener((id, checked) => {
				if (id === "highlightAnimated")
					updateStickers();
			});
			return panel.getElement();
		}

		checkThenSendStickerAsLink(sticker, channel, user) {
			if (isLottieSticker(sticker))
				return showToast(STRINGS.sendLottieSticker, { type: "danger" });
			if (isAnimatedSticker(sticker) && !this.settings.sendAnimatedStickers)
				return showToast(STRINGS.disabledAnimatedStickers, { type: "info" });
			if (hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
				return showToast(STRINGS.missingEmbedPermissions, { type: "info" });

			this.sendStickerAsLink(sticker, channel);
		}

		sendStickerAsLink(sticker, channel) {
			const url = `https://media.discordapp.net/stickers/${sticker.id}.webp?size=${this.settings.stickerSize}&passthrough=false&quality=lossless`;
			if (this.settings.sendDirectly)
				MessageActions.sendMessage(channel.id, {
					content: url,
					validNonShortcutEmojis: []
				});
			else
				ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
					plainText: url
				});
		}

		stickerHandler(stickerId) {
			const user = UserStore.getCurrentUser();
			const sticker = StickerStore.getStickerById(stickerId);
			const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
			if (!isStickerSendable(sticker, channel, user))
				this.checkThenSendStickerAsLink(sticker, channel, user);
		}

		stickerClickHandler(e) {
			const props = e.target.__reactProps$;
			if (props && props["data-type"] && props["data-type"].toLowerCase() === "sticker")
				this.stickerHandler(props["data-id"]);
		}

		patchGetStickerById() {
			Patcher.after(StickerStore, "getStickerById", (_, args, ret) => {
				if (this.settings.highlightAnimated)
					this.patcheStickerStore(ret);
				else
					this.cleanStickerStore(ret);
			});
		}

		patcheStickerStore(sticker) {
			if (sticker && !sticker.fixed) {
				let result = "";
				if (isLottieSticker(sticker)) result = LOTTIE_STICKER_TAG;
				else if (sticker["format_type"] === StickerFormat.APNG) result = ANIMATED_STICKER_TAG;
				sticker.description = `${sticker.description} ${result}`;
				sticker.fixed = true;
			}
		}

		cleanStickerStore(sticker) {
			if (sticker && sticker.fixed) {
				sticker.description = sticker.description.replace(LOTTIE_STICKER_TAG, "").replace(ANIMATED_STICKER_TAG, "");
				sticker.fixed = false;
			}
		}
	};
};