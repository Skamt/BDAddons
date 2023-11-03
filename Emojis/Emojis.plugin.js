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
	"settings": {
		"sendDirectly": false,
		"ignoreEmbedPermissions": false,
		"shouldSendAnimatedEmojis": false,
		"sendEmojiAsWebp": false,
		"shouldHihglightAnimatedEmojis": true,
		"emojiSize": 160
	}
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
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;

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

const Heading = getModule(Filters.byStrings("LEGEND", "LABEL"), { searchExports: true });

const Slider = TheBigBoyBundle.Slider;
const FormText = TheBigBoyBundle.FormText;

const SettingComponent = () => {
	return [
		...[{
				hideBorder: false,
				description: "Send Directly",
				note: "Send the emoji link in a message directly instead of putting it in the chat box.",
				value: Settings.get("sendDirectly"),
				onChange: e => Settings.set("sendDirectly", e)
			},
			{
				hideBorder: false,
				description: "Ignore Embed Permissions",
				note: "Send emoji links regardless of embed permissions, meaning links will not turn into images.",
				value: Settings.get("ignoreEmbedPermissions"),
				onChange: e => Settings.set("ignoreEmbedPermissions", e)
			},
			{
				hideBorder: false,
				description: "Send animated stickers",
				note: "Animated emojis are sent as GIFs, making most of them hidden by discord's GIF tag.",
				value: Settings.get("shouldSendAnimatedEmojis"),
				onChange: e => Settings.set("shouldSendAnimatedEmojis", e)
			},
			{
				hideBorder: false,
				description: "Send animated as webp",
				note: "Meaning the emoji will show only the first frame, making them act as normal emoji, unless the first frame is empty.",
				value: Settings.get("sendEmojiAsWebp"),
				onChange: e => Settings.set("sendEmojiAsWebp", e)
			},
			{
				hideBorder: false,
				description: "Highlight animated emoji",
				value: Settings.get("shouldHihglightAnimatedEmojis"),
				onChange: e => Settings.set("shouldHihglightAnimatedEmojis", e)
			}
		].map(Toggle),
		React.createElement(StickerSize, null)
	];
};

