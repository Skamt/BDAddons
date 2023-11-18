/**
 * @name SendStickersAsLinks
 * @description Enables you to send custom Stickers as links
 * @version 2.2.3
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js
 */

const config = {
	"info": {
		"name": "SendStickersAsLinks",
		"version": "2.2.3",
		"description": "Enables you to send custom Stickers as links",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"sendDirectly": false,
		"ignoreEmbedPermissions": false,
		"shouldSendAnimatedStickers": false,
		"shouldHighlightAnimated": true,
		"stickerSize": 160
	}
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
}`;

const Api = new BdApi(config.info.name);

const UI = Api.UI;
const DOM = Api.DOM;
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;

class ChangeEmitter {
	constructor() {
		this.listeners = new Set();
	}

	isInValid(handler) {
		return !handler || typeof handler !== "function";
	}

	on(handler) {
		if (this.isInValid(handler)) return;
		this.listeners.add(handler);
		return () => this.off(handler);
	}

	off(handler) {
		if (this.isInValid(handler)) return;
		this.listeners.delete(handler);
	}

	emit(payload) {
		for (const listener of this.listeners) {
			try {
				listener(payload);
			} catch (err) {
				console.error(`Could not run listener`, err);
			}
		}
	}
}

const Settings = new(class Settings extends ChangeEmitter {
	constructor() {
		super();
	}

	init(defaultSettings) {
		this.settings = Data.load("settings") || defaultSettings;
	}

	get(key) {
		return this.settings[key];
	}

	set(key, val) {
		this.settings[key] = val;
		this.commit();
	}

	setMultiple(newSettings) {
		this.settings = Object.assign(this.settings, newSettings);
		this.commit();
	}

	commit() {
		Data.save("settings", this.settings);
		this.emit();
	}
})();

const Logger = {
	error(...args) {
		this.p(console.error, ...args);
	},
	patch(patchId) {
		console.error(`%c[${config.info.name}] %c Error at %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
	},
	log(...args) {
		this.p(console.log, ...args);
	},
	p(target, ...args) {
		target(`%c[${config.info.name}]`, "color: #3a71c1;font-weight: bold;", ...args);
	}
};

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return undefined;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return undefined;
	return { module, key };
}

const TheBigBoyBundle = getModule(Filters.byProps("openModal", "FormSwitch", "Anchor"), { searchExports: false });

const Switch = TheBigBoyBundle.FormSwitch ||
	function SwitchComponentFallback(props) {
		return (
			React.createElement('div', { style: { color: "#fff" }, }, props.children, React.createElement('input', {
				type: "checkbox",
				checked: props.value,
				onChange: e => props.onChange(e.target.checked),
			}))
		);
	};

const Heading = TheBigBoyBundle.Heading;
const Slider = TheBigBoyBundle.Slider;
const FormText = TheBigBoyBundle.FormText;

const SettingComponent = () => {
	return [
		...[{
				hideBorder: false,
				description: "Send Directly",
				note: "Send the sticker link in a message directly instead of putting it in the chat box.",
				value: Settings.get("sendDirectly"),
				onChange: e => Settings.set("sendDirectly", e)
			},
			{
				hideBorder: false,
				description: "Ignore Embed Permissions",
				note: "Send sticker links regardless of embed permissions, meaning links will not turn into images.",
				value: Settings.get("ignoreEmbedPermissions"),
				onChange: e => Settings.set("ignoreEmbedPermissions", e)
			},
			{
				hideBorder: false,
				description: "Send animated stickers",
				note: "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)",
				value: Settings.get("shouldSendAnimatedStickers"),
				onChange: e => Settings.set("shouldSendAnimatedStickers", e)
			},
			{
				hideBorder: false,
				description: "Highlight animated stickers",
				value: Settings.get("shouldHighlightAnimated"),
				onChange: e => Settings.set("shouldHighlightAnimated", e)
			}
		].map(Toggle),
		React.createElement(StickerSize, null)
	];
};

function StickerSize() {
	return (
		React.createElement(React.Fragment, null, React.createElement(Heading, { tag: "h5", }, "Sticker Size")

			, React.createElement(Slider, {
				stickToMarkers: true,
				markers: [80, 100, 128, 160],
				minValue: 80,
				maxValue: 160,
				initialValue: Settings.get("stickerSize"),
				onValueChange: e => Settings.set("stickerSize", e),
			}), React.createElement(FormText, { type: "description", }, "The size of the sticker in pixels. 160 is recommended")
		)
	);
}

function Toggle(props) {
	const [enabled, setEnabled] = React.useState(props.value);
	return (
		React.createElement(Switch, {
			value: enabled,
			note: props.note,
			hideBorder: props.hideBorder,
			onChange: e => {
				props.onChange(e);
				setEnabled(e);
			},
		}, props.description)
	);
}

const StickerSendability = getModule(Filters.byProps("StickerSendability", "getStickerSendability"), { searchExports: false });

