/**
 * @runAt idle
 * @name Emojis
 * @description Send emoji as link if it can't be sent it normally.
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Emojis
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Emojis/Emojis.plugin.js
 */

// config:@Config
var Config_default = {
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
		"sendEmojiAsPng": false,
		"shouldHihglightAnimatedEmojis": true,
		"emojiSize": 48
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var UI = /* @__PURE__ */ (() => BdApi.UI)();
var findInTree = /* @__PURE__ */ (() => BdApi.Utils.findInTree)();
var getInternalInstance = /* @__PURE__ */ (() => BdApi.ReactUtils.getInternalInstance.bind(BdApi.ReactUtils))();

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

// src/Emojis/styles.css
StylesLoader_default.push(`.emoji-manager-ref{
	display: flex;
	flex-direction:column;
	gap:20px;
	margin:20px;
	overflow:hidden;
	max-height: 100%;
	max-width: 100%;
	min-height:0;
	/*min-height:0;*/
	box-sizing: border-box;
}

.emoji-manager-modal-root {
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
	box-sizing: border-box;
}

.emoji-manager-emoji-card {
	border-radius: 8px;
	padding: 2px;
	background: #353535;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	/*gap: 5px;*/
	height: 80px;
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






`);

// common/React.jsx
var useState = /* @__PURE__ */ (() => BdApi.React.useState)();
var useEffect = /* @__PURE__ */ (() => BdApi.React.useEffect)();
var useRef = /* @__PURE__ */ (() => BdApi.React.useRef)();
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;

// common/Utils/index.js
function getObjectKey(object = {}, filter) {
	for (const key in object) {
		if (!filter(object[key])) continue;
		return key;
	}
}

function clsx(prefix) {
	return (...args) => args.filter(Boolean).map((a) => `${prefix}-${a}`).join(" ");
}
var promiseHandler = (promise) => promise.then((data) => [void 0, data]).catch((err) => [err]);

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

function getNestedProp(obj, path2) {
	return path2.split(".").reduce((ob, prop) => ob?.[prop], obj);
}
var nop = () => {};

// common/consts.js
var UNDEFINED_OBJECT_OR_KEY = "Undefined object or key";
var PATCH_ERROR = "Could not perform a patch";
var MISSING_ARGUMENTS = "Missing arguments";

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();
var abortController = /* @__PURE__ */ (() => {
	Plugin_default.onStart(() => abortController = new AbortController());
	Plugin_default.onStop(() => abortController.abort());
	return new AbortController();
})();

function lazy(filter, { decFilter, ...options } = {}) {
	if (!filter) return Logger_default.error(`[Webpack lazy] ${MISSING_ARGUMENTS}`);
	const { promise, resolve } = Promise.withResolvers();
	waitForModule(filter, {
		...options,
		raw: true,
		fatal: false,
		signal: abortController.signal
	}).then((module2) => {
		if (!module2) throw "waitForModule resolved with undefined";
		const object = decFilter ? module2.declarations : module2.exports;
		const key = getObjectKey(object, decFilter || filter);
		if (!object || !key) throw UNDEFINED_OBJECT_OR_KEY;
		resolve([object, key]);
	}).catch((err) => Logger_default.error(PATCH_ERROR, err));
	return promise;
}

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target2) => target2[type] && filter(target2[type]);
}

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary_default = (props) => /* @__PURE__ */ React_default.createElement(BdApi.Components.ErrorBoundary, { ...props, name: Config_default?.info?.name });

// common/Components/Flex/index.jsx
var Flex_default = getModule(Filters.byKeys("Child", "Align", "Justify"));

// common/Components/Button/index.jsx
function ButtonComponentFallback(props) {
	return /* @__PURE__ */ React_default.createElement("button", { ...props });
}
var ManaButton = /* @__PURE__ */ (() => getModule(Filters.byStrings(`"data-mana-component":"button"`), { searchExports: true }) || ButtonComponentFallback)();
var ManaTextButton = /* @__PURE__ */ (() => getModule(Filters.byStrings(`"data-mana-component":"text-button"`), { searchExports: true }) || ButtonComponentFallback)();

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

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = /* @__PURE__ */ (() => getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true }))();

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

// MODULES-AUTO-LOADER:@Modules/Tooltip
var Tooltip_default = /* @__PURE__ */ (() => getModule(Filters.byPrototypeKeys("renderTooltip"), { searchExports: true }))();

