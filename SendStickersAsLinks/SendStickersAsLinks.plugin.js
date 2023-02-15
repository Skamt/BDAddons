/**
 * @name SendStickersAsLinks
 * @description Enables you to send custom Stickers as links, (custom stickers as in the ones that are added by servers, not official discord stickers).
 * @version 2.0.4
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js
 */
const config = {
	info: {
		name: "SendStickersAsLinks",
		version: "2.0.4",
		description: "Enables you to send custom Stickers as links, (custom stickers as in the ones that are added by servers, not official discord stickers).",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks",
		authors: [{
			name: "Skamt"
		}]
	},
	defaultConfig: [{
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
	}, {
		type: "slider",
		id: "stickerSize",
		name: "Sticker Size",
		note: "The size of the sticker in pixels. 160 is recommended.",
		value: 160,
		markers: [80, 100, 128, 160],
		stickToMarkers: true
	}]
};

function initPlugin([Plugin, Api]) {
	const plugin = () => {
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
		const PendingReplyStore = getModule(m => m.getPendingReply);
		const Permissions = getModule(Filters.byProps('computePermissions'));
		const ChannelStore = getModule(Filters.byProps('getChannel', 'getDMFromUserId'));
		const DiscordPermissions = getModule(Filters.byProps('ADD_REACTIONS'), { searchExports: true });
		const MessageActions = getModule(Filters.byProps('jumpToMessage', '_sendMessage'));
		const UserStore = getModule(Filters.byProps('getCurrentUser', 'getUser'));
		const StickerStore = getModule(Filters.byProps('getStickerById'));
		const ChannelTextArea = getModule((exp) => exp?.type?.render?.toString().includes('CHANNEL_TEXT_AREA'));
		const StickerTypeEnum = getModule(Filters.byProps('GUILD', 'STANDARD'), { searchExports: true });
		const StickerFormatEnum = getModule(Filters.byProps('APNG', 'LOTTIE'), { searchExports: true });
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
				if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners('INSERT_TEXT').length, { searchExports: true });
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
		const css = `.animatedSticker{
    position:relative;
}

.animatedSticker:before{
    content:'';
    padding:2px;
    background:linear-gradient(-135deg, #42ff42 8%, transparent 0);
    position:absolute;
    width:100%;
    height:100%;
    top:-2px;
    left:-2px;
    z-index:55;
}

.stickerInspected-mwnU6w .animatedSticker:before{
    border-radius:4px;
}`;
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
	};
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ?
	() => ({
		stop() {},
		start() {
			BdApi.UI.showConfirmationModal("Library plugin is needed", [`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`, `Please download it from the officiel website`, "https://betterdiscord.app/plugin/ZeresPluginLibrary"], {
				confirmText: "Ok"
			});
		}
	}) :
	initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
