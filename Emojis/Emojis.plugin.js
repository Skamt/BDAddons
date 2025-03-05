/**
 * @name Emojis
 * @description Send emoji as link if it can't be sent it normally.
 * @version 1.0.4
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Emojis
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Emojis/Emojis.plugin.js
 */

const config = {
	"info": {
		"name": "Emojis",
		"version": "1.0.4",
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
		"sendEmojiAsPng": false,
		"shouldHihglightAnimatedEmojis": true,
		"emojiSize": 48
	}
}

// common\Api.js
const Api = new BdApi(config.info.name);
const UI = Api.UI;
const DOM = Api.DOM;
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;
const Logger = Api.Logger;
const Webpack = Api.Webpack;

// common\Utils.jsx
const nop = () => {};

// common\Webpack.js
const getModule = Webpack.getModule;
const Filters = Webpack.Filters;
const getMangled = Webpack.getMangled;

// common\DiscordModules\Modules.js
const { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});

// common\Utils\Settings.js
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

// @Modules\FormSwitch
const FormSwitch = getModule(Filters.byStrings("note", "tooltipNote"), { searchExports: true });

// common\Components\Switch\index.jsx
const Switch = FormSwitch ||
	function SwitchComponentFallback(props) {
		return (
			React.createElement('div', { style: { color: "#fff" }, }, props.children, React.createElement('input', {
				type: "checkbox",
				checked: props.value,
				onChange: e => props.onChange(e.target.checked),
			}))
		);
	};

// common\Components\SettingSwtich\index.jsx
function SettingSwtich({ settingKey, note, onChange = nop, hideBorder = false, description, ...rest }) {
	const [val, set] = Settings.useSetting(settingKey);
	return (
		React.createElement(Switch, {
			...rest,
			value: val,
			note: note,
			hideBorder: hideBorder,
			onChange: e => {
				set(e);
				onChange(e);
			},
		}, description || settingKey)
	);
}

// @Modules\Heading
const Heading = getModule(a => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

// @Modules\Slider
const Slider = getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true });

// @Modules\FormText
const FormText = getModule(a => a?.Types?.LABEL_DESCRIPTOR, { searchExports: true });

