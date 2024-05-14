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

const zustand = getModule(Filters.byStrings("subscribeWithSelector", "useReducer"), { searchExports: false });

const SettingsStoreSelectors = {};
const persistMiddleware = config => (set, get, api) => config(args => (set(args), Data.save("settings", get().getRawState())), get, api);

const SettingsStore = Object.assign(
	zustand(
		persistMiddleware((set, get) => {
			const settingsObj = Object.create(null);

			for (const [key, value] of Object.entries({
					...config.settings,
					...Data.load("settings")
				})) {
				settingsObj[key] = value;
				settingsObj[`set${key}`] = newValue => set({
					[key]: newValue });
				SettingsStoreSelectors[key] = state => state[key];
			}
			settingsObj.getRawState = () => {
				return Object.entries(get())
					.filter(([, val]) => typeof val !== "function")
					.reduce((acc, [key, val]) => {
						acc[key] = val;
						return acc;
					}, {});
			};
			return settingsObj;
		})
	), {
		useSetting: function(key) {
			return this(state => [state[key], state[`set${key}`]]);
		},
		selectors: SettingsStoreSelectors
	}
);

Object.defineProperty(SettingsStore, "state", {
	writeable: false,
	configurable: false,
	get() {
		return this.getState();
	}
});

const Settings = SettingsStore;

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

function SettingSwtich({ settingKey, note, hideBorder = false, description }) {
	const [val, set] = Settings.useSetting(settingKey);
	return (
		React.createElement(Switch, {
			value: val,
			note: note,
			hideBorder: hideBorder,
			onChange: set,
		}, description || settingKey)
	);
}

const { FormText, Slider, Heading } = TheBigBoyBundle;

const SettingComponent = () => {
	return (
		React.createElement(React.Fragment, null, [{
				description: "Send Directly",
				note: "Send the emoji link in a message directly instead of putting it in the chat box.",
				settingKey: "sendDirectly"
			},
			{
				description: "Ignore Embed Permissions",
				note: "Send emoji links regardless of embed permissions, meaning links will not turn into images.",
				settingKey: "ignoreEmbedPermissions"
			},
			{
				description: "Send animated emojis",
				note: "Animated emojis are sent as GIFs.",
				settingKey: "shouldSendAnimatedEmojis"
			},
			{
				description: "Send animated as png",
				note: "Meaning the emoji will show only the first frame, making them act as normal emoji, unless the first frame is empty.",
				settingKey: "sendEmojiAsPng"
			},
			{
				description: "Highlight animated emoji",
				settingKey: "shouldHihglightAnimatedEmojis"
			}
		].map(SettingSwtich), React.createElement(StickerSize, null))
	);
};

const emojiSizes = [48, 56, 60, 64, 80, 96, 100, 128, 160, 240, 256, 300];

function StickerSize() {
	const [val, set] = Settings.useSetting("emojiSize");

	return (
		React.createElement(React.Fragment, null, React.createElement(Heading, {
				style: { marginBottom: 20 },
				tag: "h5",
			}, "Emoji Size"

		), React.createElement(Slider, {
			className: "emojiSizeSlider",
			stickToMarkers: true,
			sortedMarkers: true,
			equidistant: true,
			markers: emojiSizes,
			minValue: emojiSizes[0],
			maxValue: emojiSizes[emojiSizes.length - 1],
			initialValue: val,
			onValueChange: e => set(emojiSizes.find(s => e <= s) ?? emojiSizes[emojiSizes.length - 1]),
		}), React.createElement(FormText, { type: "description", }, "The size of the Emoji in pixels"))
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
	"CHAT": 3
};

const patchGetEmojiUnavailableReason = () => {
	/**
	 * This patch allows emojis to be added to the picker
	 * if external emojis are disabled, they don't get added to the picker
	 * PREMIUM_LOCKED is returned becaause that is what's returned normally
	 */
	if (EmojiFunctions?.getEmojiUnavailableReason)
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
	UI.showToast(`[${config.info.name}] ${content}`, { timeout: 5000, type });
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
			undefined :
			{
				parse: ["users", "roles", "everyone"],
				replied_user: false
			}
	};
}