const patchStickerClickability = () => {
	/**
	 * Make stickers clickable.
	 **/

	if (StickerSendability)
		Patcher.after(StickerSendability, "isSendableSticker", () => true);
	else Logger.patch("StickerClickability");
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

const DiscordPermissions = getModule(Filters.byProps("computePermissions"), { searchExports: false });

const DiscordPermissionsEnum = getModule(Filters.byProps("ADD_REACTIONS"), { searchExports: true }) || {
	"EMBED_LINKS": "16384n",
	"USE_EXTERNAL_EMOJIS": "262144n"
};

function hasEmbedPerms(channel, user) {
	return !channel.guild_id || DiscordPermissions?.can(
		DiscordPermissionsEnum.EMBED_LINKS,
		channel,
		user
	);
}

const MessageActions = getModule(Filters.byProps('jumpToMessage', '_sendMessage'), { searchExports: false });

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

const UserStore = getModule(m => m._dispatchToken && m.getName() === "UserStore");

const StickersStore = getModule(m => m._dispatchToken && m.getName() === "StickersStore");

const ChannelStore = getModule(m => m._dispatchToken && m.getName() === "ChannelStore");

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
		allowedMentions: reply.shouldMention ?
			undefined : {
				parse: ["users", "roles", "everyone"],
				replied_user: false
			}
	};
}

async function sendMessageDirectly(channel, content) {
	if (!MessageActions || !MessageActions.sendMessage || typeof MessageActions.sendMessage !== "function")
		throw new Error("Can't send message directly.");

	return MessageActions.sendMessage(
		channel.id, {
			validNonShortcutEmojis: [],
			content
		},
		undefined,
		getReply(channel.id)
	);
}

const insertText = (() => {
	let ComponentDispatch;
	return content => {
		if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length, { searchExports: true });
		setTimeout(() => {
			ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
				plainText: content
			});
		});
	};
})();

const { StickerSendability: StickersSendabilityEnum, getStickerSendability } = StickerSendability;

function sendStickerAsLink({ channel, sticker }) {
	const content = getStickerUrl(sticker.id);

	if (!Settings.get("sendDirectly")) return insertText(content);

	try {
		sendMessageDirectly(channel, content);
	} catch {
		insertText(content);
		Toast.error("Could not send directly.");
	}
}

function getStickerUrl(stickerId) {
	const stickerSize = Settings.get("stickerSize") || 160;
	return `https://media.discordapp.net/stickers/${stickerId}?size=${stickerSize}&passthrough=false`;
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
	};
}

function handleUnsendableSticker(stickerObj) {
	const { user, sticker, channel } = stickerObj;
	if (isAnimatedSticker(sticker) && !Settings.get("shouldSendAnimatedStickers")) return Toast.info(STRINGS.disabledAnimatedStickersErrorMessage);
	if (!hasEmbedPerms(channel, user) && !Settings.get("ignoreEmbedPermissions")) return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);

	sendStickerAsLink(stickerObj);
}

const patchSendSticker = () => {
	/**
	 * Main Patch
	 * */
	if (MessageActions)
		Patcher.instead(MessageActions, "sendStickers", (_, args, originalFunc) => {
			const [channelId, [stickerId]] = args;
			const stickerObj = handleSticker(channelId, stickerId);
			if (stickerObj.isSendable) originalFunc.apply(_, args);
			else handleUnsendableSticker(stickerObj);
		});
	else Logger.patch("SendSticker");
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
	else Settings.patch("GetStickerById");
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
						sendMessageDirectly(stickerObj.channel, getStickerUrl(stickerId));
					}, 0);
				}
			}
		});
	else Logger.patch("StickerAttachement");
};

const patchStickerSuggestion = () => {
	/**
	 * Enables suggestions
	 * */

	if (StickerSendability)
		Patcher.after(StickerSendability, "getStickerSendability", (_, args, returnValue) => {
			if (args[0].type === StickerTypeEnum.GUILD) {
				const { SENDABLE } = StickerSendability.StickerSendability;
				return returnValue !== SENDABLE ? SENDABLE : returnValue;
			}
		});
	else Logger.patch("StickerSuggestion");
};

const patchChannelGuildPermissions = () => {
	if (DiscordPermissions)
		Patcher.after(DiscordPermissions, "can", (_, [permission], ret) =>
			ret || DiscordPermissionsEnum.USE_EXTERNAL_EMOJIS === permission
		);
	else Settings.patch("ChannelGuildPermissions");
};

class SendStickersAsLinks {
	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			patchStickerClickability();
			patchSendSticker();
			patchStickerComponent();
			patchStickerAttachement();
			patchStickerSuggestion();
			patchChannelGuildPermissions();

		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}

	getSettingsPanel() {
		return React.createElement(SettingComponent, null);
	}
}

module.exports = SendStickersAsLinks;
