/**
 * @name SendStickersAsLinks
 * @description Enables you to send custom Stickers as links
 * @version 2.2.1
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js
 */

const config = {
	"info": {
		"name": "SendStickersAsLinks",
		"version": "2.2.1",
		"description": "Enables you to send custom Stickers as links",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"defaultConfig": [{
			"type": "switch",
			"id": "sendDirectly",
			"name": "Send Directly",
			"note": "Send the sticker link in a message directly instead of putting it in the chat box.",
			"value": false
		},
		{
			"type": "switch",
			"id": "ignoreEmbedPermissions",
			"name": "Ignore Embed Permissions",
			"note": "Send sticker links regardless of embed permissions, meaning links will not turn into images.",
			"value": false
		},
		{
			"type": "switch",
			"id": "shouldSendAnimatedStickers",
			"name": "Send animated stickers",
			"note": "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)",
			"value": false
		},
		{
			"type": "switch",
			"id": "shouldHighlightAnimated",
			"name": "Highlight animated stickers",
			"value": true
		},
		{
			"type": "slider",
			"id": "stickerSize",
			"name": "Sticker Size",
			"note": "The size of the sticker in pixels. 160 is recommended.",
			"value": 160,
			"markers": [80, 100, 128, 160],
			"stickToMarkers": true
		}
	]
}

const css = `
.animatedSticker{
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

const Settings = {
	settings: {},
	get(key) {
		return this.settings[key];
	},
	set(key, val) {
		return this.settings[key] = val;
	},
	update(settings) {
		this.init(settings);
	},
	init(settings) {
		this.settings = settings;
	}
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

const Api = new BdApi(config.info.name);

const UI = Api.UI;
const DOM = Api.DOM;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;

class MissingZlibAddon {
	stop() {}
	start() {
		BdApi.alert("Missing library", [`**ZeresPluginLibrary** is needed to run **${config.info.name}**.`,
			"Please download it from the officiel website",
			"https://betterdiscord.app/plugin/ZeresPluginLibrary"
		]);
	}
}

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => filter(entry) ? (module = m) : false, options);
	module = module?.exports;
	if (!module) return undefined;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return undefined;
	return { module, key };
}

const isStickerSendable$1 = getModuleAndKey(Filters.byStrings("=r.SENDABLE"), { searchExports: true });

const patchStickerClickability = () => {
	/**
	 * Make stickers clickable.
	 **/
	const { module, key } = isStickerSendable$1;
	if (module && key) Patcher.after(module, key, () => true);
	else Logger.patch("patchStickerClickability");
};

function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { type });
}

const Toast = {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
};

const MessageActions = getModule(Filters.byProps('jumpToMessage', '_sendMessage'), { searchExports: false });

const Dispatcher = getModule(Filters.byProps("dispatch", "subscribe"), { searchExports: false });

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

const STRINGS = {
	sendLottieStickerErrorMessage: "Official Discord Stickers are not supported.",
	missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
	disabledAnimatedStickersErrorMessage: "You have disabled animated stickers in settings."
};

const StickerTypeEnum = getModule(Filters.byProps("GUILD", "STANDARD"), { searchExports: true }) || {
	"STANDARD": 1,
	"GUILD": 2
};

const StickerFormatEnum = getModule(Filters.byProps("APNG", "LOTTIE"), { searchExports: true }) || {
	"PNG": 1,
	"APNG": 2,
	"LOTTIE": 3,
	"GIF": 4
};

const StickersSendabilityEnum = getModule(Filters.byProps("SENDABLE_WITH_BOOSTED_GUILD"), { searchExports: true }) || {
	"SENDABLE": 0,
	"SENDABLE_WITH_PREMIUM": 1,
	"NONSENDABLE": 2,
	"SENDABLE_WITH_BOOSTED_GUILD": 3
};

const UserStore = getModule(m => m._dispatchToken && m.getName() === "UserStore");

const StickersStore = getModule(m => m._dispatchToken && m.getName() === "StickersStore");

const ChannelStore = getModule(m => m._dispatchToken && m.getName() === "ChannelStore");

const getStickerSendability$1 = getModuleAndKey(Filters.byStrings("canUseStickersEverywhere", "USE_EXTERNAL_STICKERS"), { searchExports: true });

const getStickerSendability = getStickerSendability$1.module[getStickerSendability$1.key];

function getStickerUrl(stickerId, size) {
	return `https://media.discordapp.net/stickers/${stickerId}?size=${size}&passthrough=false`;
}

function isAnimatedSticker(sticker) {
	return sticker["format_type"] === StickerFormatEnum.APNG;
}

function isStickerSendable(sticker, channel, user) {
	return getStickerSendability(sticker, user, channel) === StickersSendabilityEnum.SENDABLE;
}

function isLottieSticker(sticker) {
	return sticker.type === StickerTypeEnum.STANDARD;
}

