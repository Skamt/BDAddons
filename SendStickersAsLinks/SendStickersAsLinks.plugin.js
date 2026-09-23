/**
 * @runAt idle
 * @name SendStickersAsLinks
 * @description Enables you to send custom Stickers as links
 * @version 2.3.6
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/SendStickersAsLinks
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/SendStickersAsLinks/SendStickersAsLinks.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "SendStickersAsLinks",
		"version": "2.3.6",
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
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var UI = /* @__PURE__ */ (() => BdApi.UI)();

// common/Utils/Logger.js
var Logger_default = Logger;

// common/Plugin.js
var target = /* @__PURE__ */ (() => new EventTarget())();

function wrap(handler) {
	return (e) => {
		try {
			handler.apply(null, e);
		} catch (err) {
			Logger_default.error(`Could not run [${e.type}] handler`, { handler }, "\n", err);
		}
	};
}
var Plugin_default = {
	onStart: (handler, props) => target.addEventListener("START", wrap(handler), props),
	onStop: (handler, props) => target.addEventListener("STOP", wrap(handler), props),
	start() {
		target.dispatchEvent(new Event("START"));
	},
	stop() {
		target.dispatchEvent(new Event("STOP"));
	}
};

// common/Utils/StylesLoader.js
var styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};
Plugin_default.onStart(() => DOM.addStyle(styleLoader._styles.join("\n")));
Plugin_default.onStop(() => DOM.removeStyle());
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
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;

// common/Utils/index.js
function hasOwn(object, key) {
	return object && key && key in object;
}
var nop = () => {};

// common/Patcher/shared.js
Plugin_default.onStop(() => Patcher.unpatchAll());

function patchOnce(type, object, key, callback) {
	const unpatch = Patcher[type](object, key, (...args) => {
		unpatch();
		callback.apply(null, args);
	});
}

function patch(type, object, key, callback, once) {
	if (!hasOwn(object, key))
		return Logger.error("Could not perform a patch, missing arguments", arguments);
	const caller = {
		after: (context, args, ret) => callback({ context, args, ret }),
		before: (context, args) => callback({ context, args }),
		instead: (context, args, fn) => callback({ context, args, fn })
	} [type];
	return once ? patchOnce(type, object, key, caller) : Patcher[type](object, key, caller);
}

// common/Patcher/index.js
var after = (...args) => patch("after", ...args);
var before = (...args) => patch("before", ...args);
var instead = (...args) => patch("instead", ...args);

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function getModuleAndKey(filter, options) {
	let module2;
	const target2 = getModule((entry, m) => filter(entry) ? module2 = m : false, options);
	module2 = module2?.exports;
	if (!module2) return;
	const key = Object.keys(module2).find((k) => module2[k] === target2);
	if (!key) return;
	return [module2, key];
}

// MODULES-AUTO-LOADER:@Modules/DiscordPermissions
var DiscordPermissions_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("computePermissions"), { searchExports: false }))();

// MODULES-AUTO-LOADER:@Enums/DiscordPermissionsEnum
var DiscordPermissionsEnum_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("ADD_REACTIONS"), { searchExports: true }) || void 0)();

// src/SendStickersAsLinks/patches/patchChannelGuildPermissions.js
Plugin_default.onStart(() => {
	after(DiscordPermissions_default, "can", ({ args: [permission], ret }) => ret || DiscordPermissionsEnum_default.USE_EXTERNAL_EMOJIS === permission);
});

// common/DiscordModules/zustand.js
var zustand = /* @__PURE__ */ (() => getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
})?.zustand)();
var subscribeWithSelector = /* @__PURE__ */ (() => getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), {
	searchExports: true
}))();

function create(initialState) {
	const Store = /* @__PURE__ */ zustand(initialState);
	/* @__PURE__ */
	Object.defineProperty(Store, "state", {
		configurable: false,
		get: () => Store.getState()
	});
	return Store;
}

// common/Utils/Settings.js
var Settings_default = /* @__PURE__ */ (() => {
	const SettingsStore = create(
		subscribeWithSelector(() => Object.assign(Config_default.settings || {}, Data.load("settings") || {}))
	);
	const state = SettingsStore.getInitialState();
	const selectors = {};
	const actions = {};
	for (const key of Object.keys(state)) {
		actions[`set${key}`] = (newValue) => SettingsStore.setState({
			[key]: newValue });
		selectors[key] = (state2) => state2[key];
	}
	Object.defineProperty(SettingsStore, "selectors", { value: Object.assign(selectors) });
	Object.assign(SettingsStore, actions);
	SettingsStore.subscribe(
		(state2) => state2,
		() => Data.save("settings", SettingsStore.state)
	);
	Object.assign(SettingsStore, {
		useSetting: (key) => {
			const val = SettingsStore((state2) => state2[key]);
			return [val, SettingsStore[`set${key}`]];
		}
	});
	return SettingsStore;
})();

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
var MessageActions_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("jumpToMessage", "_sendMessage"), { searchExports: false }))();

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = /* @__PURE__ */ (() => getStore("UserStore"))();

