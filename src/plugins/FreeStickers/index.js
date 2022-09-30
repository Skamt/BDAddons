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

	const ANIMATED_STICKER_TAG = "ANIMATED_STICKER_TAG";
	const LOTTIE_STICKER_TAG = "LOTTIE_STICKER_TAG";
	const getStickerSendability = WebpackModules.getModule(Filters.byString("SENDABLE_WITH_PREMIUM", "canUseStickersEverywhere"));
	const StickerStore = WebpackModules.getByProps("getStickerById");
	const StickSendEnum = WebpackModules.getByProps("SENDABLE_WITH_BOOSTED_GUILD");
	const StickerFormat = WebpackModules.getByProps("APNG", "LOTTIE");
	const ComponentDispatch = WebpackModules.getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length);

	const listeners = [];
	const removeListeners = () => listeners.forEach(({ el, event, func }) => el.removeEventListener(event, func));

	const addListener = (el, event, func) => {
		el.addEventListener(event, func);
		listeners.push({ el, event, func });
	};

	const css = require("styles.css");

	return class FreeStickers extends Plugin {
		constructor() {
			super();
		}

		onStop() {
			PluginUtilities.removeStyle(this.getName());
			Patcher.unpatchAll();
			removeListeners();
		}

		onStart() {
			try {
				this.patch();
			} catch (e) {
				console.error(e);
			}
		}

		getSettingsPanel() {
			const panel = this.buildSettingsPanel();
			panel.addListener((id, checked) => {
				if (id === "highlightanimated")
					this.updateStickers();
			});
			return panel.getElement();
		}

		patch() {
			this.patchGetStickerById();
			PluginUtilities.addStyle(this.getName(), css);
			addListener(document, "click", (e) => { this.stickerClickHandler(e) });
			this.updateStickers();
		}

		updateStickers() {
			// trigger the patch
			StickerStore.stickerMetadata.forEach((value, key) => StickerStore.getStickerById(key));
		}

		checkEmbedPerms(channelId) {
			const channel = ChannelStore.getChannel(channelId);
			if (!channel.guild_id) return true;
			return Permissions.can({ permission: 16384n, context: channel, user: UserStore.getCurrentUser().id });
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

		sendStickerAsLink(sticker, channelId) {
			if (this.isLottieSticker(sticker)) return;
			if (sticker["format_type"] === StickerFormat.APNG && !this.settings.sendAnimatedStickers) return;
			const url = `https://media.discordapp.net/stickers/${sticker.id}.webp?size=${this.settings.stickerSize}&passthrough=false&quality=lossless`;
			if (this.checkEmbedPerms(channelId))
				if (this.settings.sendDirectly)
			MessageActions.sendMessage(channelId, {
						content: url,
						validNonShortcutEmojis: []
					});
				else
					ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
						plainText: url
					})
			else
				BdApi.showToast("Missing Embed Permissions");
		}

		stickerClickHandler(e) {
			const targetProps = e.target.__reactProps$;
			if (targetProps && targetProps["data-type"] && targetProps["data-type"].toLowerCase() === "sticker") {
				console.log(e.target);
				console.log(targetProps);
				const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
				const stickerId = targetProps["data-id"];
				const [sendable, sticker] = this.isStickerSendable(stickerId, channel);
				console.log(sendable, sticker)
				if (!sendable) {
					this.sendStickerAsLink(sticker, channel.id);
				}
			}
		}

		patcheStickerStore(args, ret) {
			const sticker = ret;
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
		unpatcheStickerStore(args, ret) {
			const sticker = ret;
			if (sticker && sticker.fixed) {
				sticker.description = sticker.description.replace(LOTTIE_STICKER_TAG, '').replace(ANIMATED_STICKER_TAG, '');
				sticker.fixed = false;
			}
		}

		patchGetStickerById() {
			Patcher.after(StickerStore, "getStickerById", (_, args, ret) => {
				if (this.settings.highlightanimated)
					this.patcheStickerStore(args, ret);
				else
					this.unpatcheStickerStore(args, ret);
			});
		}
	};
};