async function sendMessageDirectly(channel, content) {
	if (!MessageActions || !MessageActions.sendMessage || typeof MessageActions.sendMessage !== "function") throw new Error("Can't send message directly.");

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
		if (!ComponentDispatch) return;
		setTimeout(() =>
			ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
				plainText: content
			})
		);
	};
})();

const UserStore = getModule(m => m._dispatchToken && m.getName() === "UserStore");

function getEmojiUrl({ id, animated }) {
	const size = Settings.state.emojiSize;
	const type = animated ? (Settings.state.sendEmojiAsPng ? "png" : "gif") : "png";

	return `https://cdn.discordapp.com/emojis/${id}.${type}?size=${size}`;
}

function isEmojiSendable(e) {
	return EmojiFunctions.getEmojiUnavailableReason?.__originalFunction?.(e) === null;
}

const STRINGS = {
	missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
	disabledAnimatedEmojiErrorMessage: "You have disabled animated emojis in settings."
};

const ExpressionPicker = getModule(a => a?.type?.toString().includes("handleDrawerResizeHandleMouseDown"), { searchExports: false });

function sendEmojiAsLink(emoji, channel) {
	const content = getEmojiUrl(emoji);
	if (Settings.state.sendDirectly) {
		try {
			return sendMessageDirectly(channel, content);
		} catch {
			Toast.error("Could not send directly.");
		}
	}
	insertText(content);
}