// common/Components/Tooltip/index.jsx
var Tooltip_default2 = ({ note, position, children }) => {
	return /* @__PURE__ */ React_default.createElement(
		Tooltip_default, {
			text: note,
			position: position || "top"
		},
		(props) => (
			// eslint-disable-next-line @eslint-react/no-clone-element
			React_default.cloneElement(children, {
				...props,
				...children.props
			})
		)
	);
};

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

function add2({ animated, name, id }) {
	if (has(id)) return;
	const parsedEmoji = buildEmojiObj({ animated, name, id });
	emojisMap.rawEmojis.unshift(serializeEmoji({ animated, name, id }));
	emojisMap.parsedEmojis.unshift(parsedEmoji);
}

function remove(id) {
	if (!has(id)) return;
	const index = emojisMap.indexMap[id];
	emojisMap.parsedEmojis.splice(index, 1);
	emojisMap.rawEmojis.splice(index, 1);
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
	EmojisManager.emojis = emojisMap.parsedEmojis;
	Data.save("emojis", cleaned);
}
var EmojisManager = {
	_state: emojisMap,
	add: add2,
	remove,
	commit,
	has,
	update,
	getById,
	getByIndex,
	emojis: emojisMap.parsedEmojis
};
var EmojisManager_default = EmojisManager;

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
var ModalActions = getModule((a) => a.useModalsStore);
var Modals = /* @__PURE__ */ getMangled( /* @__PURE__ */ Filters.bySource("MODAL_ROOT", "transitionState"), {
	ModalRoot: /* @__PURE__ */ Filters.byStrings("transitionState"),
	ModalFooter: /* @__PURE__ */ Filters.byStrings(".HORIZONTAL_REVERSE"),
	ModalContent: /* @__PURE__ */ Filters.byStrings("scrollbarType", "scrollerRef"),
	ModalHeader: /* @__PURE__ */ Filters.byStrings("headerIdIsManaged", "headerId", ".HORIZONTAL"),
	Animations: (a) => a.SUBTLE,
	Sizes: (a) => a.DYNAMIC,
	ModalCloseButton: Filters.byStrings("withCircleBackground")
});

// MODULES-AUTO-LOADER:@Modules/EmojiFunctions
var EmojiFunctions_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("getEmojiUnavailableReason"), { searchExports: true }))();

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

// MODULES-AUTO-LOADER:@Stores/EmojiStore
var EmojiStore_default = /* @__PURE__ */ (() => getStore("EmojiStore"))();

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = /* @__PURE__ */ (() => getStore("SelectedChannelStore"))();

// MODULES-AUTO-LOADER:@Stores/ChannelStore
var ChannelStore_default = /* @__PURE__ */ (() => getStore("ChannelStore"))();

// MODULES-AUTO-LOADER:@Modules/MessageActions
var MessageActions_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("jumpToMessage", "_sendMessage"), { searchExports: false }))();

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true }))();

// MODULES-AUTO-LOADER:@Stores/PendingReplyStore
var PendingReplyStore_default = /* @__PURE__ */ (() => getStore("PendingReplyStore"))();

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

// MODULES-AUTO-LOADER:@Stores/DraftStore
var DraftStore_default = /* @__PURE__ */ (() => getStore("DraftStore"))();

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
			return sendMessageDirectly(content, channel.id);
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

// src/Emojis/components/EmojisComponent.jsx
var c = clsx("emoji-manager");
var rowHeight = 80;
var desiredColumns = 6;
var desiredItemWidth = 80;
var gap = 20;

function getColNumberFromWidth(width, itemWidth, maxColumns) {
	return Math.min(Math.max(Math.floor(width / itemWidth), 1), maxColumns);
}

function EmojisComponent() {
	const [val, setValue] = useState("");
	const [width, setWidth] = useState(window.innerWidth * 0.8);
	const ref = useRef();
	const emojis = EmojisManager_default.emojis.filter((a) => a.name.toLowerCase().includes(val.toLowerCase()));
	const changeHandler = (content) => {
		setValue(content);
	};
	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const overflowListener = () => setWidth(node.clientWidth);
		const resizeObserver = new ResizeObserver(overflowListener);
		resizeObserver.observe(node);
		return () => resizeObserver?.disconnect();
	}, [ref.current]);
	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		setWidth(node.clientWidth);
	}, [ref.current]);
	const columns = getColNumberFromWidth(width - gap * (desiredColumns - 1), desiredItemWidth, desiredColumns);
	return /* @__PURE__ */ React_default.createElement("div", { ref, className: c("ref") }, /* @__PURE__ */ React_default.createElement(TextInput_default, { maxLength: 32, size: "sm", onChange: changeHandler, value: val }), /* @__PURE__ */ React_default.createElement(
		GridScroller_default, {
			style: { width },
			className: c("emojis-list"),
			columns,
			itemGutter: gap,
			removeEdgeItemGutters: true,
			getItemKey: (_, index) => emojis[index].id,
			sections: [emojis.length],
			getItemHeight: () => rowHeight,
			renderItem: (_, index, style) => {
				const emoji = emojis[index];
				return /* @__PURE__ */ React_default.createElement(EmojiCard, { style, key: emoji.id, ...emoji });
			}
		}
	));
}