function handleSticker(channelId, stickerId) {
	const user = UserStore.getCurrentUser();
	const sticker = StickersStore.getStickerById(stickerId);
	const channel = ChannelStore.getChannel(channelId);
	return {
		user,
		sticker,
		channel,
		isSendable: isStickerSendable(sticker, channel, user)
	}
}

function sendStickerAsLink(sticker, channel) {
	const content = getStickerUrl(sticker.id, Settings.get("stickerSize"));
	if (Settings.get("sendDirectly")) {
		try { return sendMessageDirectly(channel, content); } catch { Toast.error("Could not send directly."); }
	}
	insertText(content);
}

function handleUnsendableSticker({ user, sticker, channel }) {
	if (isAnimatedSticker(sticker) && !Settings.get("shouldSendAnimatedStickers"))
		return Toast.info(STRINGS.disabledAnimatedStickersErrorMessage);
	if (!hasEmbedPerms(channel, user) && !Settings.get("ignoreEmbedPermissions"))
		return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);

	sendStickerAsLink(sticker, channel);
}

const patchSendSticker = () => {
	/**
	 * Main Patch
	 * */
	if (MessageActions)
		Patcher.instead(MessageActions, 'sendStickers', (_, args, originalFunc) => {
			const [channelId, [stickerId]] = args;
			const stickerObj = handleSticker(channelId, stickerId);
			if (stickerObj.isSendable)
				originalFunc.apply(_, args);
			else
				handleUnsendableSticker(stickerObj);
		});
	else Logger.patch("patchSendSticker");
};

const StickerModule = getModuleAndKey(Filters.byStrings("sticker", "withLoadingIndicator"), { searchExports: false });

const patchStickerComponent = () => {
	const { module, key } = StickerModule;
	if (module && key)
		Patcher.after(module, key, (_, args, returnValue) => {
			const { size, sticker } = returnValue.props.children[0].props;
			if (size === 96) {
				if (Settings.get("shouldHighlightAnimated") && !isLottieSticker(sticker) && isAnimatedSticker(sticker)) {
					returnValue.props.children[0].props.className += " animatedSticker";
				}
			}
		});
	else Settings.patch("patchGetStickerById");
};

const patchStickerAttachement = () => {
	/**
	 * Since we enabled stickers to be clickable
	 * If you click on a sticker while the textarea has some text
	 * the sticker will be added as attachment, and therefore triggers an api request
	 * So we intercept
	 * */
	if (MessageActions)
		Patcher.before(MessageActions, "sendMessage", (_, args) => {
			const [channelId, , , attachments] = args;
			if (attachments && attachments.stickerIds && attachments.stickerIds.filter) {
				const [stickerId] = attachments.stickerIds;
				const stickerObj = handleSticker(channelId, stickerId);
				if (!stickerObj.isSendable) {
					delete args[3].stickerIds;
					setTimeout(() => {
						sendMessageDirectly(stickerObj);
					}, 0);
				}
			}
		});
	else Logger.patch("patchStickerAttachement");
};

const patchStickerSuggestion = () => {
	/**
	 * Enables suggestions
	 * */
	const { module, key } = getStickerSendability$1;
	if (module && key)
		Patcher.after(module, key, (_, args, returnValue) => {
			if (args[0].type === StickerTypeEnum.GUILD) {
				const { SENDABLE } = StickersSendabilityEnum;
				return returnValue !== SENDABLE ? SENDABLE : returnValue;
			}
		});
	else Logger.patch("patchStickerSuggestion");
};

const patchChannelGuildPermissions = () => {
	if (DiscordPermissions)
		Patcher.after(DiscordPermissions, "can", (_, [{ permission }], ret) =>
			ret || DiscordPermissionsEnum.USE_EXTERNAL_EMOJIS === permission
		);
	else Settings.patch("patchChannelGuildPermissions");
};

const index = !global.ZeresPluginLibrary ? MissingZlibAddon : (() => {
	const [Plugin] = global.ZeresPluginLibrary.buildPlugin(config);

	return class SendStickersAsLinks extends Plugin {
		constructor() {
			super();
		}

		onStart() {
			try {
				DOM.addStyle(css);
				patchStickerClickability();
				patchSendSticker();
				patchStickerComponent();
				patchStickerAttachement();
				patchStickerSuggestion();
				patchChannelGuildPermissions();
				Settings.init(this.settings);
			} catch (e) {
				Logger.error(e);
			}
		}

		onStop() {
			this.cleanUp?.();
			DOM.removeStyle();
			Patcher.unpatchAll();
		}

		getSettingsPanel() {
			const panel = this.buildSettingsPanel();
			panel.addListener(() => {
				Settings.update(this.settings);
			});
			return panel.getElement();
		}
	};
})();

module.exports = index;