function handleUnsendableEmoji(emoji, channel) {
	if (emoji.animated && !Settings.state.shouldSendAnimatedEmojis)
		return Toast.info(STRINGS.disabledAnimatedEmojiErrorMessage);

	const user = UserStore.getCurrentUser();
	if (!hasEmbedPerms(channel, user) && !Settings.state.ignoreEmbedPermissions)
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

const EmojiComponent = getModuleAndKey(Filters.byStrings("getDisambiguatedEmojiContext", "isFavoriteEmojiWithoutFetchingLatest", "allowAnimatedEmoji"));

const patchHighlightAnimatedEmoji = () => {
	const { module, key } = EmojiComponent;
	if (module && key)
		Patcher.after(module, key, (_, [{ descriptor }], ret) => {
			if (descriptor.emoji.animated && Settings.state.shouldHihglightAnimatedEmojis) ret.props.className += " animated";
		});
	else Logger.patch("HighlightAnimatedEmoji");
};

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

function getNestedProp(obj, path) {
	return path.split(".").reduce((ob, prop) => ob?.[prop], obj);
}

const Button = TheBigBoyBundle.Button ||
	function ButtonComponentFallback(props) {
		return React.createElement('button', { ...props, });
	};

const MessageDecorations = getModule(Filters.byProps("MessagePopoutContent"));
const AssetURLUtils = getModule(Filters.byProps("getEmojiURL"));

const patchEmojiUtils = () => {
	if (MessageDecorations?.MessagePopoutContent)
		Patcher.after(MessageDecorations, "MessagePopoutContent", (_, __, ret) => {
			const { animated, emojiName, emojiId: id } = getNestedProp(ret, "props.children.0.props.children.0.props.children.0.props") || {};
			if (!id) return ret;

			const children = getNestedProp(ret, "props.children.0.props.children");

			if (!children) return ret;
			children.push(
				React.createElement('div', { className: "emojiControls", }, React.createElement(Button, {
						size: Button.Sizes.SMALL,
						color: Button.Colors.GREEN,
						onClick: () => {
							const url = AssetURLUtils.getEmojiURL({ id });
							if (!url) return Toast.error("no url found");
							copy(url);
							Toast.success("Copid");
						},
					}, "Copy url")

					, React.createElement(Button, {
						size: Button.Sizes.SMALL,
						color: Button.Colors.GREEN,
						onClick: () => {
							try {
								const emojis = Data.load("emojis") || [];
								emojis.push({
									animated,
									id,
									name: emojiName.replace(/:/gi, ""),
									allNamesString: emojiName,
									available: true,
									managed: false,
									require_colons: true,
									url: `https://cdn.discordapp.com/emojis/${id}.webp?size=4096&quality=lossless`,
									type: "GUILD_EMOJI"
								});
								Data.save("emojis", emojis);
								Toast.success("Saved.");
							} catch {
								Toast.error("Could not save.");
							}
						},
					}, "Save")
				)
			);
		});
	else Logger.patch("EmojiUtils");
};

const EmojiStore = getModule(m => m._dispatchToken && m.getName() === "EmojiStore");

const emojiContextConstructor = EmojiStore?.getDisambiguatedEmojiContext?.().constructor;

const patchFavoriteEmojis = () => {
	if (emojiContextConstructor)
		Patcher.after(emojiContextConstructor.prototype, "rebuildFavoriteEmojisWithoutFetchingLatest", (_, args, ret) => {
			const emojis = Data.load("emojis");
			ret[0] = [...ret[0], ...emojis];
		});
	else Logger.patch("emojiContextConstructor");

	Patcher.after(emojiContextConstructor.prototype, "getDisambiguatedEmoji", (_, args, ret) => {
		const emojis = Data.load("emojis");
		let sum = [];
		if (emojis.length > ret.length) {
			sum = [...emojis];
			ret.forEach(r => emojis.find(e => e.id === r.id) ? null : sum.push(r));
		} else {
			sum = [...ret];
			emojis.forEach(r => ret.find(e => e.id === r.id) ? null : sum.push(r));
		}

		return sum;
	});
};

const emojiHooks = getModule(a => a.useEmojiGrid);
const patchUseEmojiGrid = () => {
	if (emojiHooks?.useEmojiGrid)
		Patcher.after(emojiHooks, "useEmojiGrid", (_, [{ pickerIntention }], ret) => {
			if (pickerIntention !== EmojiIntentionEnum.CHAT) return ret;
			for (const a of ret.sectionDescriptors) {
				a.isNitroLocked = false;
			}
		});
	else Logger.patch("emojiHooks");
};

const { MenuItem } = TheBigBoyBundle;
const bbb = getModule(Filters.byStrings("useIsFavoriteEmoji"), { defaultExport: false });

function unfavHandler(id) {
	const emojis = Data.load("emojis");
	for (let i = emojis.length - 1; i >= 0; i--) {
		const emoji = emojis[i];
		if (emoji.id === id) {
			emojis.splice(i, 1);
			Data.save("emojis", emojis);
			break;
		}
	}
}

function fav(id) {
	const emoji = EmojiStore.getDisambiguatedEmojiContext().getById(id);
	if (!emoji) return Toast.error(`Could not find Emoji: ${id}`);

	const emojis = Data.load("emojis");
	emoji.push(emoji);
	Data.save("emojis", emojis);
	Toast.success(`Emoji ${id} Saved.`);
}

const patchUnfavoriteEmoji = () => {
	if (bbb?.default)
		Patcher.after(bbb, "default", (_, [{ type, id }], ret) => {
			if (type !== "emoji") return;
			if (id && ret?.props?.id === "favorite") {
				return (
					React.createElement(MenuItem, {
						action: () => fav(id),
						label: "favorite",
						id: "favorite",
					})
				);
			}

			if (!ret)
				return (
					React.createElement(MenuItem, {
						action: () => unfavHandler(id),
						label: "unfavorite",
						id: "unfavorite",
					})
				);
		});
	else Logger.patch("patchUnfavoriteEmoji");
};

class Emojis {
	start() {
		try {
			DOM.addStyle(css);
			patchIsEmojiFiltered();
			patchGetEmojiUnavailableReason();
			patchExpressionPicker();
			patchIsEmojiDisabled();
			patchHighlightAnimatedEmoji();
			patchEmojiUtils();
			patchFavoriteEmojis();
			patchUseEmojiGrid();
			patchUnfavoriteEmoji();
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

const css = `.CHAT .premiumPromo-1eKAIB {
	display: none;
}
.emojiItemDisabled-3VVnwp {
	filter: unset;
}

.emojiControls {
	display: flex;
	justify-content: flex-end;
	gap: 4px;
	margin-top: 5px;
}
.emojiSizeSlider {
	line-height: 1;
}


`;