function EmojiCard({ animated, name, id, style }) {
	const [hover, setHover] = useState(false);
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			onMouseEnter: () => setHover(true),
			onMouseLeave: () => setHover(false),
			style,
			onContextMenu: (e) => {
				const Menu = ContextMenu.buildMenu([
					{ label: "Send directly", action: () => sendEmojiDirectly(id) },
					{ label: "Copy url", action: () => copy(getEmojiUrl(id)) },
					{ label: "Insert url", action: () => insertEmoji(id) },
					{
						label: "Delete",
						action: () => {
							EmojisManager_default.remove(id);
							EmojisManager_default.commit();
						}
					}
				]);
				ContextMenu.open(e, (props) => /* @__PURE__ */ React_default.createElement(Menu, { ...props }), {
					position: "bottom",
					align: "left"
				});
			},
			onClick: () => sendEmojiDirectly(id),
			className: c("emoji-card", animated && "emoji-card-animated")
		},
		/* @__PURE__ */
		React_default.createElement(Tooltip_default2, { note: name }, /* @__PURE__ */ React_default.createElement("div", { className: c("emoji-img") }, /* @__PURE__ */ React_default.createElement("img", { alt: name, src: getEmojiUrl(id, hover && animated, 80) })))
	);
}

// src/Emojis/patches/patchExpressionPicker.js
var ExpressionPicker = getModule((a) => a?.type?.toString().includes("handleDrawerResizeHandleMouseDown"), { searchExports: false });
var { ExpressionPickerStore } = getMangled("expression-picker-last-active-view", {
	ExpressionPickerStore: (a) => a.getState
});
var VIEW_TYPE = "SAVED_EMOJIS";
Plugin_default.onStart(() => {
	if (!ExpressionPicker) return Logger_default.patchError("ExpressionPicker");
	Patcher.after(ExpressionPicker, "type", (_, args, ret) => {
		const thing = findInTree(ret, Filters.byKeys("align", "autoInvert"), { walkable: ["props", "children"] });
		if (!thing?.children) return ret;
		const unpatch = Patcher.after(thing, "children", (_2, args2, ret2) => {
			unpatch();
			const body = findInTree(ret2, (el) => el?.[0]?.type === "nav", { walkable: ["props", "children"] });
			const head = findInTree(body, (el) => el?.[0]?.props?.["aria-selected"] !== void 0, { walkable: ["props", "children"] });
			const TabButtonComponent = head?.[0]?.type?.type;
			if (!TabButtonComponent) return;
			const activeView = ExpressionPickerStore.getState().activeView;
			const selected = VIEW_TYPE === activeView;
			head.push(
				/* @__PURE__ */
				React_default.createElement(ErrorBoundary_default, { id: "EmojisComponent-TabButtonComponent" }, /* @__PURE__ */ React_default.createElement(TabButtonComponent, { id: VIEW_TYPE, "aria-controls": VIEW_TYPE, "aria-selected": selected, viewType: VIEW_TYPE, isActive: selected }, "My Tab"))
			);
			if (selected) {
				body.push(
					/* @__PURE__ */
					React_default.createElement(ErrorBoundary_default, { id: "EmojisComponent" }, /* @__PURE__ */ React_default.createElement(EmojisComponent, null))
				);
			}
		});
	});
});

// MODULES-AUTO-LOADER:@Enums/EmojiIntentionEnum
var EmojiIntentionEnum_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true }) || void 0)();

// src/Emojis/patches/patchIsEmojiDisabled.js
Plugin_default.onStart(() => {
	if (!EmojiFunctions_default?.isEmojiDisabled) return Logger_default.patchError("IsEmojiDisabled");
	Patcher.after(EmojiFunctions_default, "isEmojiDisabled", (_, [{ intention }], ret) => {
		if (intention !== EmojiIntentionEnum_default.CHAT) return ret;
		return false;
	});
});

