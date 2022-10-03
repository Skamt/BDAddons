/**
 * @name FreeStickers
 * @description Enables you to send custom Stickers without nitro as links, (custom stickers as in the ones that are added by servers, not officiel discord stickers).
 * @version 2.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/FreeStickers
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/FreeStickers/FreeStickers.plugin.js
 */
const config = {
	info: {
		name: "FreeStickers",
		version: "2.0.0",
		description: "Enables you to send custom Stickers without nitro as links, (custom stickers as in the ones that are added by servers, not officiel discord stickers).",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/FreeStickers/FreeStickers.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/FreeStickers",
		authors: [{
			name: "Skamt"
		}]
	},
	changelog: [{
		title: "v2",
		type: "added",
		items: ["Plugin Rewrite as per discord new update. Naturally some features are removed because they are impossible to implement"]
	}],
	defaultConfig: [{
		type: "slider",
		id: "stickerSize",
		name: "Sticker Size",
		note: "The size of the sticker in pixels. 160 is recommended.",
		value: 160,
		markers: [20, 40, 80, 160, 320],
		stickToMarkers: true
	}, {
		type: "switch",
		id: "sendDirectly",
		name: "Send Directly",
		note: "Send the sticker link in a message directly instead of putting it in the chat box.",
		value: true
	}, {
		type: "switch",
		id: "ignoreEmbedPermissions",
		name: "Ignore Embed Permissions",
		note: "Send sticker links regardless of embed permissions, meaning links will not turn into images.",
		value: true
	}, {
		type: "switch",
		id: "sendAnimatedStickers",
		name: "Send animated stickers",
		note: "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)",
		value: true
	}, {
		type: "switch",
		id: "highlightAnimated",
		name: "Highlight animated stickers",
		value: true
	}]
};
class MissinZeresPluginLibraryClass {
	constructor() { this.config = config; }
	load() {
		BdApi.showConfirmationModal('Library plugin is needed',
			[`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`, `Please download it from the officiel website`, 'https://betterdiscord.app/plugin/ZeresPluginLibrary'], {
				confirmText: 'Ok'
			});
	}
	start() {}
	stop() {}
}

