module.exports = () => {
	const {
		UI,
		DOM,
		Patcher,
		Webpack: {
			Filters,
			getModule
		}
	} = new BdApi(config.info.name);

	// Helper functions
	const Utils = {
		isTagged: (str) => Object.values(TAGS).some(tag => str.includes(tag)),
		showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
		getStickerUrl: (stickerId, size) => `https://media.discordapp.net/stickers/${stickerId}?size=${size}&passthrough=false`,
		hasEmbedPerms: (channel, user) => !channel.guild_id || Permissions.can({ permission: DiscordPermissions.EMBED_LINKS, context: channel, user }),
		isLottieSticker: sticker => sticker.type === StickerTypeEnum.STANDARD,
		isAnimatedSticker: sticker => sticker["format_type"] === StickerFormatEnum.APNG,
		isStickerSendable: (sticker, channel, user) => getStickerSendability(sticker, user, channel) === StickersSendabilityEnum.SENDABLE,
		getModuleAndKey(filter) {
			let module;
			const target = BdApi.Webpack.getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true })
			return [module.exports, Object.keys(module.exports).find(k => module.exports[k] === target)];
		}
	};

	// Modules
	const [StickerModule, StickerModulePatchTarget] = Utils.getModuleAndKey(Filters.byStrings('sticker', 'withLoadingIndicator'));
	const PendingReplyStore = DiscordModules.PendingReplyStore;
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

	// styles
	const css = require("styles.css");

	return class SendStickersAsLinks extends Plugin {
		constructor() {
			super();
		}

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
				}, undefined, this.getReply(channel.id));
			else
				InsertText(Utils.getStickerUrl(sticker.id, this.settings.stickerSize));
		}

		getReply(channelId) {
			const reply = PendingReplyStore.getPendingReply(channelId);
			if (!reply) return {};
			return {
				messageReference: {
					guild_id: reply.channel.guild_id,
					channel_id: reply.channel.id,
					message_id: reply.message.id
				},
				allowedMentions: reply.shouldMention ? undefined : {
					parse: ["users", "roles", "everyone"],
					replied_user: false
				}
			}
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
			Patcher.instead(MessageActions, 'sendStickers', (_, args, originalFunc) => {
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
			 * must intercept, adapt, overcome, what..?
			 */
			Patcher.before(MessageActions, 'sendMessage', (_, args) => {
				const [channelId, , , attachments] = args;
				if (attachments && attachments.stickerIds && attachments.stickerIds.filter) {
					const [stickerId] = attachments.stickerIds;
					const stickerObj = this.handleSticker(channelId, stickerId);
					if (!stickerObj.isSendable) {
						delete args[3].stickerIds;
						setTimeout(() => {
							this.handleUnsendableSticker(stickerObj, true);
						}, 0)
					}
				}
			})
		}

		patchChannelGuildPermissions() {
			Patcher.after(Permissions, "can", (_, [{ permission }], ret) =>
				ret || DiscordPermissions.USE_EXTERNAL_EMOJIS === permission
			);
		}

		patchStickerClickability() {
			// if it's a guild sticker return true to make it clickable 
			// ignoreing discord's stickers because ToS, and they're not regular images
			Patcher.after(StickersSendability, isSendableStickerKey, (_, args, returnValue) => {
				return args[0].type === StickerTypeEnum.GUILD;
			});
		}

		patchGetStickerById() {
			Patcher.after(StickerModule, StickerModulePatchTarget, (_, args, returnValue) => {
				const {size,sticker} = returnValue.props.children[0].props;
				if (size === 96) {
					if (this.settings.shouldHighlightAnimated && !Utils.isLottieSticker(sticker) && Utils.isAnimatedSticker(sticker)) {
						returnValue.props.children[0].props.className += " animatedSticker"
					}
				}
			});
		}

		patchStickerSuggestion() {
			// Enable suggestions for custom stickers only 
			Patcher.after(StickersSendability, getStickerSendabilityKey, (_, args, returnValue) => {
				if (args[0].type === StickerTypeEnum.GUILD) {
					const { SENDABLE } = StickersSendabilityEnum;
					return returnValue !== SENDABLE ? SENDABLE : returnValue;
				}
			});
		}

		onStart() {
			try {
				DOM.addStyle(css);
				this.patchStickerClickability();
				this.patchSendSticker();
				this.patchGetStickerById();
				this.patchStickerAttachement();
				this.patchStickerSuggestion();
				this.patchChannelGuildPermissions();
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}

		getSettingsPanel() {
			const panel = this.buildSettingsPanel();
			return panel.getElement();
		}
	};
}