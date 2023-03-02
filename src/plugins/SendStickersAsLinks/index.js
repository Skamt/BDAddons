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

	// https://discord.com/channels/86004744966914048/196782758045941760/1062604534922367107
	function getModuleAndKey(filter) {
		let module;
		const target = getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true });
		module = module?.exports;
		if (!module) return undefined;
		const key = Object.keys(module).find(k => module[k] === target);
		if (!key) return undefined;
		return { module, key };
	}

	// Modules
	const Modules = {
		StickerModule: DiscordModules.StickerModule,
		PendingReplyStore: DiscordModules.PendingReplyStore,
		Permissions: DiscordModules.Permissions,
		ChannelStore: DiscordModules.ChannelStore,
		DiscordPermissions: DiscordModules.DiscordPermissions,
		MessageActions: DiscordModules.MessageActions,
		UserStore: DiscordModules.UserStore,
		StickerStore: DiscordModules.StickerStore,
		StickerTypeEnum: DiscordModules.StickerTypeEnum,
		StickerFormatEnum: DiscordModules.StickerFormatEnum,
		InsertText: (() => {
			let ComponentDispatch;
			return (content) => {
				if (!ComponentDispatch) ComponentDispatch = DiscordModules.ComponentDispatch;
				ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
					plainText: content
				});
			}
		})(),
		...(() => {
			const StickersSendability = getModule(m => Object.keys(m).some(key => m[key]?.SENDABLE_WITH_BOOSTED_GUILD));
			if (!StickersSendability) return undefined;
			const exports = Object.entries(StickersSendability).map(([key, fn]) => (fn.key = key, fn));
			const StickersSendabilityEnum = exports.splice(exports.findIndex(Filters.byProps('SENDABLE_WITH_BOOSTED_GUILD')), 1)[0];
			const getStickerSendability = exports.splice(exports.findIndex(Filters.byStrings('canUseStickersEverywhere')), 1)[0];
			const isStickerSendable = exports[0];
			return { StickersSendability, StickersSendabilityEnum, getStickerSendability, isStickerSendable }
		})()
	}
	
	failsafe;

	// Utilities
	const Utils = {
		showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
		getStickerUrl: (stickerId, size) => `https://media.discordapp.net/stickers/${stickerId}?size=${size}&passthrough=false`,
		hasEmbedPerms: (channel, user) => !channel.guild_id || Modules.Permissions.can({ permission: Modules.DiscordPermissions.EMBED_LINKS, context: channel, user }),
		isLottieSticker: sticker => sticker.type === Modules.StickerTypeEnum.STANDARD,
		isAnimatedSticker: sticker => sticker["format_type"] === Modules.StickerFormatEnum.APNG,
		isStickerSendable: (sticker, channel, user) => Modules.getStickerSendability(sticker, user, channel) === Modules.StickersSendabilityEnum.SENDABLE
	};

	// Strings & Constants
	const TAGS = {
		ANIMATED_STICKER_TAG: "ANIMATED_STICKER_TAG"
	};
	const STRINGS = {
		sendLottieStickerErrorMessage: "Official Discord Stickers are not supported.",
		missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
		disabledAnimatedStickersErrorMessage: "You have disabled animated stickers in settings."
	};

	// Styles
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
				Modules.MessageActions.sendMessage(channel.id, {
					content: Utils.getStickerUrl(sticker.id, this.settings.stickerSize),
					validNonShortcutEmojis: []
				}, undefined, this.getReply(channel.id));
			else
				Modules.InsertText(Utils.getStickerUrl(sticker.id, this.settings.stickerSize));
		}

		getReply(channelId) {
			const reply = Modules.PendingReplyStore.getPendingReply(channelId);
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
			const user = Modules.UserStore.getCurrentUser();
			const sticker = Modules.StickerStore.getStickerById(stickerId);
			const channel = Modules.ChannelStore.getChannel(channelId);
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
			Patcher.instead(Modules.MessageActions, 'sendStickers', (_, args, originalFunc) => {
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
			Patcher.before(Modules.MessageActions, 'sendMessage', (_, args) => {
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
			Patcher.after(Modules.Permissions, "can", (_, [{ permission }], ret) =>
				ret || Modules.DiscordPermissions.USE_EXTERNAL_EMOJIS === permission
			);
		}

		patchStickerClickability() {
			// if it's a guild sticker return true to make it clickable 
			// ignoreing discord's stickers because ToS, and they're not regular images
			Patcher.after(Modules.StickersSendability, Modules.isStickerSendable.key, (_, args, returnValue) => {
				return args[0].type === Modules.StickerTypeEnum.GUILD;
			});
		}

		patchGetStickerById() {
			Patcher.after(Modules.StickerModule, Modules.StickerModule.key, (_, args, returnValue) => {
				const { size, sticker } = returnValue.props.children[0].props;
				if (size === 96) {
					if (this.settings.shouldHighlightAnimated && !Utils.isLottieSticker(sticker) && Utils.isAnimatedSticker(sticker)) {
						returnValue.props.children[0].props.className += " animatedSticker"
					}
				}
			});
		}

		patchStickerSuggestion() {
			// Enable suggestions for custom stickers only 
			Patcher.after(Modules.StickersSendability, Modules.getStickerSendability.key, (_, args, returnValue) => {
				if (args[0].type === Modules.StickerTypeEnum.GUILD) {
					const { SENDABLE } = Modules.StickersSendabilityEnum;
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