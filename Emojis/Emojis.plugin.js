/**
 * @name Emojis
 * @description Send emoji as link if it can't be sent it normally.
 * @version 1.0.4
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Emojis
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Emojis/Emojis.plugin.js
 */

// config:@Config
var Config_default = {
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
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var UI = /* @__PURE__ */ (() => Api.UI)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var Data = /* @__PURE__ */ (() => Api.Data)();
var React = /* @__PURE__ */ (() => Api.React)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
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

// src/Emojis/styles.css
StylesLoader_default.push(`.emoji-manager-modal-root {
	max-height: 75vh;
	max-width: 80vw;
	overflow:hidden;
}

.emoji-manager-modal-content {
	margin-top: 10px;
	overflow:hidden;
}

.emoji-manager-emojis-list {
	max-height: 100%;
}

.emoji-manager-emoji-card {
	border-radius: 8px;
	padding: 5px;
	background: #353535;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 5px;
	height: 150px;
	position: relative;
}

.emoji-manager-btn-delete > button{
	background: #333 ;
	border:1px solid #555;
}

.emoji-manager-btn-delete {
	position: absolute;
	width: 24px;
	height: 24px;
	display: flex;
	top: 0;
	right: 0;
	translate: 50% -50%;
	opacity: 0;
	z-index: 999;
	color:rgb(241, 111, 108);
}

.emoji-manager-emoji-card-deleted .emoji-manager-btn-delete {
	color:rgb(111, 241,  108);
}

.emoji-manager-emoji-card:hover > .emoji-manager-btn-delete {
	opacity: 1;
}

.emoji-manager-emoji-img {
	flex: 1 0 0;
	border-radius: inherit;
	position: relative;
	margin:0 auto;
	max-width:100%;
	overflow:hidden;
}

.emoji-manager-emoji-card-animated .emoji-manager-emoji-img:before {
	content: "";
	border: 1px dashed orange;
	inset: 0;
	position: absolute;
}

.emoji-manager-emoji-card-deleted .emoji-manager-emoji-img:after {
	content: "";
	border: 1px dashed var(--text-danger);
	inset: 0;
	position: absolute;
	background:
		radial-gradient(circle at center, #000 1px, #fff0 1px) -1px -1px/ 4px 4px,
		radial-gradient(circle at center, #000 1px, #fff0 1px) 1px 1px/ 4px 4px;
}


.emoji-manager-emoji-img img {
	width: auto;
	height: 100%;
	border-radius: inherit;
}






/* ============== */
/*.CHAT .premiumPromo-1eKAIB {
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
}*/


`);

// common/React.jsx
var useState = /* @__PURE__ */ (() => React.useState)();
var useEffect = /* @__PURE__ */ (() => React.useEffect)();
var useRef = /* @__PURE__ */ (() => React.useRef)();
var React_default = /* @__PURE__ */ (() => React)();

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target) => target[type] && filter(target[type]);
}

function getModuleAndKey(filter, options) {
	let module2;
	const target = getModule((entry, m) => filter(entry) ? module2 = m : false, options);
	module2 = module2?.exports;
	if (!module2) return;
	const key = Object.keys(module2).find((k) => module2[k] === target);
	if (!key) return;
	return { module: module2, key };
}

// MODULES-AUTO-LOADER:@Modules/EmojiFunctions
var EmojiFunctions_default = getModule(Filters.byKeys("getEmojiUnavailableReason"), { searchExports: true });

