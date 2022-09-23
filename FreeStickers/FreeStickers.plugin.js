/**
 * @name FreeStickers
 * @description Enables you to send custom Stickers without nitro as links, (custom stickers as in the ones that are added by servers, not officiel discord stickers).
 * @version 1.3.0
 * @author Skamt
 * @source https://github.com/Skamt/BDAddons/tree/main/release/FreeStickers
 */
const config = {
	info: {
		name: "FreeStickers",
		version: "1.3.0",
		description: "Enables you to send custom Stickers without nitro as links, (custom stickers as in the ones that are added by servers, not officiel discord stickers).",
		source: "https://github.com/Skamt/BDAddons/tree/main/release/FreeStickers",
		authors: [{
			name: "Skamt"
		}]
	},
	changelog: [{
		title: "Added",
		type: "added",
		items: ["Option to Highlight animated stickers and emojis."]
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
		note: "Send the sticker link in a message directly instead of putting it in the chat box. Sticker sent as attachement will still be sent directly.",
		value: true
	}, {
		type: "switch",
		id: "sendAnimatedStickers",
		name: "Send animated stickers",
		note: "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)",
		value: true
	}, {
		type: "switch",
		id: "keepStickersPopoutOpen",
		name: "Holding shift keeps stickers menu open",
		note: "This functionally has a great chancing of breaking due to other plugins overriding it.",
		value: true
	}, {
		type: "switch",
		id: "highlightanimated",
		name: "Highlight animated stickers/emojis",
		value: true
	}, {
		type: "category",
		id: "preview",
		name: "Preview Settings",
		collapsible: true,
		shown: false,
		settings: [{
			type: "switch",
			id: "stickerPreview",
			name: "Enable Preview for stickers",
			note: "Enables a preview for stickers, Sometimes stickers tend to be small or has text that is unreadable",
			value: true
		}, {
			type: "switch",
			id: "emojiPreview",
			name: "Enables Preview for emojis",
			note: "Enables a preview for emojis, Emojis tend to be small or has text that is unreadable",
			value: true
		}, {
			type: "slider",
			id: "previewSize",
			name: "Previw Size",
			note: "The size of the preview",
			value: 300,
			markers: [100, 200, 300, 400, 500, 600],
			stickToMarkers: true
		}]
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
		const css = `.stickersPreview {
	width:400px;
	font-size: 14px;
	background: var(--background-floating);
	border-radius: 5px;
	padding: .5em;
	box-shadow: var(--elevation-high);
}
.stickersPreview img{
	min-width:100%;
	max-width:100%;
}
.animated img{
	border:1px dashed #ff8f09;
	padding:1px;
	box-sizing:border-box;
}`;
		const previewComponent = ({ sticker, element, data, previewSize, animated }) => {
			const [showPopout, setShowPopout] = useState(false);
			const url = sticker ? `https://media.discordapp.net/stickers/${data.id}.webp?size=640&quality=lossless` : data.id ? `${data.url.split("?")[0]}?size=640&passthrough=false&quality=lossless` : data.url;
			return (
				React.createElement(Popout, {
						shouldShow: showPopout,
						position: Popout.Positions.TOP,
						align: Popout.Align.CENTER,
						animation: Popout.Animation["SCALE"],
						spacing: 8,
						renderPopout: () =>
							React.createElement("div", {
									className: "stickersPreview",
									style: { width: `${previewSize}px` }
								},
								React.createElement("img", { src: url }))
					},
					() =>
					React.createElement("div", {
							className: !animated || "animated",
							onMouseEnter: () => setShowPopout(true),
							onMouseLeave: () => setShowPopout(false)
						},
						element)));
		};;
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
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ? MissinZeresPluginLibraryClass : initPlugin(global.ZeresPluginLibrary.buildPlugin(config));