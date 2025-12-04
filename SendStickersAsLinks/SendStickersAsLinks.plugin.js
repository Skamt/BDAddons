/**
 * @name SendStickersAsLinks
 * @description Enables you to send custom Stickers as links
 * @version 2.3.4
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "SendStickersAsLinks",
		"version": "2.3.4",
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
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var UI = /* @__PURE__ */ (() => Api.UI)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var Data = /* @__PURE__ */ (() => Api.Data)();
var React = /* @__PURE__ */ (() => Api.React)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var Webpack = /* @__PURE__ */ (() => Api.Webpack)();

// common/Utils/Logger.js
Logger.patchError = (patchId) => {
	console.error(`%c[${Config_default.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};
var Logger_default = Logger;

// common/Utils/EventEmitter.js
var EventEmitter_default = class {
	constructor() {
		this.listeners = {};
	}
	isInValid(event, handler) {
		return typeof event !== "string" || typeof handler !== "function";
	}
	once(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		const wrapper = () => {
			handler();
			this.off(event, wrapper);
		};
		this.listeners[event].add(wrapper);
	}
	on(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		this.listeners[event].add(handler);
		return () => this.off(event, handler);
	}
	off(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) return;
		this.listeners[event].delete(handler);
		if (this.listeners[event].size !== 0) return;
		delete this.listeners[event];
	}
	emit(event, ...payload) {
		if (!this.listeners[event]) return;
		for (const listener of this.listeners[event]) {
			try {
				listener.apply(null, payload);
			} catch (err) {
				Logger_default.error(`Could not run listener for ${event}`, err);
			}
		}
	}
};

// common/Utils/Plugin.js
var Events = {
	START: "START",
	STOP: "STOP"
};
var Plugin_default = new class extends EventEmitter_default {
	start() {
		this.emit(Events.START);
	}
	stop() {
		this.emit(Events.STOP);
	}
}();

// common/Utils/StylesLoader.js
var styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};
Plugin_default.on(Events.START, () => {
	DOM.addStyle(styleLoader._styles.join("\n"));
});
Plugin_default.on(Events.STOP, () => {
	DOM.removeStyle();
});
var StylesLoader_default = styleLoader;

// src/SendStickersAsLinks/styles.css
StylesLoader_default.push(`.animatedSticker{
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
}`);

// common/React.jsx
var React_default = /* @__PURE__ */ (() => React)();

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function getModuleAndKey(filter, options) {
	let module2;
	const target = getModule((entry, m) => filter(entry) ? module2 = m : false, options);
	module2 = module2?.exports;
	if (!module2) return;
	const key = Object.keys(module2).find((k) => module2[k] === target);
	if (!key) return;
	return { module: module2, key };
}

// MODULES-AUTO-LOADER:@Modules/DiscordPermissions
var DiscordPermissions_default = getModule(Filters.byKeys("computePermissions"), { searchExports: false });

// MODULES-AUTO-LOADER:@Enums/DiscordPermissionsEnum
var DiscordPermissionsEnum_default = getModule(Filters.byKeys("ADD_REACTIONS"), { searchExports: true }) || {
	"EMBED_LINKS": "16384n",
	"USE_EXTERNAL_EMOJIS": "262144n"
};

// src/SendStickersAsLinks/patches/patchChannelGuildPermissions.js
Plugin_default.on(Events.START, () => {
	if (!DiscordPermissions_default) return Logger_default.patchError("ChannelGuildPermissions");
	const unpatch = Patcher.after(DiscordPermissions_default, "can", (_, [permission], ret) => ret || DiscordPermissionsEnum_default.USE_EXTERNAL_EMOJIS === permission);
	Plugin_default.once(Events.STOP, unpatch);
});

// common/DiscordModules/zustand.js
var { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});
var subscribeWithSelector = getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), { searchExports: true });

function create(initialState) {
	const Store = zustand(initialState);
	Object.defineProperty(Store, "state", {
		configurable: false,
		get: () => Store.getState()
	});
	return Store;
}

// common/Utils/index.js
var nop = () => {};

// common/Utils/Settings.js
var SettingsStore = create(subscribeWithSelector(() => Object.assign(Config_default.settings, Data.load("settings") || {})));
((state) => {
	const selectors = {};
	const actions = {};
	for (const [key, value] of Object.entries(state)) {
		actions[`set${key}`] = (newValue) => SettingsStore.setState({
			[key]: newValue });
		selectors[key] = (state2) => state2[key];
	}
	Object.defineProperty(SettingsStore, "selectors", { value: Object.assign(selectors) });
	Object.assign(SettingsStore, actions);
})(SettingsStore.getInitialState());
SettingsStore.subscribe(
	(state) => state,
	() => Data.save("settings", SettingsStore.state)
);
Object.assign(SettingsStore, {
	useSetting: (key) => {
		const val = SettingsStore((state) => state[key]);
		return [val, SettingsStore[`set${key}`]];
	}
});
var Settings_default = SettingsStore;

// common/Utils/Toast.js
function showToast(content, type) {
	UI.showToast(`[${Config_default.info.name}] ${content}`, { timeout: 5e3, type });
}
var Toast_default = {
	success(content) {
		showToast(content, "success");
	},
	info(content) {
		showToast(content, "info");
	},
	warning(content) {
		showToast(content, "warning");
	},
	error(content) {
		showToast(content, "error");
	}
};

// common/Utils/Permissions.js
function hasEmbedPerms(channel, user) {
	return !channel.guild_id || DiscordPermissions_default?.can(
		DiscordPermissionsEnum_default.EMBED_LINKS,
		channel,
		user
	);
}

// MODULES-AUTO-LOADER:@Modules/MessageActions
var MessageActions_default = getModule(Filters.byKeys("jumpToMessage", "_sendMessage"), { searchExports: false });

// src/SendStickersAsLinks/Constants.js
var Constants_default = {
	sendLottieStickerErrorMessage: "Official Discord Stickers are not supported.",
	missingEmbedPermissionsErrorMessage: "Missing Embed Permissions",
	disabledAnimatedStickersErrorMessage: "You have disabled animated stickers in settings."
};

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = getStore("UserStore");

// MODULES-AUTO-LOADER:@Stores/StickersStore
var StickersStore_default = getStore("StickersStore");

// MODULES-AUTO-LOADER:@Stores/ChannelStore
var ChannelStore_default = getStore("ChannelStore");

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: false });

// MODULES-AUTO-LOADER:@Stores/PendingReplyStore
var PendingReplyStore_default = getStore("PendingReplyStore");

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = getStore("SelectedChannelStore");

// common/Utils/Messages.js
function getReply(channelId) {
	const reply = PendingReplyStore_default?.getPendingReply(channelId);
	if (!reply) return {};
	Dispatcher_default?.dispatch({ type: "DELETE_PENDING_REPLY", channelId });
	return {
		messageReference: {
			guild_id: reply.channel.guild_id,
			channel_id: reply.channel.id,
			message_id: reply.message.id
		},
		allowedMentions: reply.shouldMention ? void 0 : {
			parse: ["users", "roles", "everyone"],
			replied_user: false
		}
	};
}

function sendMessageDirectly(content, channelId) {
	if (!MessageActions_default?.sendMessage || typeof MessageActions_default.sendMessage !== "function") return;
	if (!channelId) channelId = SelectedChannelStore_default.getChannelId();
	return MessageActions_default.sendMessage(
		channelId, {
			validNonShortcutEmojis: [],
			content
		},
		void 0,
		getReply(channelId)
	);
}
var insertText = /* @__PURE__ */ (() => {
	let ComponentDispatch;
	return (content) => {
		if (!ComponentDispatch) ComponentDispatch = getModule((m) => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length, { searchExports: true });
		if (!ComponentDispatch) return;
		setTimeout(
			() => ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
				plainText: content
			})
		);
	};
})();

// src/SendStickersAsLinks/Modules.js
var StickerSendability = getMangled(
	(a) => typeof a === "object" && "SENDABLE" in a, {
		StickersSendabilityEnum: Filters.byKeys("SENDABLE_WITH_PREMIUM"),
		getStickerSendability: Filters.byStrings("canUseCustomStickersEverywhere"),
		isSendableSticker: Filters.byStrings("0===")
	}, { searchExports: true, raw: true }
);

// src/SendStickersAsLinks/Utils.js
var { getStickerAssetUrl } = getMangled(Filters.bySource("API_ENDPOINT", "ASSET_ENDPOINT"), {
	getStickerAssetUrl: Filters.byStrings("STICKER_ASSET")
});
var { StickersSendabilityEnum, getStickerSendability } = StickerSendability;
var StickerFormatEnum = {
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
	if (!Settings_default.state.sendDirectly) return insertText(content);
	try {
		sendMessageDirectly(content, channel.id);
	} catch {
		insertText(content);
		Toast_default.error("Could not send directly.");
	}
}

function getStickerUrl(sticker) {
	const size = Settings_default.state.stickerSize || 160;
	if (!getStickerAssetUrl) return `https://media.discordapp.net/stickers/${sticker.id}.webp?size=${size}&quality=lossless`;
	return getStickerAssetUrl(sticker, { size });
}

function isAnimatedSticker(sticker) {
	return sticker.format_type !== StickerFormatEnum.PNG;
}

function isStickerSendable(sticker, channel, user) {
	return getStickerSendability(sticker, user, channel) === StickersSendabilityEnum.SENDABLE;
}

function isLottieSticker(sticker) {
	return sticker["format_type"] === StickerFormatEnum.LOTTIE;
}

function handleSticker(channelId, stickerId) {
	const user = UserStore_default.getCurrentUser();
	const sticker = StickersStore_default.getStickerById(stickerId);
	const channel = ChannelStore_default.getChannel(channelId);
	return {
		user,
		sticker,
		channel,
		isSendable: isStickerSendable(sticker, channel, user)
	};
}

// src/SendStickersAsLinks/patches/patchSendSticker.js
function handleUnsendableSticker({ user, sticker, channel }) {
	if (isAnimatedSticker(sticker) && !Settings_default.state.shouldSendAnimatedStickers) return Toast_default.info(Constants_default.disabledAnimatedStickersErrorMessage);
	if (!hasEmbedPerms(channel, user) && !Settings_default.state.ignoreEmbedPermissions) return Toast_default.info(Constants_default.missingEmbedPermissionsErrorMessage);
	sendStickerAsLink(sticker, channel);
}
Plugin_default.on(Events.START, () => {
	if (!MessageActions_default) return Logger_default.patchError("SendSticker");
	const unpatch = Patcher.instead(MessageActions_default, "sendStickers", (_, args, originalFunc) => {
		const [channelId, [stickerId]] = args;
		const stickerObj = handleSticker(channelId, stickerId);
		if (stickerObj.isSendable) originalFunc.apply(_, args);
		else handleUnsendableSticker(stickerObj);
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// src/SendStickersAsLinks/patches/patchStickerAttachement.js
Plugin_default.on(Events.START, () => {
	if (!MessageActions_default) return Logger_default.patchError("StickerAttachement");
	const unpatch = Patcher.before(MessageActions_default, "sendMessage", (_, args) => {
		const [channelId, , , attachments] = args;
		if (attachments?.stickerIds?.filter) {
			const [stickerId] = attachments.stickerIds;
			const { isSendable, sticker, channel } = handleSticker(channelId, stickerId);
			if (!isSendable) {
				args[3].stickerIds = void 0;
				setTimeout(() => sendStickerAsLink(sticker, channel));
			}
		}
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// src/SendStickersAsLinks/patches/patchStickerClickability.js
Plugin_default.on(Events.START, () => {
	if (!StickerSendability) return Logger_default.patchError("StickerClickability");
	const unpatch = Patcher.after(StickerSendability, "isSendableSticker", () => true);
	Plugin_default.once(Events.STOP, unpatch);
});

// MODULES-AUTO-LOADER:@Patch/StickerModule
var StickerModule_default = getModuleAndKey(Filters.byStrings("sticker", "withLoadingIndicator"), { searchExports: false }) || {};

// src/SendStickersAsLinks/patches/patchStickerComponent.js
Plugin_default.on(Events.START, () => {
	const { module: module2, key } = StickerModule_default;
	if (!module2 || !key) return Logger_default.patchError("GetStickerById");
	const unpatch = Patcher.after(module2, key, (_, args, returnValue) => {
		const { size, sticker } = returnValue.props.children[0].props;
		if (size === 96) {
			if (Settings_default.state.shouldHighlightAnimated && !isLottieSticker(sticker) && isAnimatedSticker(sticker)) {
				returnValue.props.children[0].props.className += " animatedSticker";
			}
		}
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// MODULES-AUTO-LOADER:@Enums/StickerTypeEnum
var StickerTypeEnum_default = getModule(Filters.byKeys("GUILD", "STANDARD"), { searchExports: true }) || {
	"STANDARD": 1,
	"GUILD": 2
};

// src/SendStickersAsLinks/patches/patchStickerSuggestion.js
Plugin_default.on(Events.START, () => {
	if (!StickerSendability) return Logger_default.patchError("StickerSuggestion");
	const unpatch = Patcher.after(StickerSendability, "getStickerSendability", (_, args, returnValue) => {
		if (args[0].type === StickerTypeEnum_default.GUILD) {
			const { SENDABLE } = StickerSendability.StickersSendabilityEnum;
			return returnValue !== SENDABLE ? SENDABLE : returnValue;
		}
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

// MODULES-AUTO-LOADER:@Modules/Slider
var Slider_default = getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true });

// MODULES-AUTO-LOADER:@Modules/FormSwitch
var FormSwitch_default = getModule(Filters.byStrings("note", "tooltipNote"), { searchExports: true });

// common/Components/Switch/index.jsx
var Switch_default = getModule(Filters.byStrings('"data-toggleable-component":"switch"', 'layout:"horizontal"'), { searchExports: true }) || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("div", { style: { color: "#fff" } }, props.children, /* @__PURE__ */ React.createElement(
		"input", {
			type: "checkbox",
			checked: props.value,
			onChange: (e) => props.onChange(e.target.checked)
		}
	));
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ settingKey, note, onChange = nop, description, ...rest }) {
	const [val, set] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React.createElement(
		Switch_default, {
			...rest,
			checked: val,
			label: description || settingKey,
			description: note,
			onChange: (e) => {
				set(e);
				onChange(e);
			}
		}
	);
}

// common/Components/FieldSet/styles.css
StylesLoader_default.push(`.fieldset-container {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.fieldset-label {
	margin-bottom: 12px;
}

.fieldset-description {
	margin-bottom: 12px;
}

.fieldset-label + .fieldset-description{
	margin-top:-8px;
	margin-bottom: 0;
}

.fieldset-content {
	display: flex;
	flex-direction: column;
	width: 100%;
	justify-content: flex-start;
}
`);

// common/Utils/css.js
var classNameFactory = (prefix = "", connector = "-") => (...args) => {
	const classNames = /* @__PURE__ */ new Set();
	for (const arg of args) {
		if (arg && typeof arg === "string") classNames.add(arg);
		else if (Array.isArray(arg)) arg.forEach((name) => classNames.add(name));
		else if (arg && typeof arg === "object") Object.entries(arg).forEach(([name, value]) => value && classNames.add(name));
	}
	return Array.from(classNames, (name) => `${prefix}${connector}${name}`).join(" ");
};

// common/Components/FieldSet/index.jsx
var c = classNameFactory("fieldset");

function FieldSet({ label, description, children, contentGap = 16 }) {
	return /* @__PURE__ */ React_default.createElement("fieldset", { className: c("container") }, label && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c("label"),
			tag: "legend",
			variant: "text-lg/medium"
		},
		label
	), description && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c("description"),
			variant: "text-sm/normal",
			color: "text-secondary"
		},
		description
	), /* @__PURE__ */ React_default.createElement("div", { className: c("content"), style: { gap: contentGap } }, children));
}

// common/Components/Divider/styles.css
StylesLoader_default.push(`.divider-base {
	border-top: thin solid var(--border-subtle);
	flex:1 0 0;
}

.divider-horizontal {
	width: 100%;
	height: 1px;
}

.divider-vertical {
	width: 1px;
	height: 100%;
}
`);

// common/Components/Divider/index.jsx
var c2 = classNameFactory("divider");

function Divider({ direction = "horizontal", gap }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: {
				marginTop: gap,
				marginBottom: gap
			},
			className: c2("base", { direction })
		}
	);
}
Divider.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// src/SendStickersAsLinks/components/SettingComponent.jsx
function StickerSize() {
	const [val, set] = Settings_default.useSetting("stickerSize");
	return /* @__PURE__ */ React_default.createElement(
		Slider_default, {
			className: "stickerSizeSlider",
			label: "Sticker Size",
			description: "The size of the sticker in pixels. 160 is recommended",
			stickToMarkers: true,
			sortedMarkers: true,
			equidistant: true,
			markers: [80, 100, 128, 160],
			minValue: 80,
			maxValue: 160,
			initialValue: val,
			onValueChange: set
		}
	);
}
var SettingComponent_default = () => {
	return /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [{
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
	].map(SettingSwtich), /* @__PURE__ */ React_default.createElement(Divider, { gap: 15 }), /* @__PURE__ */ React_default.createElement(StickerSize, null));
};

// src/SendStickersAsLinks/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent_default, null);
module.exports = () => Plugin_default;