// src/Emojis/patches/EmojiContextmenu.js
Plugin_default.onStart(() => {
	const unpatch = [
		ContextMenu.patch("expression-picker", (retVal, props) => {
			const iProps = getInternalInstance(props.target)?.pendingProps;
			const id = iProps?.["data-type"] === "emoji" && iProps["data-id"];
			if (!id) return;
			const MenuItems = [
				ContextMenu.buildItem({
					label: "Send directly",
					action: () => sendEmojiDirectly(id)
				}),
				ContextMenu.buildItem({
					label: "Insert url",
					action: () => insertEmoji(id)
				})
			];
			if (Array.isArray(retVal.props.children)) retVal.props.children.unshift(MenuItems);
			else retVal.props.children = [MenuItems, retVal.props.children];
		})
	];
	Plugin_default.once(Events.STOP, () => {
		unpatch.forEach((a) => a && typeof a === "function" && a());
	});
});

// src/Emojis/patches/patchEmojiInChat.jsx
var EmojiComponentModule = getMangled("Unknown Src for Emoji", {
	Emoji: (a) => true
});
Plugin_default.on(Events.START, async () => {
	Patcher.after(EmojiComponentModule, "Emoji", (_, [props], ret) => {
		if (props.src) return ret;
		ret.props.onContextMenu = (e) => {
			const Menu = ContextMenu.buildMenu([{
				label: "Save",
				action: () => {
					EmojisManager_default.add({
						animated: props.animated,
						name: (props.emojiName || props["aria-describedby"]).replace(/:/g, ""),
						id: props.emojiId
					});
					EmojisManager_default.commit();
				}
			}]);
			ContextMenu.open(e, (props2) => /* @__PURE__ */ React_default.createElement(Menu, { ...props2 }), {
				position: "bottom",
				align: "left"
			});
		};
	});
});

// src/Emojis/components/EmojiManager.jsx
var c2 = clsx("emoji-manager");

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
	return /* @__PURE__ */ React_default.createElement(Modals.ModalRoot, { ...modalProps, size: "dynamic", fullscreenOnMobile: false, className: c2("modal-root") }, /* @__PURE__ */ React_default.createElement(Modals.ModalHeader, { separator: true }, /* @__PURE__ */ React_default.createElement(Heading_default, { variant: "heading-lg/semibold", style: { flexGrow: 1 } }, "EmojiManager"), /* @__PURE__ */ React_default.createElement(Modals.ModalCloseButton, { onClick: modalProps.onClose })), /* @__PURE__ */ React_default.createElement("div", { className: c2("modal-content") }, /* @__PURE__ */ React_default.createElement(EmojisList, { emojis, onChange: changeHandler })), /* @__PURE__ */ React_default.createElement(Modals.ModalFooter, { separator: true }, /* @__PURE__ */ React_default.createElement(Flex_default, { style: { gap: 8 }, align: Flex_default.Align.CENTER, justify: Flex_default.Justify.END }, /* @__PURE__ */ React_default.createElement(ManaTextButton, { text: "Cancel", onClick: modalProps.onClose }), /* @__PURE__ */ React_default.createElement(ManaButton, { size: "sm", text: "Save", onClick: saveHandler }))));
}
var desiredColumns2 = 6;
var desiredItemWidth2 = 130;
var gap2 = 20;

function getColNumberFromWidth2(width, itemWidth, maxColumns) {
	return Math.min(Math.max(Math.floor(width / itemWidth), 1), maxColumns);
}

function EmojisList({ emojis, onChange }) {
	const [width, setWidth] = useState(window.innerWidth * 0.8);
	const columns = getColNumberFromWidth2(width - gap2 * (desiredColumns2 - 1), desiredItemWidth2, desiredColumns2);
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
			className: c2("emojis-list"),
			columns,
			itemGutter: gap2,
			removeEdgeItemGutters: true,
			getItemKey: (_, index) => emojis[index].id,
			sections: [emojis.length],
			getItemHeight: () => 150,
			renderItem: (_, index, style) => {
				const emoji = emojis[index];
				return /* @__PURE__ */ React_default.createElement(EmojiCard2, { onChange, style, key: emoji.id, ...emoji });
			}
		}
	);
}