// src\Emojis\components\SettingComponent.jsx
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
		}, "Emoji Size"), React.createElement(Slider, {
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

// common\Utils\Logger.js
Logger.patchError = patchId => {
	console.error(`%c[${config.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};

// @Modules\EmojiFunctions
const EmojiFunctions = getModule(Filters.byKeys("getEmojiUnavailableReason"), { searchExports: true });

// @Enums\EmojiIntentionEnum
const EmojiIntentionEnum = getModule(Filters.byKeys("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true }) || {
	"CHAT": 3
};

// @Stores\EmojiStore
const EmojiStore = getModule(m => m._dispatchToken && m.getName() === "EmojiStore");

// @Stores\SelectedChannelStore
const SelectedChannelStore = getModule(m => m._dispatchToken && m.getName() === "SelectedChannelStore");

// @Stores\ChannelStore
const ChannelStore = getModule(m => m._dispatchToken && m.getName() === "ChannelStore");

// @Modules\MessageActions
const MessageActions = getModule(Filters.byKeys('jumpToMessage', '_sendMessage'), { searchExports: false });

// @Modules\Dispatcher
const Dispatcher = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: false });

// @Stores\PendingReplyStore
const PendingReplyStore = getModule(m => m._dispatchToken && m.getName() === "PendingReplyStore");

// common\Utils\Messages.js
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

// @Stores\DraftStore
const DraftStore = getModule(m => m._dispatchToken && m.getName() === "DraftStore");

// common\Utils\Toast.js
function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { timeout: 5000, type });
}
const Toast = {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
};

// src\Emojis\Utils.js
function getCustomEmojiById(id) {
	const emoji = EmojiStore.getCustomEmojiById(id);
	if (emoji) return emoji;
	const savedEmojis = Data.load("emojis");
	return savedEmojis.find(a => a.id === id);
}

function getEmojiUrl(id) {
	const { animated } = getCustomEmojiById(id) || { animated: false };
	const size = Settings.state.emojiSize;
	const asPng = Settings.state.sendEmojiAsPng;
	const type = animated ? (asPng ? "png" : "gif") : "png";
	return `https://cdn.discordapp.com/emojis/${id}.${type}${animated && !asPng ? "" : `?size=${size}`}`;
}

function sendEmojiAsLink(content, channel) {
	if (!channel) channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
	const draft = DraftStore.getDraft(channel.id, 0);
	if (draft) return insertText(`[󠇫](${content})`);
	if (Settings.state.sendDirectly) {
		try {
			return sendMessageDirectly(channel, content);
		} catch {
			Toast.error("Could not send directly.");
		}
	}
	insertText(content);
}

function sendEmojiDirectly(id) {
	const content = getEmojiUrl(id);
	sendEmojiAsLink(content);
}

function insertEmoji(id) {
	const content = getEmojiUrl(id);
	insertText(content);
}

// src\Emojis\patches\patchIsEmojiDisabled.js
const patchIsEmojiDisabled = () => {
	if (!EmojiFunctions?.isEmojiDisabled) return Logger.patchError("IsEmojiDisabled");
	Patcher.after(EmojiFunctions, "isEmojiDisabled", (_, [{ intention }], ret) => {
		if (intention !== EmojiIntentionEnum.CHAT) return ret;
		return false;
	});
};

// src\Emojis\EmojisManager.js
function buildEmojiObj({ animated, name, id }) {
	return {
		"animated": animated ? true : false,
		"available": true,
		"id": id,
		"name": name,
		"allNamesString": `:${name}:`,
		"guildId": ""
	};
}

function serializeEmoji({ animated, name, id }) {
	return `${animated ? "a" : ""}:${name}:${id}`;
}
const EmojisManager = (() => {
	const Emojis = Object.create(null);
	const savedEmojis = Data.load("emojis") || [];
	Emojis.emojis = savedEmojis.map(emoji => {
		const [animated, name, id] = emoji.split(":");
		return buildEmojiObj({ animated, name, id });
	});

	function commit() {
		Data.save("emojis", savedEmojis);
	}
	Emojis.add = function({ animated, name, id }) {
		const index = Emojis.emojis.findIndex(e => e.id === id);
		if (index !== -1) return;
		Emojis.emojis.push(buildEmojiObj({ animated, name, id }));
		savedEmojis.push(serializeEmoji({ animated, name, id }));
		commit();
	};
	Emojis.remove = function(id) {
		const emojiIndex = Emojis.emojis.findIndex(e => e.id === id);
		const savedEmojisIndex = savedEmojis.findIndex(e => e.id.includes(id));
		if (emojiIndex === -1) return;
		if (savedEmojisIndex === -1) return;
		Emojis.emojis.splice(emojiIndex, 1);
		savedEmojis.splice(savedEmojisIndex, 1);
		commit();
	};
	Emojis.has = function(id) {
		return -1 !== Emojis.emojis.findIndex(e => e.id === id);
	};
	return Emojis;
})();

// src\Emojis\patches\patchFavoriteEmojis.js
const emojiContextConstructor = EmojiStore?.getDisambiguatedEmojiContext?.().constructor;
const patchFavoriteEmojis = () => {
	if (!emojiContextConstructor) return Logger.patchError("emojiContextConstructor");
	Patcher.after(emojiContextConstructor.prototype, "rebuildFavoriteEmojisWithoutFetchingLatest", (_, args, ret) => {
		if (!ret?.favorites) return;
		ret.favorites = [...ret.favorites, ...EmojisManager.emojis];
	});
	Patcher.after(emojiContextConstructor.prototype, "getDisambiguatedEmoji", (_, args, ret) => {
		return [...ret, ...EmojisManager.emojis];
	});
};

// src\Emojis\patches\patchExpressionPickerEmojiContextMenu.js
/* eslint-disable react/jsx-key */
const { Item: MenuItem } = BdApi.ContextMenu;
const bbb = getModule(Filters.byStrings("unfavorite"), { defaultExport: false });
const patchExpressionPickerEmojiContextMenu = () => {
	if (!bbb?.Z) return Logger.patchError("patchUnfavoriteEmoji");
	Patcher.after(bbb, "Z", (_, args, ret) => {
		const [{ type, isInExpressionPicker, id }] = args;
		if (type !== "emoji" || !isInExpressionPicker || !id) return;
		return [
			React.createElement(MenuItem, {
				action: () => sendEmojiDirectly(id),
				id: "send-directly",
				label: "send directly",
			}),
			React.createElement(MenuItem, {
				action: () => insertEmoji(id),
				id: "insert-url",
				label: "insert url",
			}),
			ret
		];
	});
};

// src\Emojis\index.jsx
window.t = EmojisManager;
class Emojis {
	start() {
		try {
			DOM.addStyle(css);
			patchIsEmojiDisabled();
			patchFavoriteEmojis();
			patchExpressionPickerEmojiContextMenu();
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
