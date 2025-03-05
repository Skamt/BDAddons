/**
 * @name SendStickersAsLinks
 * @description Enables you to send custom Stickers as links
 * @version 2.2.11
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js
 */

const config = {
	"info": {
		"name": "SendStickersAsLinks",
		"version": "2.2.11",
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

// common\Api.js
const Api = new BdApi(config.info.name);
const UI = Api.UI;
const DOM = Api.DOM;
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;
const Logger = Api.Logger;
const Webpack = Api.Webpack;

// common\Utils\Logger.js
Logger.patchError = patchId => {
	console.error(`%c[${config.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};

// common\Webpack.js
const getModule = Webpack.getModule;
const Filters = Webpack.Filters;
const getMangled = Webpack.getMangled;

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return {};
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return {};
	return { module, key };
}

function mapExports(moduleFilter, exportsMap, options) {
	const module = getModule(moduleFilter, { ...options, raw: true });
	if (!module) return {};
	const { exports } = module;
	const res = { module: exports, mangledKeys: {} };
	for (const [mapKey, filter] of Object.entries(exportsMap)) {
		for (const [exportKey, val] of Object.entries(exports)) {
			if (!filter(val)) continue;
			res[mapKey] = val;
			res.mangledKeys[mapKey] = exportKey;
			break;
		}
	}
	return res;
}

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

// @Modules\Heading
const Heading = getModule(a => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

// @Modules\Slider
const Slider = getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true });

// @Modules\FormText
const FormText = getModule(a => a?.Types?.LABEL_DESCRIPTOR, { searchExports: true });

// common\Utils.jsx
const nop = () => {};

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

// src\SendStickersAsLinks\components\SettingComponent.jsx
const SettingComponent = () => {
	return [
		...[{
				settingKey: "sendDirectly",
				description: "Send Directly",
				note: "Send the sticker link in a message directly instead of putting it in the chat box."
			},
			{
				settingKey: "ignoreEmbedPermissions",
				description: "Ignore Embed Permissions",
				note: "Send sticker links regardless of embed permissions, meaning links will not turn into images."
			},
			{
				settingKey: "shouldSendAnimatedStickers",
				description: "Send animated stickers",
				note: "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)"
			},
			{
				settingKey: "shouldHighlightAnimated",
				description: "Highlight animated stickers"
			}
		].map(SettingSwtich),
		React.createElement(StickerSize, null)
	];
};

function StickerSize() {
	const [val, set] = Settings.useSetting("stickerSize");
	return (
		React.createElement(React.Fragment, null, React.createElement(Heading, {
			style: { marginBottom: 20 },
			tag: "h5",
		}, "Sticker Size"), React.createElement(Slider, {
			className: "stickerSizeSlider",
			stickToMarkers: true,
			sortedMarkers: true,
			equidistant: true,
			markers: [80, 100, 128, 160],
			minValue: 80,
			maxValue: 160,
			initialValue: val,
			onValueChange: set,
		}), React.createElement(FormText, { type: "description", }, "The size of the sticker in pixels. 160 is recommended"))
	);
}

// src\SendStickersAsLinks\Modules.js
const StickerSendability = mapExports(
	a => typeof a === "object" && "SENDABLE" in a, {
		StickerSendability: Filters.byKeys("SENDABLE_WITH_PREMIUM"),
		getStickerSendability: Filters.byStrings("canUseCustomStickersEverywhere"),
		isSendableSticker: Filters.byStrings("0===")
	}, { searchExports: true }
);

// src\SendStickersAsLinks\patches\patchStickerClickability.js
const patchStickerClickability = () => {
	/**
	 * Make stickers clickable.
	 **/
	if (!StickerSendability) return Logger.patchError("StickerClickability");
	Patcher.after(StickerSendability.module, StickerSendability.mangledKeys.isSendableSticker, () => true);
};

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

// @Modules\DiscordPermissions
const DiscordPermissions = getModule(Filters.byKeys("computePermissions"), { searchExports: false });

// @Enums\DiscordPermissionsEnum
const DiscordPermissionsEnum = getModule(Filters.byKeys("ADD_REACTIONS"), { searchExports: true }) || {
	"EMBED_LINKS": "16384n",
	"USE_EXTERNAL_EMOJIS": "262144n"
};

// common\Utils\Permissions.js
function hasEmbedPerms(channel, user) {
	return !channel.guild_id || DiscordPermissions?.can(
		DiscordPermissionsEnum.EMBED_LINKS,
		channel,
		user
	);
}

// @Modules\MessageActions
const MessageActions = getModule(Filters.byKeys('jumpToMessage', '_sendMessage'), { searchExports: false });

// src\SendStickersAsLinks\Constants.js
const STRINGS = {
	sendLottieStickerErrorMessage: "Official Discord Stickers are not supported.",
	missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
	disabledAnimatedStickersErrorMessage: "You have disabled animated stickers in settings."
};

// @Stores\UserStore
const UserStore = getModule(m => m._dispatchToken && m.getName() === "UserStore");

// @Stores\StickersStore
const StickersStore = getModule(m => m._dispatchToken && m.getName() === "StickersStore");

// @Stores\ChannelStore
const ChannelStore = getModule(m => m._dispatchToken && m.getName() === "ChannelStore");

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

// src\SendStickersAsLinks\Utils.js
const getStickerAssetUrl = getModule(Filters.byStrings("&passthrough=false"), { searchExports: true });
const { StickerSendability: StickersSendabilityEnum, getStickerSendability } = StickerSendability;
const StickerFormatEnum = {
	"1": "PNG",
	"2": "APNG",
	"3": "LOTTIE",
	"4": "GIF",
	"PNG": 1,
	"APNG": 2,
	"LOTTIE": 3,
	"GIF": 4
};

function sendStickerAsLink(sticker, channel) {
	const content = getStickerUrl(sticker);
	if (!Settings.state.sendDirectly) return insertText(content);
	try {
		sendMessageDirectly(channel, content);
	} catch {
		insertText(content);
		Toast.error("Could not send directly.");
	}
}

function getStickerUrl(sticker) {
	return getStickerAssetUrl(sticker, { size: Settings.state.stickerSize || 160 });
}

function isAnimatedSticker(sticker) {
	return sticker["format_type"] !== StickerFormatEnum.PNG;
}

function isStickerSendable(sticker, channel, user) {
	return getStickerSendability(sticker, user, channel) === StickersSendabilityEnum.SENDABLE;
}

function isLottieSticker(sticker) {
	return sticker["format_type"] === StickerFormatEnum.LOTTIE;
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

// src\SendStickersAsLinks\patches\patchSendSticker.js
function handleUnsendableSticker({ user, sticker, channel }) {
	if (isAnimatedSticker(sticker) && !Settings.state.shouldSendAnimatedStickers) return Toast.info(STRINGS.disabledAnimatedStickersErrorMessage);
	if (!hasEmbedPerms(channel, user) && !Settings.state.ignoreEmbedPermissions) return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);
	sendStickerAsLink(sticker, channel);
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
	else Logger.patchError("SendSticker");
};

// @Patch\StickerModule
const StickerModule = getModuleAndKey(Filters.byStrings("sticker", "withLoadingIndicator"), { searchExports: false }) || {};

// src\SendStickersAsLinks\patches\patchStickerComponent.js
const patchStickerComponent = () => {
	const { module, key } = StickerModule;
	if (!module || !key) return Logger.patchError("GetStickerById");
	Patcher.after(module, key, (_, args, returnValue) => {
		const { size, sticker } = returnValue.props.children[0].props;
		if (size === 96) {
			if (Settings.state.shouldHighlightAnimated && !isLottieSticker(sticker) && isAnimatedSticker(sticker)) {
				returnValue.props.children[0].props.className += " animatedSticker";
			}
		}
	});
};

// src\SendStickersAsLinks\patches\patchStickerAttachement.js
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
				const { isSendable, sticker, channel } = handleSticker(channelId, stickerId);
				if (!isSendable) {
					delete args[3].stickerIds;
					setTimeout(() => sendMessageDirectly(channel, getStickerUrl(sticker)));
				}
			}
		});
	else Logger.patchError("StickerAttachement");
};

// @Enums\StickerTypeEnum
const StickerTypeEnum = getModule(Filters.byKeys("GUILD", "STANDARD"), { searchExports: true }) || {
	"STANDARD": 1,
	"GUILD": 2
};

// src\SendStickersAsLinks\patches\patchStickerSuggestion.js
const patchStickerSuggestion = () => {
	/**
	 * Enables suggestions
	 * */
	if (!StickerSendability) return Logger.patchError("StickerSuggestion");
	Patcher.after(StickerSendability.module, StickerSendability.mangledKeys.getStickerSendability, (_, args, returnValue) => {
		if (args[0].type === StickerTypeEnum.GUILD) {
			const { SENDABLE } = StickerSendability.StickerSendability;
			return returnValue !== SENDABLE ? SENDABLE : returnValue;
		}
	});
};

// src\SendStickersAsLinks\patches\patchChannelGuildPermissions.js
const patchChannelGuildPermissions = () => {
	if (!DiscordPermissions) return Logger.patchError("ChannelGuildPermissions");
	Patcher.after(DiscordPermissions, "can", (_, [permission], ret) => ret || DiscordPermissionsEnum.USE_EXTERNAL_EMOJIS === permission);
};

// src\SendStickersAsLinks\index.jsx
class SendStickersAsLinks {
	start() {
		try {
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

.stickerSizeSlider {
	line-height: 1;
}`;
