module.exports = (Plugin, Api) => {
	const {
		Settings,
		Patcher,
		WebpackModules,
		PluginUtilities,
		DiscordModules: {
			React,
			React: { useState },
			Permissions,
			DiscordPermissions,
			UserStore,
			ChannelStore,
			SelectedChannelStore
		}
	} = Api;

	const StickerType = WebpackModules.getByProps('MetaStickerType')
	const StickersFunctions = WebpackModules.getByProps('getStickerById');
	const StickersSendability = WebpackModules.getByProps('isSendableSticker');
	const MessageUtilities = WebpackModules.getByProps("sendStickers");
	const closeExpressionPicker = WebpackModules.getByProps("closeExpressionPicker");
	const ReactionPopout = WebpackModules.getByProps("isSelected");
	const ExpressionPickerInspector = WebpackModules.find(e => e.default.displayName === "ExpressionPickerInspector");
	const StickerPickerLoader = WebpackModules.find(m => m.default.displayName === 'StickerPickerLoader');
	const Sticker = WebpackModules.find(m => m.default.displayName === 'Sticker');
	const Popout = WebpackModules.getByDisplayName("Popout");
	const EmojiPickerListRow = WebpackModules.find(m => m.default.displayName === 'EmojiPickerListRow');
	const { ComponentDispatch } = WebpackModules.getByProps("ComponentDispatch");

	const css = require('styles.css');

	const previewComponent = require('components/previewComponent.jsx');

	return class FreeStickers extends Plugin {
		constructor() {
			super();
			// a boolean for whether to close ExpressionPicker
			this.canClosePicker = true;
			// keydown/keyup listeners checking for shift key
			this.listeners = [
				(e) => this.canClosePicker = !(e.keyCode === 16),
				(e) => this.canClosePicker = true
			]
		}

		patchAddPreview() {
			// Add a zoom/preview popout to stickers
			Patcher.after(Sticker, 'default', (_, [{ size, sticker }], ret) => {
				if (size < 40) return;
				return (this.settings.preview.stickerPreview && sticker.type === StickerType.MetaStickerType.GUILD) ?
					React.createElement(previewComponent, {
						previewSize: this.settings.preview.previewSize,
						sticker: true,
						element: ret,
						animated: sticker["format_type"] === StickerType.StickerFormat.APNG && this.settings.highlightanimated,
						data: sticker
					}) : ret;
			})
			// Add a zoom/preview popout to Emojis 
			Patcher.after(EmojiPickerListRow, 'default', (_, args, ret) => {
				if (!this.settings.preview.emojiPreview) return;
				ret.props.children = ret.props.children.map(emojiData => {
					if (!emojiData.props.children.props.emoji) return emojiData;
					const emoji = emojiData.props.children.props.emoji;
					emojiData.props.children = React.createElement(previewComponent, {
						previewSize: this.settings.preview.previewSize,
						element: emojiData.props.children,
						animated: emoji.animated && this.settings.highlightanimated,
						data: emoji
					})
					return emojiData;
				})
			})
		}

		patchStickerAttachement() {
			Patcher.before(MessageUtilities, 'sendMessage', (_, args, ret) => {
				const [channelId, , , attachments] = args;
				if (attachments && attachments.stickerIds && attachments.stickerIds.filter) {
					const [stickerId] = attachments.stickerIds;
					const { SENDABLE } = StickersSendability.StickerSendability;
					const [state, sticker] = this.isStickerSendable(stickerId);
					if (state !== SENDABLE) {
						args[3] = {};
						setTimeout(() => {
							this.sendStickerAsLink(sticker, channelId, true);
						}, 0)
					}
				}
			})
		}

		patchStickerPickerLoader() {
			// Bypass send external stickers permission by adding current user as exception to the channel
			// Weirdly enough 'Use External Stickers' permission doesn't do anything
			// 'Use External Emoji' is needed
			Patcher.before(StickerPickerLoader, 'default', (_, args, ret) => {
				const temp = {};
				temp[UserStore.getCurrentUser().id] = {
					id: UserStore.getCurrentUser().id,
					type: 1,
					allow: 137439215616n,
					deny: 0n
				};
				args[0].channel.permissionOverwrites = {
					...args[0].channel.permissionOverwrites,
					...temp
				};
			})
		}
		patchStickerClickability() {
			// if it's a guild sticker return true to make it clickable 
			// ignoreing discord's stickers because ToS, and they're not regular images
			Patcher.after(StickersSendability, 'isSendableSticker', (_, args, returnValue) => {
				return args[0].type === StickerType.MetaStickerType.GUILD;
			});
		}

		patchStickerSuggestion() {
			// Enable suggestions for custom stickers only 
			Patcher.after(StickersSendability, 'getStickerSendability', (_, args, returnValue) => {
				if (args[0].type === StickerType.MetaStickerType.GUILD) {
					const { SENDABLE } = StickersSendability.StickerSendability;
					return returnValue !== SENDABLE ? SENDABLE : returnValue;
				}
			});
		}

		patchSendSticker() {
			Patcher.instead(MessageUtilities, 'sendStickers', (_, args, originalFunc) => {
				const [channelId, [stickerId]] = args;
				const { SENDABLE } = StickersSendability.StickerSendability;
				const [state, sticker] = this.isStickerSendable(stickerId);
				if (state === SENDABLE)
					originalFunc.apply(_, args)
				else {
					this.sendStickerAsLink(sticker, channelId);
				}
			});
		}

		patchExpressionsPicker() {
			// Checking if shift is held to whether close the picker or not 
			// also clearing the preview
			Patcher.instead(closeExpressionPicker, 'closeExpressionPicker', (_, args, originalFunc) => {
				if (this.settings.keepStickersPopoutOpen) {
					if (this.canClosePicker) {
						originalFunc();
					}
				} else {
					originalFunc();
				}
			});
		}

		sendStickerAsLink(sticker, channelId, direct) {
			if (sticker["format_type"] === StickerType.StickerFormat.APNG && !this.settings.sendAnimatedStickers) return;
			const url = `https://media.discordapp.net/stickers/${sticker.id}.webp?size=${this.settings.stickerSize}&passthrough=false&quality=lossless`;
			if (this.checkEmbedPerms(channelId))
				if (this.settings.sendDirectly || direct)
					MessageUtilities.sendMessage(channelId, {
						content: url,
						validNonShortcutEmojis: []
					});
				else
					setTimeout(() => {
						ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
							plainText: url
						});
					}, 0)
			else
				BdApi.showToast("Missing Embed Permissions");
		}


		checkEmbedPerms(channelId) {
			const channel = ChannelStore.getChannel(channelId);
			if (!channel.guild_id) return true;
			return Permissions.can({ permission: DiscordPermissions.EMBED_LINKS, context: channel, user: UserStore.getCurrentUser().id })
		}


		isStickerSendable(stickerId) {
			// Checking if sticker can be sent normally, Nitro / Guild's sticker
			const sticker = StickersFunctions.getStickerById(stickerId);
			const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
			return [StickersSendability.getStickerSendability.__originalFunction(sticker, UserStore.getCurrentUser(), channel), sticker];
		}

		setupKeyListeners() {
			document.addEventListener("keydown", this.listeners[0]);
			document.addEventListener("keyup", this.listeners[1]);
		}

		removeKeyListeners() {
			document.removeEventListener("keydown", this.listeners[0]);
			document.removeEventListener("keyup", this.listeners[1]);
		}

		patch() {
			PluginUtilities.addStyle(this.getName(), css);
			this.setupKeyListeners();
			this.patchStickerClickability();
			this.patchStickerSuggestion();
			this.patchSendSticker();
			this.patchExpressionsPicker();
			this.patchStickerPickerLoader();
			this.patchStickerAttachement();
			this.patchAddPreview();
		}
		clean() {
			PluginUtilities.removeStyle(this.getName());
			this.removeKeyListeners();
			Patcher.unpatchAll();
		}
		onStart() {
			try {
				this.patch();
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			this.clean();
		}

		getSettingsPanel() { return this.buildSettingsPanel().getElement(); }
	};

};