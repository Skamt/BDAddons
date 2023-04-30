/**
 * @name Emojis
 * @description Send emoji as link if it can't be sent it normally.
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Emojis
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Emojis/Emojis.plugin.js
 */

const config = {
	"info": {
		"name": "Emojis",
		"version": "1.0.0",
		"description": "Send emoji as link if it can't be sent it normally.",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/Emojis/Emojis.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/Emojis",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"defaultConfig": [{
			"type": "switch",
			"id": "sendDirectly",
			"name": "Send Directly",
			"note": "Send the emoji link in a message directly instead of putting it in the chat box.",
			"value": false
		},
		{
			"type": "switch",
			"id": "ignoreEmbedPermissions",
			"name": "Ignore Embed Permissions",
			"note": "Send emoji links regardless of embed permissions, meaning links will not turn into images.",
			"value": false
		},
		{
			"type": "switch",
			"id": "shouldSendAnimatedEmojis",
			"name": "Send animated emojis",
			"note": "Animated emojis are sent as GIFs, making most of them hidden by discord's GIF tag.",
			"value": false
		},
		{
			"type": "switch",
			"id": "sendEmojiAsWebp",
			"name": "Send animated as webp",
			"note": "Meaning the emoji will show only the first frame, making them act as normal emoji, unless the first frame is empty.",
			"value": false
		},
		{
			"type": "slider",
			"id": "emojiSize",
			"name": "Emoji Size",
			"note": "The size of the Emoji in pixels.",
			"value": 96,
			"markers": [
				40,
				48,
				60,
				64,
				80,
				96
			],
			"stickToMarkers": true
		}
	],
	"zpl": true
}

const css = `
.CHAT .premiumPromo-1eKAIB {
    display:none;
}
.emojiItemDisabled-3VVnwp {
    filter: unset;
}`;

const Api = new BdApi(config.info.name);

const UI = Api.UI;
const DOM = Api.DOM;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;
const getInternalInstance = Api.ReactUtils.getInternalInstance;

const findInTree = Api.Utils.findInTree;

const Dispatcher = getModule(Filters.byProps("dispatch", "subscribe"), { searchExports: false });

const UserStore = getModule(m => m._dispatchToken && m.getName() === "UserStore");

const PendingReplyStore = getModule(m => m._dispatchToken && m.getName() === "PendingReplyStore");

function getReply(channelId) {
	const reply = PendingReplyStore?.getPendingReply(channelId);
	if (!reply) return {};
	Dispatcher?.dispatch({ type: "DELETE_PENDING_REPLY", channelId });
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

class MissingZlibAddon {
	stop() {}
	start() {
		BdApi.alert("Missing library", [`**ZeresPluginLibrary** is needed to run **${config.info.name}**.`,
			"Please download it from the officiel website",
			"https://betterdiscord.app/plugin/ZeresPluginLibrary"
		]);
	}
}

const DiscordPermissions = getModule(Filters.byProps("computePermissions"), { searchExports: false });

const DiscordPermissionsEnum = getModule(Filters.byProps("ADD_REACTIONS"), { searchExports: true }) || {
	"EMBED_LINKS": "16384n",
	"USE_EXTERNAL_EMOJIS": "262144n"
};

function hasEmbedPerms(channel, user) {
	return !channel.guild_id || DiscordPermissions?.can({
		permission: DiscordPermissionsEnum.EMBED_LINKS,
		context: channel,
		user
	});
}

function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { type });
}

const Toast = {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
};

const ChannelStore = getModule(m => m._dispatchToken && m.getName() === "ChannelStore");

const SelectedChannelStore = getModule(m => m._dispatchToken && m.getName() === "SelectedChannelStore");

const MessageActions = getModule(Filters.byProps('jumpToMessage', '_sendMessage'), { searchExports: false });

function sendMessageDirectly(channel, content) {
	if (MessageActions)
		MessageActions.sendMessage(channel.id, {
			validNonShortcutEmojis: [],
			content
		}, undefined, getReply(channel.id));
	else
		throw new Error("Can't send message directly.");
}

const insertText = (() => {
	let ComponentDispatch;
	return (content) => {
		if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners('INSERT_TEXT').length, { searchExports: true });
		setTimeout(() => {
			ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
				plainText: content
			});
		});
	}
})();