// MODULES-AUTO-LOADER:@Stores/StickersStore
var StickersStore_default = /* @__PURE__ */ (() => getStore("StickersStore"))();

// MODULES-AUTO-LOADER:@Stores/ChannelStore
var ChannelStore_default = /* @__PURE__ */ (() => getStore("ChannelStore"))();

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true }))();

// MODULES-AUTO-LOADER:@Stores/PendingReplyStore
var PendingReplyStore_default = /* @__PURE__ */ (() => getStore("PendingReplyStore"))();

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = /* @__PURE__ */ (() => getStore("SelectedChannelStore"))();

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
	sendMessageDirectly(content, channel.id).catch(() => {
		Toast_default.error("Could not send directly.");
		insertText(content);
	});
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
	if (isAnimatedSticker(sticker) && !Settings_default.state.shouldSendAnimatedStickers)
		return Toast_default.info("You have disabled animated stickers in settings.");
	if (!hasEmbedPerms(channel, user) && !Settings_default.state.ignoreEmbedPermissions)
		return Toast_default.info("Missing Embed Permissions");
	sendStickerAsLink(sticker, channel);
}
Plugin_default.onStart(() => {
	instead(MessageActions_default, "sendStickers", ({ context, args, fn }) => {
		const [channelId, [stickerId]] = args;
		const stickerObj = handleSticker(channelId, stickerId);
		if (stickerObj.isSendable) fn.apply(context, args);
		else handleUnsendableSticker(stickerObj);
	});
});

// src/SendStickersAsLinks/patches/patchStickerAttachement.js
var replyInterceptor = {
	handler(a) {
		if (a.type !== "DELETE_PENDING_REPLY") return;
		delete a.channelId;
	},
	on() {
		Dispatcher_default.addInterceptor(this.handler);
	},
	off() {
		Dispatcher_default._interceptors.splice(Dispatcher_default._interceptors.indexOf(this.handler), 1);
	}
};
Plugin_default.onStart(() => {
	before(MessageActions_default, "sendMessage", ({ args }) => {
		const [channelId, , , attachments] = args;
		if (attachments?.stickerIds?.filter) {
			const [stickerId] = attachments.stickerIds;
			const { isSendable, sticker, channel } = handleSticker(channelId, stickerId);
			if (!isSendable) {
				replyInterceptor.on();
				args[3].stickerIds = void 0;
				setTimeout(() => {
					replyInterceptor.off();
					sendStickerAsLink(sticker, channel);
				});
			}
		}
	});
});

// src/SendStickersAsLinks/patches/patchStickerClickability.js
Plugin_default.onStart(() => after(StickerSendability, "isSendableSticker", () => true));

// MODULES-AUTO-LOADER:@Patch/StickerModule
var StickerModule_default = /* @__PURE__ */ (() => getModuleAndKey(Filters.byStrings("sticker", "withLoadingIndicator"), { searchExports: false }) || {})();

// src/SendStickersAsLinks/patches/patchStickerComponent.js
Plugin_default.onStart(
	() => after(...StickerModule_default, ({ ret }) => {
		const { size, sticker } = ret.props.children[0].props;
		if (size === 96) {
			if (Settings_default.state.shouldHighlightAnimated && !isLottieSticker(sticker) && isAnimatedSticker(sticker)) {
				ret.props.children[0].props.className += " animatedSticker";
			}
		}
	})
);

// MODULES-AUTO-LOADER:@Enums/StickerTypeEnum
var StickerTypeEnum_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("GUILD", "STANDARD"), { searchExports: true }) || void 0)();

// src/SendStickersAsLinks/patches/patchStickerSuggestion.js
Plugin_default.onStart(
	() => after(StickerSendability, "getStickerSendability", ({ args, ret }) => {
		if (args[0].type === StickerTypeEnum_default.GUILD) {
			const { SENDABLE } = StickerSendability.StickersSendabilityEnum;
			return ret !== SENDABLE ? SENDABLE : ret;
		}
	})
);

