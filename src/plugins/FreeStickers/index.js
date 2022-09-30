module.exports = (Plugin, Api) => {
	const {
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

	const showToast = (c, o) => { BdApi.showToast(`${config.info.name}: ${c}`, o) };
	const ANIMATED_STICKER_TAG = "ANIMATED_STICKER_TAG";
	const LOTTIE_STICKER_TAG = "LOTTIE_STICKER_TAG";
	const getStickerSendability = WebpackModules.getModule(Filters.byString("SENDABLE_WITH_PREMIUM", "canUseStickersEverywhere"));
	const StickerStore = WebpackModules.getByProps("getStickerById");
	const StickSendEnum = WebpackModules.getByProps("SENDABLE_WITH_BOOSTED_GUILD");
	const StickerFormat = WebpackModules.getByProps("APNG", "LOTTIE");
	const ComponentDispatch = WebpackModules.getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length);
	const STRINGS = {
		sendLottieSticker: "Official Discord Stickers are not supported.",
		missingEmbedPermissions: "Missing Embed Permissions",
		disabledAnimatedStickers: "You have disabled animated stickers in settings."
	};

	const css = require("styles.css");

	return class FreeStickers extends Plugin {
		constructor() {
			super();
			this.stickerClickHandler = this.stickerClickHandler.bind(this);
		}

		onStop() {
			document.removeEventListener("click", this.stickerClickHandler);
			PluginUtilities.removeStyle(this.getName());
			Patcher.unpatchAll();
		}

		onStart() {
			try {
				document.addEventListener("click", this.stickerClickHandler);
				PluginUtilities.addStyle(this.getName(), css);
				this.patchGetStickerById();
				this.updateStickers();
			} catch (e) {
				console.error(e);
			}
		}

		getSettingsPanel() {
			const panel = this.buildSettingsPanel();
			panel.addListener((id, checked) => {
				if (id === "highlightAnimated")
					this.updateStickers();
			});
			return panel.getElement();
		}

		updateStickers() {
			StickerStore.stickerMetadata.forEach((value, key) => StickerStore.getStickerById(key));
		}

		checkEmbedPerms(channelId) {
			const channel = ChannelStore.getChannel(channelId);
			if (!channel.guild_id) return true;
			const embedPerms = Permissions.can({ permission: 16384n, context: channel, user: UserStore.getCurrentUser().id });
			return embedPerms || this.settings.ignoreEmbedPermissions;
		}

		sendAniamted(sticker) {
			return sticker["format_type"] === StickerFormat.APNG && !this.settings.sendAnimatedStickers
		}

		isLottieSticker(sticker) {
			// only lottie stickers have packs (i hope)
			return sticker["pack_id"] || sticker["format_type"] === StickerFormat.LOTTIE;
		}

		isStickerSendable(stickerId, channel) {
			const sticker = StickerStore.getStickerById(stickerId);
			const StickerSendableState = getStickerSendability(sticker, UserStore.getCurrentUser(), channel) === StickSendEnum.SENDABLE;
			return [StickerSendableState, sticker];
		}

		checkSendAsLink(sticker, channelId) {
			if (this.isLottieSticker(sticker))
				return showToast(STRINGS.sendLottieSticker, { type: 'danger' });
			if (this.sendAniamted(sticker))
				return showToast(STRINGS.disabledAnimatedStickers, { type: 'info' })
			if (!this.checkEmbedPerms(channelId))
				return showToast(STRINGS.missingEmbedPermissions, { type: 'info' })

			this.sendStickerAsLink(sticker, channelId);
		}

		sendStickerAsLink(sticker, channelId) {
			const url = `https://media.discordapp.net/stickers/${sticker.id}.webp?size=${this.settings.stickerSize}&passthrough=false&quality=lossless`;
			if (this.settings.sendDirectly)
				MessageActions.sendMessage(channelId, {
					content: url,
					validNonShortcutEmojis: []
				});
			else
				ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
					plainText: url
				})
		}

		stickerHandler({ target, props }) {
			const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
			const stickerId = props["data-id"];
			const [sendable, sticker] = this.isStickerSendable(stickerId, channel);
			if (!sendable)
				this.checkSendAsLink(sticker, channel.id);
		}

		stickerClickHandler(e) {
			const props = e.target.__reactProps$;
			if (props && props["data-type"] && props["data-type"].toLowerCase() === "sticker") {
				this.stickerHandler({ target: e.target, props });
			}
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
				if (this.isLottieSticker(sticker))
					result = LOTTIE_STICKER_TAG
				else if (sticker["format_type"] === StickerFormat.APNG)
					result = ANIMATED_STICKER_TAG;
				sticker.description = `${sticker.description} ${result}`;
				sticker.fixed = true;
			}
		}
		cleanStickerStore(sticker) {
			if (sticker && sticker.fixed) {
				sticker.description = sticker.description.replace(LOTTIE_STICKER_TAG, '').replace(ANIMATED_STICKER_TAG, '');
				sticker.fixed = false;
			}
		}

	};
};