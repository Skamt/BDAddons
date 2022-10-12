/**
 * @name FreeStickers
 * @description Enables you to send custom Stickers without nitro as links, (custom stickers as in the ones that are added by servers, not official discord stickers).
 * @version 2.0.2
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/FreeStickers
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/FreeStickers/FreeStickers.plugin.js
 */
const config = {
	info: {
		name: "FreeStickers",
		version: "2.0.2",
		description: "Enables you to send custom Stickers without nitro as links, (custom stickers as in the ones that are added by servers, not official discord stickers).",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/FreeStickers/FreeStickers.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/FreeStickers",
		authors: [{
			name: "Skamt"
		}]
	},
	changelog: [{
		title: "Feature",
		type: "added",
		items: ["Stickers will now show up in the Picker even if the user does not have permission."]
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
		value: false
	}, {
		type: "switch",
		id: "ignoreEmbedPermissions",
		name: "Ignore Embed Permissions",
		note: "Send sticker links regardless of embed permissions, meaning links will not turn into images.",
		value: false
	}, {
		type: "switch",
		id: "shouldSendAnimatedStickers",
		name: "Send animated stickers",
		note: "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)",
		value: false
	}, {
		type: "switch",
		id: "shouldHighlightAnimated",
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
		const { Filters, getModule } = BdApi.Webpack;
		const {
			Logger,
			Toasts,
			Patcher,
			Utilities,
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
		const ChannelTextArea = getModule((m) => m.type.render.toString().includes('CHANNEL_TEXT_AREA'));
		const StickerStore = getModule(Filters.byProps("getStickerById"), { searchExports: true });
		const StickSendEnum = getModule(Filters.byProps("SENDABLE_WITH_BOOSTED_GUILD"), { searchExports: true });
		const StickTypeEnum = getModule(Filters.byProps("GUILD", "STANDARD"), { searchExports: true });
		const StickerFormat = getModule(Filters.byProps("APNG", "LOTTIE"), { searchExports: true });
		const getStickerSendability = getModule(Filters.byStrings("SENDABLE_WITH_PREMIUM", "canUseStickersEverywhere"), { searchExports: true });
		const InsertText = (() => {
			let ComponentDispatch;
			return (...args) => {
				if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length, { searchExports: true });
				ComponentDispatch.dispatchToLastSubscribed(...args);
			}
		})();
		// Strings & Constants
		const TAGS = {
			ANIMATED_STICKER_TAG: "ANIMATED_STICKER_TAG",
			LOTTIE_STICKER_TAG: "LOTTIE_STICKER_TAG"
		};
		const STRINGS = {
			sendLottieStickerErrorMessage: "Official Discord Stickers are not supported.",
			missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
			disabledAnimatedStickersErrorMessage: "You have disabled animated stickers in settings."
		};
		// Helper functions
		const Utils = {
			showToast: (content, type) => Toasts[type](`[${config.info.name}] ${content}`),
			hasEmbedPerms: (channel, user) => !channel.guild_id || Permissions.can({ permission: DiscordPermissions.EMBED_LINKS, context: channel, user }),
			isAnimatedSticker: sticker => sticker["format_type"] === StickerFormat.APNG,
			isLottieSticker: sticker => sticker.type === StickTypeEnum.STANDARD,
			isStickerSendable: (sticker, channel, user) => getStickerSendability(sticker, user, channel) === StickSendEnum.SENDABLE,
			updateStickers: () => StickerStore.stickerMetadata.forEach((value, key) => StickerStore.getStickerById(key)),
			getStickerUrl: (stickerId, size) => `https://media.discordapp.net/stickers/${stickerId}.webp?passthrough=false&quality=lossless&size=${size}`,
			isTagged: (str) => Object.values(TAGS).some(tag => str.includes(tag)),
		};
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
				if (Utils.isLottieSticker(sticker))
					return Utils.showToast(STRINGS.sendLottieStickerErrorMessage, "danger");
				if (Utils.isAnimatedSticker(sticker) && !this.settings.shouldSendAnimatedStickers)
					return Utils.showToast(STRINGS.disabledAnimatedStickersErrorMessage, "info");
				if (!Utils.hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
					return Utils.showToast(STRINGS.missingEmbedPermissionsErrorMessage, "info");
				this.sendStickerAsLink(sticker, channel);
			}
			sendStickerAsLink(sticker, channel) {
				if (this.settings.sendDirectly)
					MessageActions.sendMessage(channel.id, {
						content: Utils.getStickerUrl(sticker.id, this.settings.stickerSize),
						validNonShortcutEmojis: []
					});
				else
					InsertText("INSERT_TEXT", {
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
				 * this patch is for adding a tag to lottie and animated stickers, to style them
				 * the sticker description gets added to the alt/aria-label DOM attributes
				 * lottie stickers will be put back to grayscale
				 * animated stickers will be highlighted if setting is set to true
				 */
				Patcher.after(StickerStore.__proto__, "getStickerById", (_, args, sticker) => {
					if (!sticker) return;
					if (!Utils.isTagged(sticker.description || ""))
						this.tagSticker(sticker);
					else if (!this.settings.shouldHighlightAnimated)
						this.unTagSticker(sticker);
				});
			}
			patchChannelTextArea() {
				/** 
				 * this patch is for adding a local permission override to the current channel
				 * so that stickers show up in the picker.
				 * 262144n is for Sending external Emojis permission
				 * which is what's needed to let stickers show up in the picker.
				 * While this may feel like a feature bypass, I believe if a sticker is posted as an image, 
				 * it's no a sticker anymore.
				 */
				Patcher.before(ChannelTextArea.type, "render", (_, [{ channel }]) => {
					const userId = UserStore.getCurrentUser().id;
					channel.permissionOverwrites[userId] = {
						id: userId,
						type: 1,
						allow: 262144n,
						deny: 0n
					};
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
					this.patchChannelTextArea();
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
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ? MissinZeresPluginLibraryClass : initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