function initPlugin([Plugin, Api]) {
	const plugin = (Plugin, Api) => {
		const {
			Logger,
			Filters,
			Patcher,
			Settings,
			WebpackModules,
			PluginUtilities,
			DiscordModules: { Permissions, UserStore, ChannelStore, SelectedChannelStore, MessageActions }
		} = Api;
		// Modules
		const StickerStore = WebpackModules.getByProps("getStickerById");
		const StickSendEnum = WebpackModules.getByProps("SENDABLE_WITH_BOOSTED_GUILD");
		const StickerFormat = WebpackModules.getByProps("APNG", "LOTTIE");
		const ComponentDispatch = WebpackModules.getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length);
		const DiscordPermissions = WebpackModules.getModule(m => m.ADMINISTRATOR && typeof(m.ADMINISTRATOR) === "bigint");
		const getStickerSendability = WebpackModules.getModule(Filters.byString("SENDABLE_WITH_PREMIUM", "canUseStickersEverywhere"));
		// Strings & Constants
		const ANIMATED_STICKER_TAG = "ANIMATED_STICKER_TAG";
		const LOTTIE_STICKER_TAG = "LOTTIE_STICKER_TAG";
		const STRINGS = {
			sendLottieSticker: "Official Discord Stickers are not supported.",
			missingEmbedPermissions: "Missing Embed Permissions",
			disabledAnimatedStickers: "You have disabled animated stickers in settings."
		};
		// Helper functions
		const showToast = (content, options) => BdApi.showToast(`${config.info.name}: ${content}`, options);
		const hasEmbedPerms = (channel, user) => !channel.guild_id || Permissions.can({ permission: DiscordPermissions.EMBED_LINKS, context: channel, user });
		const isAnimatedSticker = sticker => sticker["format_type"] === StickerFormat.APNG;
		const isLottieSticker = sticker => sticker["pack_id"] || sticker["format_type"] === StickerFormat.LOTTIE;
		const isStickerSendable = (sticker, channel, user) => getStickerSendability(sticker, user, channel) === StickSendEnum.SENDABLE;
		const updateStickers = () => StickerStore.stickerMetadata.forEach((value, key) => StickerStore.getStickerById(key));
		const getStickerUrl = (stickerId, size) => `https://media.discordapp.net/stickers/${stickerId}.webp?size=${size}&passthrough=false&quality=lossless`
		const isTagged = (sticker, tag) => sticker.description.includes(tag);
		// styles
		const css = `/* Hide *Can't use this sticker* popout */
.upsellWrapper-3KE9GX {
    display: none;
}
/* remove stickers grayscale */
.stickerUnsendable-PkQAxI{
    filter:unset;
}

/* Highlight animated stickers */
.stickerUnsendable-PkQAxI img[alt$="ANIMATED_STICKER_TAG"]{
	padding:1px;
    border-radius: 12px;
    box-sizing:border-box;
    border: 2px dotted #ff8f09;
}

/* Put grayscale back on lottie stickers */
.stickerUnsendable-PkQAxI img[alt$="LOTTIE_STICKER_TAG"],
.stickerUnsendable-PkQAxI[aria-label$="LOTTIE_STICKER_TAG"]{
	filter: grayscale(100%);
}`;
		return class FreeStickers extends Plugin {
			constructor() {
				super();
				this.stickerClickHandler = this.stickerClickHandler.bind(this);
			}
			handleUnsendableSticker(sticker, channel, user) {
				if (isLottieSticker(sticker))
					return showToast(STRINGS.sendLottieSticker, { type: "danger" });
				if (isAnimatedSticker(sticker) && !this.settings.sendAnimatedStickers)
					return showToast(STRINGS.disabledAnimatedStickers, { type: "info" });
				if (!hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
					return showToast(STRINGS.missingEmbedPermissions, { type: "info" });
				this.sendStickerAsLink(sticker, channel);
			}
			sendStickerAsLink(sticker, channel) {
				if (this.settings.sendDirectly)
					MessageActions.sendMessage(channel.id, {
						content: getStickerUrl(sticker.id, this.settings.stickerSize),
						validNonShortcutEmojis: []
					});
				else
					ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
						plainText: getStickerUrl(sticker.id, this.settings.stickerSize)
					});
			}
			stickerHandler(stickerId) {
				const user = UserStore.getCurrentUser();
				const sticker = StickerStore.getStickerById(stickerId);
				const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
				if (!isStickerSendable(sticker, channel, user))
					this.handleUnsendableSticker(sticker, channel, user);
			}
			stickerClickHandler(e) {
				const props = e.target.__reactProps$;
				if (props && props["data-type"] && props["data-type"].toLowerCase() === "sticker")
					this.stickerHandler(props["data-id"]);
			}
			patchGetStickerById() {
				Patcher.after(StickerStore, "getStickerById", (_, args, sticker) => {
					if (sticker) {
						if (isLottieSticker(sticker))
							this.tagLottieSticker(sticker);
						else if (isAnimatedSticker(sticker)) {
							if (this.settings.highlightAnimated)
								this.addAnimatedStickerHighlightTag(sticker);
							else
								this.removeAnimatedStickerHighlightTag(sticker);
						}
					}
				});
			}
			tagLottieSticker(sticker) {
				if (!isTagged(sticker, LOTTIE_STICKER_TAG))
					sticker.description += LOTTIE_STICKER_TAG;
			}
			addAnimatedStickerHighlightTag(sticker) {
				if (!isTagged(sticker, ANIMATED_STICKER_TAG))
					sticker.description += ANIMATED_STICKER_TAG;
			}
			removeAnimatedStickerHighlightTag(sticker) {
				sticker.description = sticker.description.replace(ANIMATED_STICKER_TAG, "");
			}
			onStart() {
				try {
					PluginUtilities.addStyle(this.getName(), css);
					document.addEventListener("click", this.stickerClickHandler);
					this.patchGetStickerById();
					updateStickers();
				} catch (e) {
					Logger.err(e);
				}
			}
			onStop() {
				PluginUtilities.removeStyle(this.getName());
				document.removeEventListener("click", this.stickerClickHandler);
				Patcher.unpatchAll();
				updateStickers();
			}
			getSettingsPanel() {
				const panel = this.buildSettingsPanel();
				panel.addListener((id, checked) => {
					if (id === "highlightAnimated")
						updateStickers();
				});
				return panel.getElement();
			}
		};
	};
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ? MissinZeresPluginLibraryClass : initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
