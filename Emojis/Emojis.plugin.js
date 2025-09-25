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
var Filters2 = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function reactRefMemoFilter(type, ...args) {
	const filter = Filters2.byStrings(...args);
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
var EmojiFunctions_default = getModule(Filters2.byKeys("getEmojiUnavailableReason"), { searchExports: true });

// MODULES-AUTO-LOADER:@Enums/EmojiIntentionEnum
var EmojiIntentionEnum_default = getModule(Filters2.byKeys("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true }) || {
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
var { zustand } = getMangled(Filters2.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters2.byStrings("subscribe"),
	zustand: () => true
});
var subscribeWithSelector = getModule(Filters2.byStrings("equalityFn", "fireImmediately"), { searchExports: true });
var zustand_default = zustand;

// common/Utils/Settings.js
var SettingsStoreSelectors = {};
var persistMiddleware = (config) => (set, get, api) => config((args) => (set(args), Data.save("settings", get().getRawState())), get, api);
var SettingsStore = Object.assign(
	zustand_default(
		persistMiddleware(
			subscribeWithSelector((set, get) => {
				const settingsObj = /* @__PURE__ */ Object.create(null);
				for (const [key, value] of Object.entries({
						...Config_default.settings,
						...Data.load("settings")
					})) {
					settingsObj[key] = value;
					settingsObj[`set${key}`] = (newValue) => set({
						[key]: newValue });
					SettingsStoreSelectors[key] = (state) => state[key];
				}
				settingsObj.getRawState = () => {
					return Object.entries(get()).filter(([, val]) => typeof val !== "function").reduce((acc, [key, val]) => {
						acc[key] = val;
						return acc;
					}, {});
				};
				return settingsObj;
			})
		)
	), {
		useSetting: function(key) {
			return this((state) => [state[key], state[`set${key}`]]);
		},
		selectors: SettingsStoreSelectors
	}
);
Object.defineProperty(SettingsStore, "state", {
	configurable: false,
	get() {
		return this.getState();
	}
});
var Settings_default = SettingsStore;

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = getStore("SelectedChannelStore");

// MODULES-AUTO-LOADER:@Stores/ChannelStore
var ChannelStore_default = getStore("ChannelStore");

// MODULES-AUTO-LOADER:@Modules/MessageActions
var MessageActions_default = getModule(Filters2.byKeys("jumpToMessage", "_sendMessage"), { searchExports: false });

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters2.byKeys("dispatch", "_dispatch"), { searchExports: false });

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

function sendMessageDirectly(channel, content) {
	if (!MessageActions_default || !MessageActions_default.sendMessage || typeof MessageActions_default.sendMessage !== "function") throw new Error("Can't send message directly.");
	return MessageActions_default.sendMessage(
		channel.id, {
			validNonShortcutEmojis: [],
			content
		},
		void 0,
		getReply(channel.id)
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
var DiscordPermissions_default = getModule(Filters2.byKeys("computePermissions"), { searchExports: false });

// MODULES-AUTO-LOADER:@Enums/DiscordPermissionsEnum
var DiscordPermissionsEnum_default = getModule(Filters2.byKeys("ADD_REACTIONS"), { searchExports: true }) || {
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
var bbb = getModule(Filters2.byStrings("unfavorite"), { defaultExport: false });
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
var emojiHooks = getModuleAndKey(Filters2.byStrings("gridWidth", "getDisambiguatedEmojiContext", "getFlattenedGuildIds"), { searchExports: true });
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

// common/Utils/index.js
function clsx(prefix) {
	return (...args) => args.filter(Boolean).map((a) => `${prefix}-${a}`).join(" ");
}

function getNestedProp(obj, path2) {
	return path2.split(".").reduce((ob, prop) => ob?.[prop], obj);
}
var nop = () => {};

// common/Components/Flex/index.jsx
var Flex_default = getModule(Filters2.byKeys("Child", "Align", "Justify"));

// MODULES-AUTO-LOADER:@Modules/Button
var Button_default = getModule((a) => a && a.Link && a.Colors, { searchExports: true });

// common/Components/Button/index.jsx
function ButtonComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("button", { ...props });
}
var ManaButton = /* @__PURE__ */ getModule(Filters2.byStrings(`"data-mana-component":"button"`), { searchExports: true }) || ButtonComponentFallback;
var ManaTextButton = /* @__PURE__ */ getModule(Filters2.byStrings(`"data-mana-component":"text-button"`), { searchExports: true }) || ButtonComponentFallback;

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
			paths.map((p) => typeof p === "string" ? path(null, p) : p)
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
var BookmarkIconPath = "M17 4H7a1 1 0 0 0-1 1v13.74l3.99-3.61a3 3 0 0 1 4.02 0l3.99 3.6V5a1 1 0 0 0-1-1ZM7 2a3 3 0 0 0-3 3v16a1 1 0 0 0 1.67.74l5.66-5.13a1 1 0 0 1 1.34 0l5.66 5.13a1 1 0 0 0 1.67-.75V5a3 3 0 0 0-3-3H7Z";
var BookmarkOutlinedIcon = svg(null, path({ fillRule: "evenodd" }, BookmarkIconPath));
var BookmarkFilledIcon = svg(null, path({ fillRule: "" }, BookmarkIconPath));
var AddToQueueIcon = svg({ viewBox: "-1 -1 18 18" }, "M16 15H2v-1.5h14V15zm0-4.5H2V9h14v1.5zm-8.034-6A5.484 5.484 0 0 1 7.187 6H13.5a2.5 2.5 0 0 0 0-5H7.966c.159.474.255.978.278 1.5H13.5a1 1 0 1 1 0 2H7.966zM2 2V0h1.5v2h2v1.5h-2v2H2v-2H0V2h2z");
var ArrowIcon = svg(null, "M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z");
var CloseIcon = svg(null, "M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z");
var CopyIcon = svg(null, "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z", "M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z");
var DuplicateIcon = svg(null, "M4 5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v.18a1 1 0 1 0 2 0V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h.18a1 1 0 1 0 0-2H5a1 1 0 0 1-1-1V5Z", "M8 11a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3v-8Zm2 0a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-8Z");
var EmbedIcon = svg({ viewBox: "0 0 122.88 91.26" },
	"M8.32,0H114.56a8.34,8.34,0,0,1,8.32,8.32V82.94a8.35,8.35,0,0,1-8.32,8.32H8.32A8.35,8.35,0,0,1,0,82.94V8.32A8.34,8.34,0,0,1,8.32,0ZM88.8,54.44a2.36,2.36,0,0,1,4.6,1.07L88.28,77.44a2.36,2.36,0,0,1-4.6-1.07L88.8,54.44ZM16.18,73.22a2.66,2.66,0,0,1,0-5.32h25a2.66,2.66,0,1,1,0,5.32Zm0-16.61a2.66,2.66,0,0,1,0-5.32H59.62a2.66,2.66,0,1,1,0,5.32Zm0-16.61a2.66,2.66,0,0,1,0-5.32H85A2.66,2.66,0,0,1,85,40Zm64.6,32a2.36,2.36,0,0,1-3.1,3.55l-9-7.85a2.35,2.35,0,0,1-.22-3.32,1.67,1.67,0,0,1,.23-.23l9-7.84a2.35,2.35,0,0,1,3.1,3.54l-6.93,6.08L80.78,72ZM100,75.56A2.36,2.36,0,0,1,96.9,72l6.93-6.07L96.9,59.86a2.35,2.35,0,1,1,3.1-3.54l9,7.84a1.67,1.67,0,0,1,.23.23,2.35,2.35,0,0,1-.22,3.32l-9,7.85Zm18-52.27H5.29V83.75A2.26,2.26,0,0,0,6,85.38a2.28,2.28,0,0,0,1.63.67h108a2.28,2.28,0,0,0,1.63-.67,2.26,2.26,0,0,0,.67-1.63V23.29ZM106.64,9.35a4.11,4.11,0,1,1-4.1,4.11,4.11,4.11,0,0,1,4.1-4.11Zm-27.84,0a4.11,4.11,0,1,1-4.11,4.11A4.11,4.11,0,0,1,78.8,9.35Zm13.92,0a4.11,4.11,0,1,1-4.11,4.11,4.11,4.11,0,0,1,4.11-4.11Z"
);
var ExternalLinkIcon = svg({ viewBox: "0 0 16 16" }, "M1 2.75A.75.75 0 0 1 1.75 2H7v1.5H2.5v11h10.219V9h1.5v6.25a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75V2.75z", "M15 1v4.993a.75.75 0 1 1-1.5 0V3.56L8.78 8.28a.75.75 0 0 1-1.06-1.06l4.72-4.72h-2.433a.75.75 0 0 1 0-1.5H15z");
var FavoriteIcon = svg(null, "M16 4.00098C14.406 4.00098 12.93 4.83798 12 6.08098C11.07 4.83798 9.594 4.00098 8 4.00098C5.243 4.00098 3 6.24398 3 9.00098C3 14.492 11.124 19.633 11.471 19.849C11.633 19.95 11.817 20.001 12 20.001C12.183 20.001 12.367 19.95 12.529 19.849C12.876 19.633 21 14.492 21 9.00098C21 6.24398 18.757 4.00098 16 4.00098Z");
var ImageIcon = svg({ viewBox: "-50 -50 484 484" }, "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z");
var LightiningIcon = svg(null, "M7.65 21.75a1 1 0 0 0 1.64.96l11.24-9.96a1 1 0 0 0-.66-1.75h-4.81a.5.5 0 0 1-.5-.6l1.79-8.15a1 1 0 0 0-1.64-.96L3.47 11.25A1 1 0 0 0 4.13 13h4.81c.32 0 .56.3.5.6l-1.79 8.15Z");
var ListenAlongIcon = svg(null, "M11.8 14a6.1 6.1 0 0 0 0 6H3v-2c0-2.7 5.3-4 8-4h.8zm-.8-2c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm6 1c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm-1 6.2l3-2.2-3-2.2v4.4z");
var ListenIcon = svg(null, "M22 16.53C22 18.3282 20.2485 19.7837 18.089 19.7837C15.9285 19.7837 14.5396 18.3277 14.5396 16.53C14.5396 14.7319 15.9286 13.2746 18.089 13.2746C18.7169 13.2746 19.3089 13.4013 19.8353 13.6205V5.814L9.46075 7.32352V18.7449C9.46075 20.5424 7.70957 22 5.54941 22C3.38871 22 2 20.5443 2 18.7456C2 16.9481 3.3892 15.4898 5.54941 15.4898C6.17823 15.4898 6.76966 15.6162 7.29604 15.836C7.29604 11.3608 7.29604 8.5366 7.29604 4.1395L21.9996 2L22 16.53Z");
var MuteVolumeIcon = svg({ viewBox: "0 0 16 16" }, "M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z", "M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z");
var NextIcon = svg({ viewBox: "0 0 16 16" }, "M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z");
var PauseIcon = svg({ viewBox: "0 0 16 16" }, "M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z");
var PinIcon = svg(null, "M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5 0 0 0-.7 0l-.03.03a3 3 0 0 0 0 4.24L13 5l-2.92 2.92-3.65-.34a2 2 0 0 0-1.6.58l-.62.63a1 1 0 0 0 0 1.42l9.58 9.58a1 1 0 0 0 1.42 0l.63-.63a2 2 0 0 0 .58-1.6l-.34-3.64L19 11l.38.38ZM9.07 17.07a.5.5 0 0 1-.08.77l-5.15 3.43a.5.5 0 0 1-.63-.06l-.42-.42a.5.5 0 0 1-.06-.63L6.16 15a.5.5 0 0 1 .77-.08l2.14 2.14Z");
var PlayIcon = svg({ viewBox: "0 0 16 16" }, "M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z");
var PlusIcon = svg(null, "M13 5a1 1 0 1 0-2 0v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2h-6V5Z");
var PreviousIcon = svg({ viewBox: "0 0 16 16" }, "M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z");
var RepeatPath = "M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z";
var RepeatIcon = svg({ viewBox: "0 0 16 16" }, RepeatPath);
var RepeatOneIcon = svg({ viewBox: "0 0 16 16" }, RepeatPath, "M9.12 8V1H7.787c-.128.72-.76 1.293-1.787 1.313V3.36h1.57V8h1.55z");
var ShareIcon = svg(null, "M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z");
var ShuffleIcon = svg({ viewBox: "0 0 16 16" }, "M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z", "m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z");
var SpotifyIcon = svg(
	null,
	"M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2ZM16.5625 16.4375C16.3791 16.7161 16.0145 16.8107 15.7188 16.6562C13.375 15.2188 10.4062 14.9062 6.9375 15.6875C6.71979 15.7377 6.49182 15.668 6.33945 15.5046C6.18709 15.3412 6.13348 15.1089 6.19883 14.8952C6.26417 14.6816 6.43854 14.519 6.65625 14.4688C10.4688 13.5938 13.7188 13.9688 16.375 15.5938C16.5149 15.6781 16.6141 15.816 16.6495 15.9755C16.685 16.1349 16.6535 16.3019 16.5625 16.4375ZM17.8125 13.6875C17.7053 13.8622 17.5328 13.9869 17.3333 14.0338C17.1338 14.0807 16.9238 14.0461 16.75 13.9375C14.0625 12.2812 9.96875 11.8125 6.78125 12.7812C6.5133 12.8594 6.22401 12.7887 6.02236 12.5957C5.8207 12.4027 5.73731 12.1168 5.80361 11.8457C5.8699 11.5746 6.0758 11.3594 6.34375 11.2812C9.96875 10.1875 14.5 10.7188 17.5625 12.625C17.9134 12.8575 18.0229 13.3229 17.8125 13.6875ZM17.9062 10.875C14.6875 8.96875 9.375 8.78125 6.28125 9.71875C5.81691 9.79284 5.36952 9.5115 5.23513 9.0609C5.10074 8.61031 5.32093 8.12986 5.75 7.9375C9.28125 6.875 15.1562 7.0625 18.875 9.28125C19.0893 9.40709 19.2434 9.61436 19.3023 9.85577C19.3612 10.0972 19.3198 10.3521 19.1875 10.5625C18.9054 10.9822 18.3499 11.1177 17.9062 10.875Z"
);
var VectorIcon = svg(null, "M20.7 12.7a1 1 0 0 0 0-1.4l-5-5a1 1 0 1 0-1.4 1.4l3.29 3.3H4a1 1 0 1 0 0 2h13.59l-3.3 3.3a1 1 0 0 0 1.42 1.4l5-5Z");
var VolumeIcon = svg({ viewBox: "0 0 16 16" }, "M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z", "M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z");
var DiscordIcon = svg(null, "M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a18.43 18.43 0 0 0 5.63 2.87c.46-.62.86-1.28 1.2-1.98-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.7 1.7 11.28 0l.46.37c-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.47-4.87-.78-9.09-3.3-12.83ZM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27Zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27Z");
var ErrorIcon = svg(null, path({ fill: "none" }, "M0 0h24v24H0z"), "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z");
var ServersIcon = svg(null, "M10.55 4.4c.13-.24.1-.54-.12-.71L8.6 2.24a1 1 0 0 0-1.24 0l-4 3.15a1 1 0 0 0-.38.79v4.03c0 .43.5.66.82.39l2.28-1.9a3 3 0 0 1 3.84 0c.03.02.08 0 .08-.04V6.42a4 4 0 0 1 .55-2.02ZM7.36 10.23a1 1 0 0 1 1.28 0l1.18.99 2.98 2.48 1.84 1.53a1 1 0 0 1-.67 1.77.1.1 0 0 0-.1.09l-.23 3.06a2 2 0 0 1-2 1.85H4.36a2 2 0 0 1-2-1.85l-.24-3.16a1 1 0 0 1-.76-1.76l6-5Z", "M12 10.2c0 .14.07.28.18.38l3.74 3.12a3 3 0 0 1 .03 4.58.55.55 0 0 0-.2.37l-.12 1.65a4 4 0 0 1-.17.9c-.12.38.13.8.52.8H20a2 2 0 0 0 2-2V3.61a1.5 1.5 0 0 0-2-1.41l-6.66 2.33A2 2 0 0 0 12 6.42");
var QuestsIcon = svg(null, "M7.5 21.7a8.95 8.95 0 0 1 9 0 1 1 0 0 0 1-1.73c-.6-.35-1.24-.64-1.9-.87.54-.3 1.05-.65 1.52-1.07a3.98 3.98 0 0 0 5.49-1.8.77.77 0 0 0-.24-.95 3.98 3.98 0 0 0-2.02-.76A4 4 0 0 0 23 10.47a.76.76 0 0 0-.71-.71 4.06 4.06 0 0 0-1.6.22 3.99 3.99 0 0 0 .54-5.35.77.77 0 0 0-.95-.24c-.75.36-1.37.95-1.77 1.67V6a4 4 0 0 0-4.9-3.9.77.77 0 0 0-.6.72 4 4 0 0 0 3.7 4.17c.89 1.3 1.3 2.95 1.3 4.51 0 3.66-2.75 6.5-6 6.5s-6-2.84-6-6.5c0-1.56.41-3.21 1.3-4.51A4 4 0 0 0 11 2.82a.77.77 0 0 0-.6-.72 4.01 4.01 0 0 0-4.9 3.96A4.02 4.02 0 0 0 3.73 4.4a.77.77 0 0 0-.95.24 3.98 3.98 0 0 0 .55 5.35 4 4 0 0 0-1.6-.22.76.76 0 0 0-.72.71l-.01.28a4 4 0 0 0 2.65 3.77c-.75.06-1.45.33-2.02.76-.3.22-.4.62-.24.95a4 4 0 0 0 5.49 1.8c.47.42.98.78 1.53 1.07-.67.23-1.3.52-1.91.87a1 1 0 1 0 1 1.73Z");
var AppsIcon = svg(null, path({ "fill-rule": "evenodd", "clip-rule": "evenodd" }, "M20.97 4.06c0 .18.08.35.24.43.55.28.9.82 1.04 1.42.3 1.24.75 3.7.75 7.09v4.91a3.09 3.09 0 0 1-5.85 1.38l-1.76-3.51a1.09 1.09 0 0 0-1.23-.55c-.57.13-1.36.27-2.16.27s-1.6-.14-2.16-.27c-.49-.11-1 .1-1.23.55l-1.76 3.51A3.09 3.09 0 0 1 1 17.91V13c0-3.38.46-5.85.75-7.1.15-.6.49-1.13 1.04-1.4a.47.47 0 0 0 .24-.44c0-.7.48-1.32 1.2-1.47l2.93-.62c.5-.1 1 .06 1.36.4.35.34.78.71 1.28.68a42.4 42.4 0 0 1 4.4 0c.5.03.93-.34 1.28-.69.35-.33.86-.5 1.36-.39l2.94.62c.7.15 1.19.78 1.19 1.47ZM20 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM5 7a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2H7v1a1 1 0 1 1-2 0v-1H4a1 1 0 1 1 0-2h1V7Z"));
var SettingIcon = svg(
	null,
	"M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
);
var PenIcon2 = svg(null, "m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0 0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0 1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5 1.5 0 0 1-1.73-1.73Z");
var UndoIcon = svg(null, "M4 12a8 8 0 0 1 14.93-4H15a1 1 0 1 0 0 2h6a1 1 0 0 0 1-1V3a1 1 0 1 0-2 0v3a9.98 9.98 0 0 0-18 6 10 10 0 0 0 16.29 7.78 1 1 0 0 0-1.26-1.56A8 8 0 0 1 4 12Z");
var TrashBinIcon = svg(null, "M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z", path({ fillRule: "evenodd", "clip-rule": "evenodd" }, "M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"));
var StarIcon = svg(null, "M10.81 2.86c.38-1.15 2-1.15 2.38 0l1.89 5.83h6.12c1.2 0 1.71 1.54.73 2.25l-4.95 3.6 1.9 5.82a1.25 1.25 0 0 1-1.93 1.4L12 18.16l-4.95 3.6c-.98.7-2.3-.25-1.92-1.4l1.89-5.82-4.95-3.6a1.25 1.25 0 0 1 .73-2.25h6.12l1.9-5.83Z");
var FolderIcon = svg({ fill: "none" },
	path({
			"stroke": "currentColor",
			"stroke-width": "2"
		},
		"M3 8.2C3 7.07989 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H9.67452C10.1637 5 10.4083 5 10.6385 5.05526C10.8425 5.10425 11.0376 5.18506 11.2166 5.29472C11.4184 5.4184 11.5914 5.59135 11.9373 5.93726L12.0627 6.06274C12.4086 6.40865 12.5816 6.5816 12.7834 6.70528C12.9624 6.81494 13.1575 6.89575 13.3615 6.94474C13.5917 7 13.8363 7 14.3255 7H17.8C18.9201 7 19.4802 7 19.908 7.21799C20.2843 7.40973 20.5903 7.71569 20.782 8.09202C21 8.51984 21 9.0799 21 10.2V15.8C21 16.9201 21 17.4802 20.782 17.908C20.5903 18.2843 20.2843 18.5903 19.908 18.782C19.4802 19 18.9201 19 17.8 19H6.2C5.07989 19 4.51984 19 4.09202 18.782C3.71569 18.5903 3.40973 18.2843 3.21799 17.908C3 17.4802 3 16.9201 3 15.8V8.2Z"
	)
);
var ShopIcon = svg(null, "M21 11.42V19a3 3 0 0 1-3 3h-2.75a.25.25 0 0 1-.25-.25V16a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5.75c0 .14-.11.25-.25.25H6a3 3 0 0 1-3-3v-7.58c0-.18.2-.3.37-.24a4.46 4.46 0 0 0 4.94-1.1c.1-.12.3-.12.4 0a4.49 4.49 0 0 0 6.58 0c.1-.12.3-.12.4 0a4.45 4.45 0 0 0 4.94 1.1c.17-.07.37.06.37.24Z", "M2.63 4.19A3 3 0 0 1 5.53 2H7a1 1 0 0 1 1 1v3.98a3.07 3.07 0 0 1-.3 1.35A2.97 2.97 0 0 1 4.98 10c-2 0-3.44-1.9-2.9-3.83l.55-1.98ZM10 2a1 1 0 0 0-1 1v4a3 3 0 0 0 3 3 3 3 0 0 0 3-2.97V3a1 1 0 0 0-1-1h-4ZM17 2a1 1 0 0 0-1 1v3.98a2.43 2.43 0 0 0 0 .05A2.95 2.95 0 0 0 19.02 10c2 0 3.44-1.9 2.9-3.83l-.55-1.98A3 3 0 0 0 18.47 2H17Z");
var NitroIcon = svg(null, "M16.23 12c0 1.29-.95 2.25-2.22 2.25A2.18 2.18 0 0 1 11.8 12c0-1.29.95-2.25 2.22-2.25 1.27 0 2.22.96 2.22 2.25ZM23 12c0 5.01-4 9-8.99 9a8.93 8.93 0 0 1-8.75-6.9H3.34l-.9-4.2H5.3c.26-.96.68-1.89 1.21-2.7H1.89L1 3h12.74C19.13 3 23 6.99 23 12Zm-4.26 0c0-2.67-2.1-4.8-4.73-4.8A4.74 4.74 0 0 0 9.28 12c0 2.67 2.1 4.8 4.73 4.8a4.74 4.74 0 0 0 4.73-4.8Z");

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

// common/Components/TextInput/index.jsx
var TextInput = getModule(Filters2.byStrings("showCharacterCount", "clearable"), { searchExports: true });
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
	openModal: /* @__PURE__ */ Filters2.byStrings("onCloseRequest:null!="),
	closeModal: /* @__PURE__ */ Filters2.byStrings(".setState", ".getState()[")
});
var Modals = /* @__PURE__ */ getMangled( /* @__PURE__ */ Filters2.bySource("root", "headerIdIsManaged"), {
	ModalRoot: /* @__PURE__ */ Filters2.byStrings("rootWithShadow"),
	ModalFooter: /* @__PURE__ */ Filters2.byStrings(".footer"),
	ModalContent: /* @__PURE__ */ Filters2.byStrings(".content"),
	ModalHeader: /* @__PURE__ */ Filters2.byStrings(".header", "separator"),
	Animations: (a) => a.SUBTLE,
	Sizes: (a) => a.DYNAMIC,
	ModalCloseButton: Filters2.byStrings(".close]:")
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
var Tooltip_default = getModule(Filters2.byPrototypeKeys("renderTooltip"), { searchExports: true });

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
var FormSwitch_default = getModule(Filters2.byStrings("note", "tooltipNote"), { searchExports: true });

// common/Components/Switch/index.jsx
var Switch_default = FormSwitch_default || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("div", { style: { color: "#fff" } }, props.children, /* @__PURE__ */ React.createElement(
		"input", {
			type: "checkbox",
			checked: props.value,
			onChange: (e) => props.onChange(e.target.checked)
		}
	));
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ settingKey, note, onChange = nop, hideBorder = false, description, ...rest }) {
	const [val, set] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React.createElement(
		Switch_default, {
			...rest,
			value: val,
			note,
			hideBorder,
			onChange: (e) => {
				set(e);
				onChange(e);
			}
		},
		description || settingKey
	);
}

// MODULES-AUTO-LOADER:@Modules/Slider
var Slider_default = getModule(Filters2.byPrototypeKeys("renderMark"), { searchExports: true });

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