// MODULES-AUTO-LOADER:@Modules/Slider
var Slider_default = /* @__PURE__ */ (() => getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true }))();

// common/Components/Switch/index.jsx
var Switch_default = getMangled(Filters.bySource("auxiliaryContentPosition", "hasIcon"), {
	Switch: () => true
})?.Switch || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React_default.createElement("div", { style: { color: "#fff" } }, props.label, /* @__PURE__ */ React_default.createElement(
		"input", {
			type: "checkbox",
			checked: props.checked,
			onChange: (e) => props.onChange(e.target.checked)
		}
	));
};

// common/Components/Divider/styles.css
StylesLoader_default.push(`.divider-horizontal {
	border-top: thin solid var(--border-subtle);
	align-self: stretch;
	margin:var(--divider-gap) var(--divider-gutter) var(--divider-gap) var(--divider-gutter) ;
}

.divider-vertical {
	border-left: thin solid var(--border-subtle);
	align-self: stretch;
	margin:var(--divider-gutter) var(--divider-gap) var(--divider-gutter) var(--divider-gap);
}
`);

// common/Utils/css.js
function transform(...args) {
	const classNames = /* @__PURE__ */ new Set();
	for (const arg of args) {
		if (arg && typeof arg === "string") classNames.add(arg);
		else if (Array.isArray(arg)) arg.forEach((name) => classNames.add(name));
		else if (arg && typeof arg === "object") Object.entries(arg).forEach(([name, value]) => value && classNames.add(name));
	}
	return classNames;
}
var classNameFactory = (prefix = "", connector = "-") => (...args) => Array.from(transform(...args), (name) => `${prefix}${connector}${name}`).join(" ");

// common/Components/Divider/index.jsx
var c = classNameFactory("divider");

function Divider({ gap = 15, gutter = 0, direction = Divider.direction.HORIZONTAL }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { "--divider-gap": `${gap}px`, "--divider-gutter": `${gutter}%` },
			className: c("base", direction)
		}
	);
}
Divider.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ settingKey, note, border = false, onChange = nop, description, ...rest }) {
	const [val, set] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Switch_default, {
			...rest,
			hasIcon: true,
			checked: val,
			label: description || settingKey,
			description: note,
			onChange: (e) => {
				set(e);
				onChange?.(e);
			}
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, { gap: 15 }));
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
	width: 100%;
	justify-content: flex-start;
}

.fieldset-content.fieldset-horizontal {
	flex-direction: row;
}

.fieldset-content.fieldset-vertical {
	flex-direction: column;
}`);

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = /* @__PURE__ */ (() => getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true }))();

// common/Components/FieldSet/index.jsx
var c2 = classNameFactory("fieldset");

function FieldSet({ label, description, children, gap = 15, direction = FieldSet.direction.VERTICAL }) {
	return /* @__PURE__ */ React_default.createElement("fieldset", { className: c2("container") }, label && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c2("label"),
			tag: "legend",
			variant: "text-lg/medium"
		},
		label
	), description && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c2("description"),
			variant: "text-sm/normal",
			color: "text-secondary"
		},
		description
	), /* @__PURE__ */ React_default.createElement(
		"div", {
			className: c2("content", direction),
			style: { gap }
		},
		children
	));
}
FieldSet.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// src/SendStickersAsLinks/components/SettingComponent.jsx
var sizes = [80, 100, 128, 160];

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
			markers: sizes,
			minValue: sizes[0],
			maxValue: sizes[sizes.length - 1],
			initialValue: val,
			onValueChange: (e) => set(sizes.find((s) => e <= s) ?? sizes[sizes.length - 1])
		}
	);
}
var SettingComponent_default = () => {
	return /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [{
			border: true,
			settingKey: "sendDirectly",
			description: "Send Directly",
			note: "Send the sticker link in a message directly instead of putting it in the chat box."
		},
		{
			border: true,
			settingKey: "ignoreEmbedPermissions",
			description: "Ignore Embed Permissions",
			note: "Send sticker links regardless of embed permissions, meaning links will not turn into images."
		},
		{
			border: true,
			settingKey: "shouldSendAnimatedStickers",
			description: "Send animated stickers",
			note: "Animated stickers do not animate, sending them will only send the first picture of the animation. (still useful)"
		},
		{
			border: true,
			settingKey: "shouldHighlightAnimated",
			description: "Highlight animated stickers"
		}
	].map(SettingSwtich), /* @__PURE__ */ React_default.createElement(StickerSize, null));
};

// src/SendStickersAsLinks/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent_default, null);
module.exports = () => Plugin_default;