// MODULES-AUTO-LOADER:@Enums/EmojiIntentionEnum
var EmojiIntentionEnum_default = getModule(Filters.byKeys("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true }) || {
	"CHAT": 3
};

// src/Emojis/patches/patchIsEmojiDisabled.js
Plugin_default.on(Events.START, () => {
	if (!EmojiFunctions_default?.isEmojiDisabled) return Logger_default.patchError("IsEmojiDisabled");
	Patcher.after(EmojiFunctions_default, "isEmojiDisabled", (_, [{ intention }], ret) => {
		if (intention !== EmojiIntentionEnum_default.CHAT) return ret;
		return false;
	});
});

// MODULES-AUTO-LOADER:@Stores/EmojiStore
var EmojiStore_default = getStore("EmojiStore");

// src/Emojis/EmojisManager.js
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
var savedEmojis = Data.load("emojis") || [];
var emojisMap = {
	rawEmojis: [...savedEmojis],
	parsedEmojis: [],
	indexMap: {}
};
for (let index = 0; index < savedEmojis.length; index++) {
	const emoji = savedEmojis[index];
	const [animated, name, id] = emoji.split(":");
	const parsedEmoji = buildEmojiObj({ animated, name, id });
	emojisMap.parsedEmojis.push(parsedEmoji);
	emojisMap.indexMap[id] = index;
}

function has(id) {
	return !!getById(id);
}

function getById(id) {
	return emojisMap.parsedEmojis[emojisMap.indexMap[id]];
}

function getByIndex(index) {
	return emojisMap.parsedEmojis[index];
}

function add({ animated, name, id }) {
	if (has(id)) return;
	const parsedEmoji = buildEmojiObj({ animated, name, id });
	emojisMap.rawEmojis.push(serializeEmoji({ animated, name, id }));
	emojisMap.parsedEmojis.push(parsedEmoji);
	emojisMap.indexMap[id] = emojisMap.parsedEmojis.length - 1;
}

function remove(id) {
	if (!has(id)) return;
	const index = emojisMap.indexMap[id];
	emojisMap.parsedEmojis.splice(index, 1, false);
	emojisMap.rawEmojis.splice(index, 1, false);
	delete emojisMap.indexMap[id];
}

function update(id, payload) {
	if (!has(id)) return;
	const index = emojisMap.indexMap[id];
	const oldEmoji = emojisMap.parsedEmojis[index];
	const updatedEmoji = Object.assign({}, oldEmoji, payload);
	emojisMap.parsedEmojis[index] = updatedEmoji;
	emojisMap.rawEmojis[index] = serializeEmoji(updatedEmoji);
}

function commit() {
	const cleaned = emojisMap.rawEmojis.filter(Boolean);
	emojisMap.rawEmojis = cleaned;
	emojisMap.parsedEmojis = [];
	for (let index = 0; index < cleaned.length; index++) {
		const emoji = cleaned[index];
		const [animated, name, id] = emoji.split(":");
		const parsedEmoji = buildEmojiObj({ animated, name, id });
		emojisMap.parsedEmojis.push(parsedEmoji);
		emojisMap.indexMap[id] = index;
	}
	Data.save("emojis", cleaned);
}
var EmojisManager = {
	_state: emojisMap,
	add,
	remove,
	commit,
	has,
	update,
	getById,
	getByIndex,
	emojis: emojisMap.parsedEmojis
};
var EmojisManager_default = EmojisManager;

// src/Emojis/patches/patchFavoriteEmojis.js
var emojiContextConstructor = EmojiStore_default?.getDisambiguatedEmojiContext?.().constructor;
Plugin_default.on(Events.START, () => {
	if (!emojiContextConstructor) return Logger_default.patchError("emojiContextConstructor");
	Patcher.after(emojiContextConstructor.prototype, "rebuildFavoriteEmojisWithoutFetchingLatest", (_, args, ret) => {
		if (!ret?.favorites) return;
		ret.favorites = [...ret.favorites, ...EmojisManager_default.emojis];
	});
	Patcher.after(emojiContextConstructor.prototype, "getDisambiguatedEmoji", (_, args, ret) => {
		return [...ret, ...EmojisManager_default.emojis];
	});
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
function clsx(prefix) {
	return (...args) => args.filter(Boolean).map((a) => `${prefix}-${a}`).join(" ");
}

function getNestedProp(obj, path2) {
	return path2.split(".").reduce((ob, prop) => ob?.[prop], obj);
}
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

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = getStore("SelectedChannelStore");

// MODULES-AUTO-LOADER:@Stores/ChannelStore
var ChannelStore_default = getStore("ChannelStore");

// MODULES-AUTO-LOADER:@Modules/MessageActions
var MessageActions_default = getModule(Filters.byKeys("jumpToMessage", "_sendMessage"), { searchExports: false });

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: false });

// MODULES-AUTO-LOADER:@Stores/PendingReplyStore
var PendingReplyStore_default = getStore("PendingReplyStore");

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

// MODULES-AUTO-LOADER:@Modules/DiscordPermissions
var DiscordPermissions_default = getModule(Filters.byKeys("computePermissions"), { searchExports: false });

// MODULES-AUTO-LOADER:@Enums/DiscordPermissionsEnum
var DiscordPermissionsEnum_default = getModule(Filters.byKeys("ADD_REACTIONS"), { searchExports: true }) || {
	"EMBED_LINKS": "16384n",
	"USE_EXTERNAL_EMOJIS": "262144n"
};

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = getStore("UserStore");

// MODULES-AUTO-LOADER:@Stores/DraftStore
var DraftStore_default = getStore("DraftStore");

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

// src/Emojis/Utils.js
function getCustomEmojiById(id) {
	const emoji = EmojiStore_default.getCustomEmojiById(id);
	if (emoji) return emoji;
	const savedEmojis2 = Data.load("emojis");
	return savedEmojis2.find((a) => a.id === id);
}

function getEmojiUrl(id) {
	const { animated } = getCustomEmojiById(id) || { animated: false };
	const size = Settings_default.state.emojiSize;
	const asPng = Settings_default.state.sendEmojiAsPng;
	const type = animated ? asPng ? "png" : "gif" : "png";
	return `https://cdn.discordapp.com/emojis/${id}.${type}${animated && !asPng ? "" : `?size=${size}`}`;
}

function sendEmojiAsLink(content, channel) {
	if (!channel) channel = ChannelStore_default.getChannel(SelectedChannelStore_default.getChannelId());
	const draft = DraftStore_default.getDraft(channel.id, 0);
	if (draft) return insertText(`[\u{E01EB}](${content})`);
	if (Settings_default.state.sendDirectly) {
		try {
			return sendMessageDirectly(channel, content);
		} catch {
			Toast_default.error("Could not send directly.");
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

// src/Emojis/patches/patchExpressionPickerEmojiContextMenu.jsx
var bbb = getModule(Filters.byStrings("unfavorite"), { defaultExport: false });
Plugin_default.on(Events.START, () => {
	if (!bbb?.Z) return Logger_default.patchError("patchUnfavoriteEmoji");
	Patcher.after(bbb, "Z", (_, args, ret) => {
		const [{ type, isInExpressionPicker, id }] = args;
		if (type !== "emoji" || !isInExpressionPicker || !id) return;
		return [
			// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
			/* @__PURE__ */
			React.createElement(
				ContextMenu.Item, {
					action: () => sendEmojiDirectly(id),
					id: "send-directly",
					label: "send directly"
				}
			),
			// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
			/* @__PURE__ */
			React.createElement(
				ContextMenu.Item, {
					action: () => insertEmoji(id),
					id: "insert-url",
					label: "insert url"
				}
			),
			ret
		];
	});
});

// src/Emojis/patches/patchUseEmojiGrid.js
var emojiHooks = getModuleAndKey(Filters.byStrings("gridWidth", "getDisambiguatedEmojiContext", "getFlattenedGuildIds"), { searchExports: true });
Plugin_default.on(Events.START, () => {
	const { module: module2, key } = emojiHooks;
	if (!module2 || !key) return Logger_default.patchError("patchUseEmojiGrid");
	Patcher.after(module2, key, (_, [{ pickerIntention }], ret) => {
		if (pickerIntention !== EmojiIntentionEnum_default.CHAT) return ret;
		for (const a of ret.sectionDescriptors) {
			a.isNitroLocked = false;
		}
	});
});

// common/Components/Flex/index.jsx
var Flex_default = getModule(Filters.byKeys("Child", "Align", "Justify"));

// MODULES-AUTO-LOADER:@Modules/Button
var Button_default = getModule((a) => a && a.Link && a.Colors, { searchExports: true });

// common/Components/Button/index.jsx
function ButtonComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("button", { ...props });
}
var ManaButton = /* @__PURE__ */ getModule(Filters.byStrings(`"data-mana-component":"button"`), { searchExports: true }) || ButtonComponentFallback;
var ManaTextButton = /* @__PURE__ */ getModule(Filters.byStrings(`"data-mana-component":"text-button"`), { searchExports: true }) || ButtonComponentFallback;

// common/Components/icon/index.jsx
function svg(svgProps, ...paths) {
	return (comProps) => (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		/* @__PURE__ */
		React_default.createElement(
			"svg", {
				fill: "currentColor",
				width: "24",
				height: "24",
				viewBox: "0 0 24 24",
				...svgProps,
				...comProps
			},
			paths.map((p) => typeof p === "string" ? /* @__PURE__ */ path(null, p) : p)
		)
	);
}

function path(props, d) {
	return /* @__PURE__ */ React_default.createElement(
		"path", {
			...props,
			d
		}
	);
}
var SettingIcon = /* @__PURE__ */ svg(
	null,
	"M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
);
var UndoIcon = /* @__PURE__ */ svg(null, "M4 12a8 8 0 0 1 14.93-4H15a1 1 0 1 0 0 2h6a1 1 0 0 0 1-1V3a1 1 0 1 0-2 0v3a9.98 9.98 0 0 0-18 6 10 10 0 0 0 16.29 7.78 1 1 0 0 0-1.26-1.56A8 8 0 0 1 4 12Z");
var TrashBinIcon = /* @__PURE__ */ svg(null, "M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z", /* @__PURE__ */ path({ fillRule: "evenodd", "clip-rule": "evenodd" }, "M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"));

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

// common/Components/TextInput/index.jsx
var TextInput = getModule(Filters.byStrings("showCharacterCount", "clearable"), { searchExports: true });
var TextInput_default = TextInput || function TextInputFallback(props) {
	return /* @__PURE__ */ React_default.createElement("div", { style: { color: "#fff" } }, /* @__PURE__ */ React_default.createElement(
		"input", {
			...props,
			type: "text",
			onChange: (e) => props.onChange?.(e.target.value)
		}
	));
};

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary = class extends React_default.Component {
	state = { hasError: false, error: null, info: null };
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `
	${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${Config_default?.info?.name || "Unknown Plugin"}] %cthrew an exception at %c[${this.props.id}]
`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}
	renderErrorBoundary() {
		return /* @__PURE__ */ React_default.createElement("div", { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" } }, /* @__PURE__ */ React_default.createElement("b", { style: { color: "#e0e1e5" } }, "An error has occured while rendering ", /* @__PURE__ */ React_default.createElement("span", { style: { color: "orange" } }, this.props.id)));
	}
	renderFallback() {
		if (React_default.isValidElement(this.props.fallback)) {
			if (this.props.passMetaProps)
				this.props.fallback.props = {
					id: this.props.id,
					plugin: Config_default?.info?.name || "Unknown Plugin",
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return /* @__PURE__ */ React_default.createElement(
			this.props.fallback, {
				id: this.props.id,
				plugin: Config_default?.info?.name || "Unknown Plugin"
			}
		);
	}
	render() {
		if (!this.state.hasError) return this.props.children;
		return this.props.fallback ? this.renderFallback() : this.renderErrorBoundary();
	}
};

// common/Components/GridScroller/index.jsx
var GridScroller = getModule(reactRefMemoFilter("render", "columns", "getSectionHeight"), { searchExports: true });
var GridScroller_default = GridScroller || function GridScrollerFallback(props) {
	return /* @__PURE__ */ React_default.createElement("div", { ...props });
};

// common/Utils/Modals/styles.css
StylesLoader_default.push(`.transparent-background.transparent-background{
	background: transparent;
	border:unset;
}`);

// common/Utils/Modals/index.jsx
var ModalActions = /* @__PURE__ */ getMangled("onCloseRequest:null!=", {
	openModal: /* @__PURE__ */ Filters.byStrings("onCloseRequest:null!="),
	closeModal: /* @__PURE__ */ Filters.byStrings(".setState", ".getState()["),
	ModalStore: /* @__PURE__ */ Filters.byKeys("getState")
});
var Modals = /* @__PURE__ */ getMangled( /* @__PURE__ */ Filters.bySource("root", "headerIdIsManaged"), {
	ModalRoot: /* @__PURE__ */ Filters.byStrings("rootWithShadow"),
	ModalFooter: /* @__PURE__ */ Filters.byStrings(".footer"),
	ModalContent: /* @__PURE__ */ Filters.byStrings(".content"),
	ModalHeader: /* @__PURE__ */ Filters.byStrings(".header", "separator"),
	Animations: (a) => a.SUBTLE,
	Sizes: (a) => a.DYNAMIC,
	ModalCloseButton: Filters.byStrings(".close]:")
});

// src/Emojis/components/EmojiManager.jsx
var c = clsx("emoji-manager");

function getEmojiUrl2(id, animated = false, size = 48) {
	const type = animated ? "gif" : "png";
	return `https://cdn.discordapp.com/emojis/${id}.${type}?size=${size}`;
}

function EmojiManagerComponent({ emojis, modalProps }) {
	const state = useRef({});
	const changeHandler = (emoji) => {
		state.current[emoji.id] = emoji;
	};
	const saveHandler = () => {
		Object.keys(state.current).forEach((id) => {
			const { name, deleted } = state.current[id];
			if (deleted) return EmojisManager_default.remove(id);
			if (name) return EmojisManager_default.update(id, { name });
		});
		EmojisManager_default.commit();
		modalProps.onClose();
	};
	return /* @__PURE__ */ React_default.createElement(
		Modals.ModalRoot, {
			...modalProps,
			size: "dynamic",
			fullscreenOnMobile: false,
			className: c("modal-root")
		},
		/* @__PURE__ */
		React_default.createElement(Modals.ModalHeader, { separator: true }, /* @__PURE__ */ React_default.createElement(
			Heading_default, {
				variant: "heading-lg/semibold",
				style: { flexGrow: 1 }
			},
			"EmojiManager"
		), /* @__PURE__ */ React_default.createElement(Modals.ModalCloseButton, { onClick: modalProps.onClose })),
		/* @__PURE__ */
		React_default.createElement("div", { className: c("modal-content") }, /* @__PURE__ */ React_default.createElement(
			EmojisList, {
				emojis,
				onChange: changeHandler
			}
		)),
		/* @__PURE__ */
		React_default.createElement(Modals.ModalFooter, { separator: true }, /* @__PURE__ */ React_default.createElement(
			Flex_default, {
				style: { gap: 8 },
				align: Flex_default.Align.CENTER,
				justify: Flex_default.Justify.END
			},
			/* @__PURE__ */
			React_default.createElement(
				ManaTextButton, {
					text: "Cancel",
					onClick: modalProps.onClose
				}
			),
			/* @__PURE__ */
			React_default.createElement(
				ManaButton, {
					size: "sm",
					text: "Save",
					onClick: saveHandler
				}
			)
		))
	);
}
var desiredColumns = 6;
var desiredItemWidth = 130;
var gap = 20;

function getColNumberFromWidth(width, itemWidth, maxColumns) {
	return Math.min(Math.max(Math.floor(width / itemWidth), 1), maxColumns);
}

function EmojisList({ emojis, onChange }) {
	const [width, setWidth] = useState(window.innerWidth * 0.8);
	const columns = getColNumberFromWidth(width - gap * (desiredColumns - 1), desiredItemWidth, desiredColumns);
	useEffect(() => {
		function resize() {
			setWidth(window.innerWidth * 0.8);
		}
		window.addEventListener("resize", resize);
		return () => window.removeEventListener("resize", resize);
	}, []);
	return /* @__PURE__ */ React_default.createElement(
		GridScroller_default, {
			style: { width },
			className: c("emojis-list"),
			columns,
			itemGutter: gap,
			removeEdgeItemGutters: true,
			getItemKey: (_, index) => emojis[index].id,
			sections: [emojis.length],
			getItemHeight: () => 150,
			renderItem: (_, index, style) => {
				const emoji = emojis[index];
				return /* @__PURE__ */ React_default.createElement(
					EmojiCard, {
						onChange,
						style,
						key: emoji.id,
						...emoji
					}
				);
			}
		}
	);
}

function EmojiCard({ animated, name, id, style, onChange }) {
	const [val, setValue] = useState(name);
	const [hover, setHover] = useState(false);
	const [deleteEmoji, setDeleteEmoji] = useState(false);
	const changeHandler = (name2) => {
		setValue(name2);
		if (name2.length < 3) return;
		onChange({ id, name: name2 });
	};
	const deleteHandler = () => {
		const del = !deleteEmoji;
		setDeleteEmoji(del);
		onChange({ id, deleted: del });
	};
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style,
			className: c("emoji-card", deleteEmoji && "emoji-card-deleted", animated && "emoji-card-animated")
		},
		/* @__PURE__ */
		React_default.createElement("div", { className: c("emoji-img"), onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) }, /* @__PURE__ */ React_default.createElement(
			"img", {
				alt: name,
				src: getEmojiUrl2(id, hover && animated, 80)
			}
		)),
		/* @__PURE__ */
		React_default.createElement(
			TextInput_default, {
				maxLength: 32,
				size: "sm",
				disabled: deleteEmoji,
				onChange: changeHandler,
				value: val
			}
		),
		/* @__PURE__ */
		React_default.createElement("div", { className: c("btn-delete") }, /* @__PURE__ */ React_default.createElement(
			ManaButton, {
				onClick: deleteHandler,
				fullWidth: true,
				size: "sm",
				variant: "",
				icon: () => deleteEmoji ? /* @__PURE__ */ React_default.createElement(
					UndoIcon, {
						width: "18",
						height: "18"
					}
				) : /* @__PURE__ */ React_default.createElement(
					TrashBinIcon, {
						width: "18",
						height: "18"
					}
				)
			}
		))
	);
}

function openEmojiManager() {
	ModalActions.openModal((e) => /* @__PURE__ */ React_default.createElement(ErrorBoundary, null, /* @__PURE__ */ React_default.createElement(
		EmojiManagerComponent, {
			modalProps: e,
			emojis: EmojisManager_default.emojis
		}
	)));
}

// MODULES-AUTO-LOADER:@Modules/Tooltip
var Tooltip_default = getModule(Filters.byPrototypeKeys("renderTooltip"), { searchExports: true });

// common/Components/Tooltip/index.jsx
var Tooltip_default2 = ({ note, position, children }) => {
	return /* @__PURE__ */ React.createElement(
		Tooltip_default, {
			text: note,
			position: position || "top"
		},
		(props) => React.cloneElement(children, {
			...props,
			...children.props
		})
	);
};

// src/Emojis/patches/patchEmojiPickerHeader.jsx
var EmojiPickerHeader = getModuleAndKey(Filters.byStrings("selectedSurrogate"));
Plugin_default.on(Events.START, () => {
	const { module: module2, key } = EmojiPickerHeader;
	if (!module2 || !key) return Logger_default.patchError("patchEmojiPickerHeader");
	Patcher.after(module2, key, (_, args, ret) => {
		const children = getNestedProp(ret, "props.children.props.children");
		if (!children || !Array.isArray(children)) return;
		children.push(
			/* @__PURE__ */
			React_default.createElement(Tooltip_default2, { note: "Emoji settings" }, /* @__PURE__ */ React_default.createElement(
				ManaButton, {
					onClick: openEmojiManager,
					variant: "icon-only",
					size: "sm",
					icon: () => /* @__PURE__ */ React_default.createElement(
						SettingIcon, {
							width: "20",
							height: "20"
						}
					)
				}
			))
		);
	});
});

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

// MODULES-AUTO-LOADER:@Modules/Slider
var Slider_default = getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true });

// src/Emojis/components/SettingComponent.jsx
var SettingComponent_default = () => {
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, [{
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
	].map(SettingSwtich), /* @__PURE__ */ React_default.createElement(StickerSize, null));
};
var emojiSizes = [48, 56, 60, 64, 80, 96, 100, 128, 160, 240, 256, 300];

function StickerSize() {
	const [val, set] = Settings_default.useSetting("emojiSize");
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			style: { marginBottom: 20 },
			tag: "h5"
		},
		"Emoji Size"
	), /* @__PURE__ */ React_default.createElement(
		Slider_default, {
			className: "emojiSizeSlider",
			stickToMarkers: true,
			sortedMarkers: true,
			equidistant: true,
			markers: emojiSizes,
			minValue: emojiSizes[0],
			maxValue: emojiSizes[emojiSizes.length - 1],
			initialValue: val,
			onValueChange: (e) => set(emojiSizes.find((s) => e <= s) ?? emojiSizes[emojiSizes.length - 1])
		}
	), /* @__PURE__ */ React_default.createElement(Heading_default, { variant: "text-sm/normal" }, "The size of the Emoji in pixels"));
}

// src/Emojis/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent_default, null);
Plugin_default.on(Events.STOP, () => {
	Patcher.unpatchAll();
});
module.exports = () => Plugin_default;
