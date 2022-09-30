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
		items: ["Plugin Rewrite as per discord new update."]
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
		const css = `.upsellWrapper-3KE9GX {
    display: none;
}

.stickerUnsendable-PkQAxI{
    filter:unset;
}

.stickerUnsendable-PkQAxI img[alt$="ANIMATED_STICKER_TAG"]{
	border:1px dashed #ff8f09;
	padding:1px;
	box-sizing:border-box;
}

.stickerUnsendable-PkQAxI img[aria-label$="LOTTIE_STICKER_TAG"]{
	filter: grayscale(100%);
}`;
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
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ? MissinZeresPluginLibraryClass : initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