function EmojiCard2({ animated, name, id, style, onChange }) {
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
	return /* @__PURE__ */ React_default.createElement("div", { style, onClick: deleteHandler, className: c2("emoji-card", deleteEmoji && "emoji-card-deleted", animated && "emoji-card-animated") }, /* @__PURE__ */ React_default.createElement(
		"div", {
			className: c2("emoji-img")
		},
		/* @__PURE__ */
		React_default.createElement("img", { alt: name, src: getEmojiUrl2(id, hover && animated, 80) })
	));
}

function openEmojiManager() {
	ModalActions.openModal((e) => /* @__PURE__ */ React_default.createElement(ErrorBoundary_default, null, /* @__PURE__ */ React_default.createElement(EmojiManagerComponent, { modalProps: e, emojis: EmojisManager_default.emojis })));
}

// src/Emojis/patches/patchEmojiPickerHeader.jsx
var EmojiPickerHeader = lazy(Filters.bySource("selectedSurrogate"), { declarationsFilter: Filters.byStrings("ion:f,onBurstRea") });
Plugin_default.on(Events.START, async () => {
	const [err, { module: module2, key }] = await promiseHandler(EmojiPickerHeader);
	if (err || !module2 || !key) return Logger_default.patchError("patchEmojiPickerHeader");
	if (Plugin_default.stopped) return;
	Patcher.after(module2, key, (_, args, ret) => {
		const children = getNestedProp(ret, "props.children.props.children");
		if (!children || !Array.isArray(children)) return;
		children.push(
			/* @__PURE__ */
			React_default.createElement(Tooltip_default2, { note: "Emoji settings" }, /* @__PURE__ */ React_default.createElement(
				ManaButton, {
					onClick: () => {
						openEmojiManager();
					},
					variant: "icon-only",
					size: "sm",
					icon: () => /* @__PURE__ */ React_default.createElement(SettingIcon, { width: "20", height: "20" })
				}
			))
		);
	});
});

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
var c3 = classNameFactory("divider");

function Divider({ gap: gap3 = 15, gutter = 0, direction = Divider.direction.HORIZONTAL }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { "--divider-gap": `${gap3}px`, "--divider-gutter": `${gutter}%` },
			className: c3("base", direction)
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

// MODULES-AUTO-LOADER:@Modules/Slider
var Slider_default = /* @__PURE__ */ (() => getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true }))();

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

// common/Components/FieldSet/index.jsx
var c4 = classNameFactory("fieldset");

function FieldSet({ label, description, children, gap: gap3 = 15, direction = FieldSet.direction.VERTICAL }) {
	return /* @__PURE__ */ React_default.createElement("fieldset", { className: c4("container") }, label && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c4("label"),
			tag: "legend",
			variant: "text-lg/medium"
		},
		label
	), description && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c4("description"),
			variant: "text-sm/normal",
			color: "text-secondary"
		},
		description
	), /* @__PURE__ */ React_default.createElement(
		"div", {
			className: c4("content", direction),
			style: { gap: gap3 }
		},
		children
	));
}
FieldSet.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// src/Emojis/components/SettingComponent.jsx
var sizes = [48, 56, 60, 64, 80, 96, 100, 128, 160, 240, 256, 300];

function StickerSize() {
	const [val, set] = Settings_default.useSetting("emojiSize");
	return /* @__PURE__ */ React_default.createElement(
		Slider_default, {
			className: "emojiSizeSlider",
			label: "Emoji Size",
			description: "The size of the Emoji in pixels",
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
			description: "Send Directly",
			note: "Send the emoji link in a message directly instead of putting it in the chat box.",
			settingKey: "sendDirectly"
		},
		{
			border: true,
			description: "Ignore Embed Permissions",
			note: "Send emoji links regardless of embed permissions, meaning links will not turn into images.",
			settingKey: "ignoreEmbedPermissions"
		},
		{
			border: true,
			description: "Send animated emojis",
			note: "Animated emojis are sent as GIFs.",
			settingKey: "shouldSendAnimatedEmojis"
		},
		{
			border: true,
			description: "Send animated as png",
			note: "Meaning the emoji will show only the first frame, making them act as normal emoji, unless the first frame is empty.",
			settingKey: "sendEmojiAsPng"
		},
		{
			border: true,
			description: "Highlight animated emoji",
			settingKey: "shouldHihglightAnimatedEmojis"
		}
	].map(SettingSwtich), /* @__PURE__ */ React_default.createElement(StickerSize, null));
};

// src/Emojis/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent_default, null);
Plugin_default.onStop(() => {
	Patcher.unpatchAll();
});
module.exports = () => Plugin_default;