function StickerSize() {
	return (
		React.createElement(React.Fragment, null, React.createElement(Heading, { tag: "h5", }, "Emoji Size")

			, React.createElement(Slider, {
				stickToMarkers: true,
				markers: [40, 48, 60, 64, 80, 96],
				minValue: 40,
				maxValue: 96,
				initialValue: Settings.get("emojiSize"),
				onValueChange: e => Settings.set("emojiSize", e),
			}), React.createElement(FormText, { type: "description", }, "The size of the Emoji in pixels.")
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

const EmojiFunctions = getModule(Filters.byProps("getEmojiUnavailableReason"), { searchExports: true });

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

const patchGetEmojiUnavailableReason = () => {
	/**
	 * This patch allows emojis to be added to the picker
	 * if external emojis are disabled, they don't get added to the picker
	 * PREMIUM_LOCKED is returned becaause that is what's returned normally
	 */
	if (EmojiFunctions && EmojiFunctions.getEmojiUnavailableReason)
		Patcher.after(EmojiFunctions, "getEmojiUnavailableReason", (_, [{ intention }], ret) => {
			if (intention !== EmojiIntentionEnum.CHAT) return ret;
			return null;

		});
	else
		Logger.patch("GetEmojiUnavailableReason");
};

const patchIsEmojiFiltered = () => {
	/**
	 * This patches allows server icons to show up on the left side of the picker
	 * if external emojis are disabled, servers get filtered out
	 * and it's handy to scroll through emojis easily
	 */
	if (EmojiFunctions && EmojiFunctions.isEmojiFiltered)
		Patcher.after(EmojiFunctions, "isEmojiFiltered", (_, [, , intention], ret) => {
			if (intention !== EmojiIntentionEnum.CHAT) return ret;
			return false;
		});
	else Logger.patch("IsEmojiFiltered");
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

const UserStore = getModule(m => m._dispatchToken && m.getName() === "UserStore");

function isEmojiSendable(e) {
	return EmojiFunctions.getEmojiUnavailableReason?.__originalFunction?.(e) === null;
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

const STRINGS = {
	missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
	disabledAnimatedEmojiErrorMessage: "You have disabled animated emojis in settings."
};

const ExpressionPicker = getModule(a => a?.type?.toString().includes("handleDrawerResizeHandleMouseDown"), { searchExports: false });

function getEmojiUrl(emoji, size) {
	if (Settings.get("sendEmojiAsWebp")) return getEmojiWebpUrl(emoji, size);
	if (emoji.animated) return getEmojiGifUrl(emoji, 4096);

	return parseEmojiUrl(emoji, size);
}

function sendEmojiAsLink(emoji, channel) {
	const content = getEmojiUrl(emoji, Settings.get("emojiSize"));
	if (Settings.get("sendDirectly")) {
		try {
			return sendMessageDirectly(channel, content);
		} catch {
			Toast.error("Could not send directly.");
		}
	}
	insertText(content);
}

function handleUnsendableEmoji(emoji, channel) {
	if (emoji.animated && !Settings.get("shouldSendAnimatedEmojis"))
		return Toast.info(STRINGS.disabledAnimatedEmojiErrorMessage);

	const user = UserStore.getCurrentUser();
	if (!hasEmbedPerms(channel, user) && !Settings.get("ignoreEmbedPermissions"))
		return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);

	sendEmojiAsLink(emoji, channel);
}

const patchExpressionPicker = () => {
	if (ExpressionPicker && ExpressionPicker.type)
		Patcher.before(ExpressionPicker, "type", (_, [props]) => {
			const orig = props.onSelectEmoji;
			props.onSelectEmoji = (...args) => {
				const [emoji] = args;
				const channel = props.channel;
				if (!isEmojiSendable({ emoji, channel, intention: EmojiIntentionEnum.CHAT })) handleUnsendableEmoji(emoji, channel);
				else orig.apply(null, args);
			};
		});
	else Logger.patch("ExpressionPicker");
};

const patchIsEmojiDisabled = () => {
	if (EmojiFunctions && EmojiFunctions.isEmojiDisabled)
		Patcher.after(EmojiFunctions, "isEmojiDisabled", (_, [{ intention }], ret) => {
			if (intention !== EmojiIntentionEnum.CHAT) return ret;
			return false;
		});
	else Logger.patch("IsEmojiDisabled");
};

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

function getNestedProp(obj, path) {
	return path.split(".").reduce(function(ob, prop) {
		return ob && ob[prop];
	}, obj);
}

const EmojiComponent = getModuleAndKey(Filters.byStrings("getDisambiguatedEmojiContext", "isFavoriteEmojiWithoutFetchingLatest", "allowAnimatedEmoji"));

const patchHighlightAnimatedEmoji = () => {
	const { module, key } = EmojiComponent;
	if (module && key)
		Patcher.after(module, key, (_, [{ descriptor }], ret) => {
			if (descriptor.emoji.animated && Settings.get("shouldHihglightAnimatedEmojis")) ret.props.className += " animated";
		});
	else Logger.patch("HighlightAnimatedEmoji");
};

const Button = TheBigBoyBundle.Button ||
	function ButtonComponentFallback(props) {
		return React.createElement('button', { ...props, });
	};

const MessageDecorations = getModule(Filters.byProps("MessagePopoutContent"));
const AssetURLUtils = getModule(Filters.byProps("getEmojiURL"));

const patchEmojiUtils = () => {
	if (MessageDecorations && MessageDecorations.MessagePopoutContent)
		Patcher.after(MessageDecorations, "MessagePopoutContent", (_, __, ret) => {
			const { emojiId: id } = getNestedProp(ret, "props.children.0.props.children.0.props.children.0.props") || {};
			if (!id) return ret;

			const children = getNestedProp(ret, "props.children.0.props.children");

			if (!children) return ret;
			children.push(
				React.createElement(Button, {
					size: Button.Sizes.SMALL,
					color: Button.Colors.GREEN,
					onClick: () => {
						const url = AssetURLUtils.getEmojiURL({ id });
						if (!url) return Toast.error("no url found");
						copy(url);
						Toast.success("Copid");
					},
				}, "Copy url")
			);
		});
	else Logger.patch("EmojiUtils");
};

class Emojis {
	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			patchIsEmojiFiltered();
			patchGetEmojiUnavailableReason();
			patchExpressionPicker();
			patchIsEmojiDisabled();
			patchHighlightAnimatedEmoji();
			patchEmojiUtils();
		} catch (e) {
			console.error(e);
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

module.exports = Emojis;
