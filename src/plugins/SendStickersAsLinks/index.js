module.exports = () => {
	const {
		UI,
		DOM,
		Patcher,
		Webpack: {
			Filters,
			getModule
		}
	} = BdApi;

	// Modules
	const Permissions = DiscordModules.Permissions;
	const ChannelStore = DiscordModules.ChannelStore;
	const DiscordPermissions = DiscordModules.DiscordPermissions;
	const MessageActions = DiscordModules.MessageActions;
	const UserStore = DiscordModules.UserStore;
	const StickerStore = DiscordModules.StickerStore;
	const ChannelTextArea = DiscordModules.ChannelTextArea;
	const StickerTypeEnum = DiscordModules.StickerTypeEnum;
	const StickerFormatEnum = DiscordModules.StickerFormatEnum;
	let StickersSendabilityEnumKey, getStickerSendabilityKey, isSendableStickerKey;
	const StickersSendability = getModule(exp => {
		const keys = Object.keys(exp);
		if (keys.some(key => exp[key]?.SENDABLE_WITH_BOOSTED_GUILD)) {
			StickersSendabilityEnumKey = keys.find(key => exp[key].SENDABLE_WITH_BOOSTED_GUILD);
			getStickerSendabilityKey = keys.find(key => exp[key].toString().includes('SENDABLE_WITH_PREMIUM'));
			isSendableStickerKey = keys.find(key => !exp[key].toString().includes('SENDABLE_WITH_PREMIUM') && !exp[key].SENDABLE_WITH_BOOSTED_GUILD);
			return true;
		}
	});
	const StickersSendabilityEnum = StickersSendability[StickersSendabilityEnumKey];
	const getStickerSendability = StickersSendability[getStickerSendabilityKey];;
	const InsertText = (() => {
		let ComponentDispatch;
		return (content) => {
			if (!ComponentDispatch) ComponentDispatch = DiscordModules.ComponentDispatch;
			/**
			 * Not sure why but when using this method of inserting text 
			 * from whiting a patch or maybe this patch 'patchSendSticker' 
			 * it just doesn't work
			 * i did trace through and got into a deep rabbit hole so i just gave up on it.
			 * Yet as we all know, when in doubt wait for the stack to empty out
			 */
			setTimeout(() => {
				ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
					plainText: content,
					rawText: content
				});
			}, 0);
		}
	})();

	// Strings & Constants
	const TAGS = {
		ANIMATED_STICKER_TAG: "ANIMATED_STICKER_TAG"
	};
	const STRINGS = {
		sendLottieStickerErrorMessage: "Official Discord Stickers are not supported.",
		missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
		disabledAnimatedStickersErrorMessage: "You have disabled animated stickers in settings."
	};

	// Helper functions
	const Utils = {
		isTagged: (str) => Object.values(TAGS).some(tag => str.includes(tag)),
		showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
		getStickerUrl: (stickerId, size) => `https://media.discordapp.net/stickers/${stickerId}?size=${size}&passthrough=false`,
		hasEmbedPerms: (channel, user) => !channel.guild_id || Permissions.can({ permission: DiscordPermissions.EMBED_LINKS, context: channel, user }),
		updateStickers: () => StickerStore.stickerMetadata.forEach((value, key) => StickerStore.getStickerById(key)),
		isLottieSticker: sticker => sticker.type === StickerTypeEnum.STANDARD,
		isAnimatedSticker: sticker => sticker["format_type"] === StickerFormatEnum.APNG,
		isStickerSendable: (sticker, channel, user) => getStickerSendability(sticker, user, channel) === StickersSendabilityEnum.SENDABLE,
	};

	// styles
	const css = require("styles.css");

	return class SendStickersAsLinks extends Plugin {
		constructor() {
			super();
		}
		get name() { return config.info.name }

		handleUnsendableSticker({ user, sticker, channel }, direct) {
			if (Utils.isAnimatedSticker(sticker) && !this.settings.shouldSendAnimatedStickers)
				return Utils.showToast(STRINGS.disabledAnimatedStickersErrorMessage, "info");
			if (!Utils.hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
				return Utils.showToast(STRINGS.missingEmbedPermissionsErrorMessage, "info");

			this.sendStickerAsLink(sticker, channel, direct);
		}

		sendStickerAsLink(sticker, channel, direct) {
			if (this.settings.sendDirectly || direct)
				MessageActions.sendMessage(channel.id, {
					content: Utils.getStickerUrl(sticker.id, this.settings.stickerSize),
					validNonShortcutEmojis: []
				});
			else
				InsertText(Utils.getStickerUrl(sticker.id, this.settings.stickerSize));
		}

		handleSticker(channelId, stickerId) {
			const user = UserStore.getCurrentUser();
			const sticker = StickerStore.getStickerById(stickerId);
			const channel = ChannelStore.getChannel(channelId);
			return {
				user,
				sticker,
				channel,
				isSendable: Utils.isStickerSendable(sticker, channel, user)
			}
		}

		patchSendSticker() {
			/** 
			 * The existance of this plugin implies the existance of this patch 
			 */
			Patcher.instead(this.name, MessageActions, 'sendStickers', (_, args, originalFunc) => {
				const [channelId, [stickerId]] = args;
				const stickerObj = this.handleSticker(channelId, stickerId);
				if (stickerObj.isSendable)
					originalFunc.apply(_, args)
				else
					this.handleUnsendableSticker(stickerObj);
			});
		}

		patchStickerAttachement() {
			/** 
			 * Since we enabled stickers to be clickable
			 * If you click on a sticker while the textarea has some text
			 * the sticker will be added as attachment, and therefore triggers an api request
			 * must intercept and send as link
			 */
			Patcher.before(this.name, MessageActions, 'sendMessage', (_, args) => {
				const [channelId, , , attachments] = args;
				if (attachments && attachments.stickerIds && attachments.stickerIds.filter) {
					const [stickerId] = attachments.stickerIds;
					const stickerObj = this.handleSticker(channelId, stickerId);
					if (!stickerObj.isSendable) {
						args[3] = {};
						setTimeout(() => {
							this.handleUnsendableSticker(stickerObj, true);
						}, 0)
					}
				}
			})
		}

		patchChannelTextArea() {
			/** 
			 * this patch is for adding a local permission override to the current channel
			 * so that stickers show up in the picker. in channels that disable external stickers
			 * While this may feel like a feature bypass, I believe if a sticker is posted as an image, 
			 * it's no longer a sticker anymore.
			 
			 * 262144n is for Sending external Emojis permission
			 * which is what's needed to let stickers show up in the picker. ¯\_(ツ)_/¯
			 */
			Patcher.before(this.name, ChannelTextArea.type, "render", (_, [{ channel }]) => {
				const userId = UserStore.getCurrentUser().id;
				if (channel.guild_id)
					channel.permissionOverwrites[userId] = {
						id: userId,
						type: 1,
						allow: 262144n,
						deny: 0n
					};
			});
		}

		patchStickerClickability() {
			// if it's a guild sticker return true to make it clickable 
			// ignoreing discord's stickers because ToS, and they're not regular images
			Patcher.after(this.name, StickersSendability, isSendableStickerKey, (_, args, returnValue) => {
				return args[0].type === StickerTypeEnum.GUILD;
			});
		}

		patchGetStickerById() {
			/** 
			 * this patch is for adding a tag to animated stickers
			 * to style highlight them if setting is set to true
			 * the sticker description gets added to the alt DOM attributes
			 */
			Patcher.after(this.name, StickerStore, "getStickerById", (_, args, sticker) => {
				if (!sticker) return;
				if (!Utils.isTagged(sticker.description || "") && !Utils.isLottieSticker(sticker) && Utils.isAnimatedSticker(sticker) && this.settings.shouldHighlightAnimated)
					sticker.description += TAGS.ANIMATED_STICKER_TAG;
				else if (!this.settings.shouldHighlightAnimated)
					sticker.description = typeof(sticker.description) === 'string' ? sticker.description.replace(TAGS.ANIMATED_STICKER_TAG, "") : sticker.description;
			});
		}

		patchStickerSuggestion() {
			// Enable suggestions for custom stickers only 
			Patcher.after(this.name, StickersSendability, getStickerSendabilityKey, (_, args, returnValue) => {
				if (args[0].type === StickerTypeEnum.GUILD) {
					const { SENDABLE } = StickersSendabilityEnum;
					return returnValue !== SENDABLE ? SENDABLE : returnValue;
				}
			});
		}

		onStart() {
			try {
				DOM.addStyle(this.name, css);
				this.patchStickerClickability();
				this.patchSendSticker();
				this.patchGetStickerById();
				this.patchStickerAttachement();
				this.patchStickerSuggestion();
				this.patchChannelTextArea();
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			DOM.removeStyle(this.name);
			Patcher.unpatchAll(this.name);
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