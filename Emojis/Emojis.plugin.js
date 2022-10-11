/**
 * @name Emojis
 * @description Send emoji as link if it can't be sent it normally.
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Emojis
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Emojis/Emojis.plugin.js
 */
const config = {
	info: {
		name: "Emojis",
		version: "1.0.0",
		description: "Send emoji as link if it can't be sent it normally.",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/Emojis/Emojis.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/Emojis",
		authors: [{
			name: "Skamt"
		}]
	},
	defaultConfig: [{
		type: "slider",
		id: "emojiSize",
		name: "Emoji Size",
		note: "The size of the Emoji in pixels.",
		value: 60,
		markers: [40, 48, 60, 64, 80],
		stickToMarkers: true
	}, {
		type: "switch",
		id: "sendDirectly",
		name: "Send Directly",
		note: "Send the emoji link in a message directly instead of putting it in the chat box.",
		value: false
	}, {
		type: "switch",
		id: "ignoreEmbedPermissions",
		name: "Ignore Embed Permissions",
		note: "Send emoji links regardless of embed permissions, meaning links will not turn into images.",
		value: false
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
		// Modules
		const EmojiIntentionEnum = getModule(Filters.byProps("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true });
		const EmojiSendAvailabilityEnum = getModule(Filters.byProps("GUILD_SUBSCRIPTION_UNAVAILABLE"), { searchExports: true });
		const EmojiFunctions = getModule(Filters.byProps("getEmojiUnavailableReason"), { searchExports: true });
		const DiscordPermissions = getModule(m => m.ADMINISTRATOR && typeof(m.ADMINISTRATOR) === "bigint", { searchExports: true });
		const InsertText = (() => {
			let ComponentDispatch;
			return (...args) => {
				if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length, { searchExports: true })
				ComponentDispatch.dispatchToLastSubscribed(...args);
			}
		})()
		// Helper functions
		const showToast = (content, options) => BdApi.showToast(`${config.info.name}: ${content}`, options);
		const hasEmbedPerms = (channel, user) => !channel.guild_id || Permissions.can({ permission: DiscordPermissions.EMBED_LINKS, context: channel, user });
		const isEmojiSendable = (e) => EmojiFunctions.getEmojiUnavailableReason(e) === null;
		const getEmojiUrl = (emoji, size) => `${emoji.url.replace(/(size=)(\d+)[&]/, '')}&size=${size}`;
		// Strings & Constants
		const STRINGS = {
			missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
			disabledAnimatedEmojiErrorMessage: "You have disabled animated emojis in settings."
		};
		// styles
		const css = `.premiumPromo-1eKAIB {
    display:none;
}
.emojiItemDisabled-3VVnwp {
    filter: unset;
}`;
		return class Emojis extends Plugin {
			constructor() {
				super();
				this.emojiClickHandler = this.emojiClickHandler.bind(this);
			}
			sendEmojiAsLink(emoji, channel) {
				if (this.settings.sendDirectly)
					MessageActions.sendMessage(channel.id, {
						content: getEmojiUrl(emoji, this.settings.emojiSize),
						validNonShortcutEmojis: []
					});
				else
					InsertText("INSERT_TEXT", {
						plainText: getEmojiUrl(emoji, this.settings.emojiSize)
					});
			}
			handleUnsendableEmoji(emoji, channel, user) {
				if (emoji.animated && !this.settings.shouldSendAnimatedEmojis)
					return showToast(STRINGS.disabledAnimatedEmojiErrorMessage, { type: "info" });
				if (!hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
					return showToast(STRINGS.missingEmbedPermissionsErrorMessage, { type: "info" });
				this.sendEmojiAsLink(emoji, channel);
			}
			emojiHandler(emoji) {
				const user = UserStore.getCurrentUser();
				const intention = EmojiIntentionEnum.CHAT;
				const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
				if (!isEmojiSendable({ emoji, channel, intention }))
					this.handleUnsendableEmoji(emoji, channel, user);
			}
			emojiClickHandler(e) {
				const props = e.target.__reactProps$;
				if (props && props["data-type"] && props["data-type"].toLowerCase() === "emoji")
					this.emojiHandler(props.children.props.emoji);
			}
			onStart() {
				try {
					PluginUtilities.addStyle(this.getName(), css);
					document.addEventListener("mouseup", this.emojiClickHandler);
				} catch (e) {
					Logger.err(e);
				}
			}
			onStop() {
				document.removeEventListener("mouseup", this.emojiClickHandler);
				PluginUtilities.removeStyle(this.getName());
			}
			getSettingsPanel() {
				return this.buildSettingsPanel().getElement();
			}
		};
	};
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ? MissinZeresPluginLibraryClass : initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