const EmojiIntentionEnum = getModule(Filters.byProps("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true }) || {
	"REACTION": 0,
	"STATUS": 1,
	"COMMUNITY_CONTENT": 2,
	"CHAT": 3,
	"GUILD_STICKER_RELATED_EMOJI": 4,
	"GUILD_ROLE_BENEFIT_EMOJI": 5,
	"COMMUNITY_CONTENT_ONLY": 6,
	"SOUNDBOARD": 7
};

const Logger = {
	error(...args) {
		this.p(console.error, ...args);
	},
	patch(patchId) {
		console.error(`%c[${config.info.name}] %c Error at %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
	},
	log(...args) {
		this.p(console.error, ...args);
	},
	p(target, ...args) {
		target(`%c[${config.info.name}]`, "color: #3a71c1;font-weight: bold;", ...args);
	}
};

const EmojiFunctions = getModule(Filters.byProps("getEmojiUnavailableReason"), { searchExports: true });

const EmojiSendAvailabilityEnum = getModule(Filters.byProps("GUILD_SUBSCRIPTION_UNAVAILABLE"), { searchExports: true }) || {
	"DISALLOW_EXTERNAL": 0,
	"GUILD_SUBSCRIPTION_UNAVAILABLE": 1,
	"PREMIUM_LOCKED": 2,
	"ONLY_GUILD_EMOJIS_ALLOWED": 3,
	"ROLE_SUBSCRIPTION_LOCKED": 4,
	"ROLE_SUBSCRIPTION_UNAVAILABLE": 5
};

const patchGetEmojiUnavailableReason = () => {
	/**
	 * This patch allows emojis to be added to the picker
	 * if external emojis are disabled, they don't get added to the picker
	 * PREMIUM_LOCKED is returned becaause that is what's returned normally
	 */
	if (EmojiFunctions)
		Patcher.after(EmojiFunctions, "getEmojiUnavailableReason", (_, [{ intention }], ret) => {
			if (intention !== EmojiIntentionEnum.CHAT) return ret;
			return ret === EmojiSendAvailabilityEnum.DISALLOW_EXTERNAL ? EmojiSendAvailabilityEnum.PREMIUM_LOCKED : ret;
		});
	else
		Logger.patch("patchGetEmojiUnavailableReason");
};

const patchIsEmojiFiltered = () => {
	/**
	 * This patches allows server icons to show up on the left side of the picker
	 * if external emojis are disabled, servers get filtered out
	 * and it's handy to scroll through emojis easily
	 */
	if (EmojiFunctions)
		Patcher.after(EmojiFunctions, "isEmojiFiltered", (_, [, , intention], ret) => {
			if (intention !== EmojiIntentionEnum.CHAT) return ret;
			return false;
		});
	else
		Logger.patch("patchIsEmojiFiltered");
};

function isEmojiSendable(e) {
	return EmojiFunctions.getEmojiUnavailableReason(e) === null;
}

function parseEmojiUrl(emoji, size) {
	return `${emoji.url.replace(/(size=)(\d+)[&]/, "")}&size=${size}`;
}

function getEmojiWebpUrl(emoji, size) {
	return parseEmojiUrl(emoji, size).replace("gif", "webp");
}

function getEmojiGifUrl(emoji, size) {
	return parseEmojiUrl(emoji, size).replace("webp", "gif");
}

function getPickerIntention(event) {
	const picker = event.path.find(i => i.id === "emoji-picker-tab-panel");
	if (!picker) return [null];
	const pickerInstance = getInternalInstance(picker);
	const { pickerIntention } = findInTree(pickerInstance, m => m && "pickerIntention" in m, { walkable: ["pendingProps", "children", "props"] }) || {};
	return [pickerIntention, picker];
}

const STRINGS = {
	missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
	disabledAnimatedEmojiErrorMessage: "You have disabled animated emojis in settings."
};

const index = !global.ZeresPluginLibrary ? MissingZlibAddon : (() => {
	const [Plugin] = global.ZeresPluginLibrary.buildPlugin(config);

	return class Emojis extends Plugin {
		constructor() {
			super();
			this.emojiClickHandler = this.emojiClickHandler.bind(this);
		}

		getEmojiUrl(emoji, size) {
			if (this.settings.sendEmojiAsWebp)
				return getEmojiWebpUrl(emoji, size);
			if (emoji.animated)
				return getEmojiGifUrl(emoji, 4096);

			return parseEmojiUrl(emoji, size);
		}

		sendEmojiAsLink(emoji, channel) {
			const content = this.getEmojiUrl(emoji, this.settings.emojiSize);
			if (this.settings.sendDirectly) {
				try { return sendMessageDirectly(channel, content); } catch { Toast.error("Could not send directly."); }
			}
			insertText(content);
		}

		handleUnsendableEmoji(emoji, channel, user) {
			if (emoji.animated && !this.settings.shouldSendAnimatedEmojis)
				return Toast.info(STRINGS.disabledAnimatedEmojiErrorMessage);
			if (!hasEmbedPerms(channel, user) && !this.settings.ignoreEmbedPermissions)
				return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);

			this.sendEmojiAsLink(emoji, channel);
		}

		emojiHandler(emoji) {
			const user = UserStore.getCurrentUser();
			const intention = EmojiIntentionEnum.CHAT;
			const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
			if (!isEmojiSendable({ emoji, channel, intention }))
				this.handleUnsendableEmoji(emoji, channel, user);
		}

		emojiClickHandler(event) {
			if (event.button === 2) return;
			const [pickerIntention, picker] = getPickerIntention(event);
			if (pickerIntention !== EmojiIntentionEnum.CHAT) return;
			picker.classList.add('CHAT');
			const emojiInstance = getInternalInstance(event.target);
			const props = emojiInstance?.pendingProps;
			if (props && props["data-type"]?.toLowerCase() === "emoji" && props.children) {
				this.emojiHandler(props.children.props.emoji);
			}
		}

		onStart() {
			try {
				DOM.addStyle(css);
				patchIsEmojiFiltered();
				patchGetEmojiUnavailableReason();
				document.addEventListener("mouseup", this.emojiClickHandler);
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
			document.removeEventListener("mouseup", this.emojiClickHandler);
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	}
})();

module.exports = index;
