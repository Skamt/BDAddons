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
		"emojiSize": 48,
		"emojiRenderSize": 80
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

// common/Utils/Array.js
var add = (array, item, index) => array.toSpliced(index ?? array.length, 0, item);

// common/React.jsx
var useState = /* @__PURE__ */ (() => BdApi.React.useState)();
var useEffect = /* @__PURE__ */ (() => BdApi.React.useEffect)();
var useRef = /* @__PURE__ */ (() => BdApi.React.useRef)();
var useSyncExternalStore = /* @__PURE__ */ (() => BdApi.React.useSyncExternalStore)();
var useMemo = /* @__PURE__ */ (() => BdApi.React.useMemo)();
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;

function insertChild(el, child, index) {
	if (!el?.props?.children || !child) return;
	const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
	el.props.children = add(children, child, index);
}

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
		setTimeout(target.dispatchEvent(new Event("START")));
	},
	stop() {
		setTimeout(target.dispatchEvent(new Event("STOP")));
	}
};

// common/Patcher/contextmenu.js
var contextmenuUnPatches = [];
Plugin_default.onStop(() => {
	contextmenuUnPatches.filter(Boolean).forEach((a) => a());
	contextmenuUnPatches = [];
});
var patch = (id, callback) => {
	const undo = ContextMenu.patch(id, callback);
	contextmenuUnPatches.push(undo);
};
var contextmenu_default = ContextMenu;

// common/Utils/Object.js
var map = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn({ value, key })]));

function getInObject(object = {}, filter) {
	for (const key in object)
		if (filter(object[key])) return object[key];
}

function hasOwn(object, key) {
	return object && key && key in object;
}

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

// common/Discord/zustand.js
var zustand = /* @__PURE__ */ (() => getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
})?.zustand)();
var subscribeWithSelector = /* @__PURE__ */ (() => getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), {
	searchExports: true
}))();

function create(initialState) {
	const Store = zustand(initialState);
	Object.defineProperty(Store, "state", {
		configurable: false,
		get: () => Store.getState()
	});
	return Store;
}

// common/Settings.js
var Settings_default = /* @__PURE__ */ (() => {
	const SettingsStore = create(subscribeWithSelector(() => Object.assign(Config_default.settings || {}, Data.load("settings") || {})));
	Object.assign(
		SettingsStore,
		map(
			SettingsStore.getInitialState(),
			({ key }) => Object.assign(() => SettingsStore((state) => state[key]), {
				key,
				get: () => SettingsStore.state[key],
				set: (v) => SettingsStore.setState({
					[key]: v })
			})
		)
	);
	SettingsStore.subscribe(
		(a) => a,
		() => Data.save("settings", SettingsStore.state)
	);
	return SettingsStore;
})();

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = /* @__PURE__ */ (() => getStore("SelectedChannelStore"))();

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

// common/Utils/index.js
function clsx(prefix) {
	return (...args) => args.filter(Boolean).map((a) => `${prefix}-${a}`).join(" ");
}

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

// src/Emojis/Utils.js
function copy2(content) {
	if (!content) return Toast_default.error("Copy failed!");
	copy(content);
	Toast_default.success("Copied!");
}

function sendEmojiAsLink(content) {
	const channelId = SelectedChannelStore_default.getChannelId();
	const draft = DraftStore_default.getDraft(channelId, 0);
	if (draft) return insertText(`[\u{E01EB}](${content})`);
	sendMessageDirectly(content, channelId).catch(() => {
		Toast_default.error("Could not send directly.");
		insertText(content);
	});
}

function buildEmojiUrl(id, animated, size) {
	return `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}${!size ? "" : `?size=${size}`}`;
}

function sendDirectly(id) {
	sendEmojiAsLink(buildEmojiUrl(id, false, Settings_default.state.emojiSize));
}

function sendAnimatedDirectly(id) {
	sendEmojiAsLink(buildEmojiUrl(id, true));
}

function copyEmojiUrl(id) {
	copy2(buildEmojiUrl(id, false, Settings_default.state.emojiSize));
}

function getContextMenuItem(label, id, animated) {
	const item = { label };
	if (animated) {
		item.type = "submenu";
		item.items = [
			{ label: "unanimated", action: () => sendDirectly(id) },
			{ label: "animated", action: () => sendAnimatedDirectly(id) }
		];
	} else item.action = () => sendDirectly(id);
	return item;
}

function getCopyContextMenuItem(id, name) {
	return {
		label: "Copy",
		type: "submenu",
		items: [
			{ label: "url", action: () => copyEmojiUrl(id) },
			{ label: "name", action: () => copy2(name) }
		]
	};
}

// MODULES-AUTO-LOADER:@Stores/EmojiStore
var EmojiStore_default = /* @__PURE__ */ (() => getStore("EmojiStore"))();

// src/Emojis/EmojisManager.js
var target2 = new EventTarget();

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
	target2.dispatchEvent(new Event("CHANGED"));
}

function off(listener) {
	target2.removeEventListener("CHANGED", listener);
}

function on(listener, props) {
	target2.addEventListener("CHANGED", listener, props);
	return () => off(listener);
}

function getEmojis() {
	return EmojisManager.emojis;
}
var EmojisManager = {
	_state: emojisMap,
	add: add2,
	remove,
	commit,
	on,
	getEmojis,
	off,
	has,
	update,
	getById,
	getByIndex,
	emojis: emojisMap.parsedEmojis
};
var EmojisManager_default = EmojisManager;

// src/Emojis/patches/EmojiContextmenu.js
Plugin_default.onStart(() => {
	patch("expression-picker", (ret, props) => {
		const iProps = getInternalInstance(props.target)?.pendingProps;
		const id = iProps?.["data-type"] === "emoji" && iProps["data-id"];
		if (!id) return;
		const emoji = EmojiStore_default.getCustomEmojiById(id);
		insertChild(
			ret,
			[
				getContextMenuItem("send", id, emoji.animated),
				getContextMenuItem("insert", id, emoji.animated),
				getCopyContextMenuItem(id, emoji.name),
				{ type: "separator" },
				{
					label: "Save",
					action: () => {
						EmojisManager_default.add({
							animated: emoji.animated,
							name: (emoji.name || emoji["aria-describedby"]).replace(/:/g, ""),
							id
						});
						EmojisManager_default.commit();
					}
				}
			].map(contextmenu_default.buildItem.bind(contextmenu_default)),
			0
		);
	});
});

// common/Patcher/shared.js
Plugin_default.onStop(() => Patcher.unpatchAll());

function patch2(type, object, key, callback) {
	if (!hasOwn(object, key))
		return Logger.error("Could not perform a patch, missing arguments", arguments);
	const caller = {
		after: (context, args, ret) => callback({ context, args, ret }),
		before: (context, args) => callback({ context, args }),
		instead: (context, args, fn) => callback({ context, args, fn })
	} [type];
	return Patcher[type](object, key, caller);
}

// common/Patcher/index.js
function once(type, object, key, callback) {
	const unpatch = patch2(type, object, key, (...args) => {
		unpatch();
		callback.apply(null, args);
	});
}
var after = (...args) => patch2("after", ...args);
var afterOnce = (...args) => once("after", ...args);

// src/Emojis/patches/patchEmojiInChat.jsx
var EmojiComponentModule = getMangled("Unknown Src for Emoji", { Emoji: () => true });
Plugin_default.onStart(async () => {
	after(EmojiComponentModule, "Emoji", ({ args: [props], ret }) => {
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
				},
				getCopyContextMenuItem(props.emojiId, props.emojiName)
			]);
			ContextMenu.open(e, (props2) => /* @__PURE__ */ React_default.createElement(Menu, { ...props2 }), {
				position: "bottom",
				align: "left"
			});
		};
	});
});

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary_default = (props) => /* @__PURE__ */ React_default.createElement(BdApi.Components.ErrorBoundary, { ...props, name: Config_default?.info?.name });

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

// src/Emojis/components/EmojisList/styles.css
StylesLoader_default.push(`.emoji-list-container {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-sizing: border-box;
}

.emoji-list-empty {
	display: flex;
	align-items:center;
	justify-content:center;
	flex:1;
	font-size: 1.2rem;
	color: var(--interactive-text-default);
}

.emoji-list-header {
	background-color: var(--background-surface-high);
	border-bottom: 1px solid var(--border-subtle);
	box-shadow: none;
	flex: 0 0 auto;
	padding: var(--custom-gif-picker-gutter-size);
	z-index: 1;
	flex:0 0 auto;
}

.emoji-list-body {
	min-height:0;
	flex:1 0 0;
	display:flex;
}

.emoji-list-emoji-card {
	border-radius: 8px;
	padding: 2px;
	background: #353535;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	position: relative;

}

.emoji-list-emoji-card-animated:before {
	content: "";
	border: 1px dashed orange;
	border-radius: inherit;
	inset: 0;
	position: absolute;
}

.emoji-list-emoji-img {
	flex: 1 0 0;
	border-radius: inherit;
	position: relative;
	margin: 0 auto;
	max-width: 100%;
	overflow: hidden;
}


.emoji-list-emoji-img img {
	width: auto;
	height: 100%;
	border-radius: inherit;
}`);

// common/Components/GridScroller/index.jsx
var GridScroller = getInObject(getModule(Filters.bySource("columns", "getSectionHeight", "ResizeObserver", "forceUpdateOnChunkChange")), () => true);
var GridScroller_default = GridScroller || function GridScrollerFallback(props) {
	return /* @__PURE__ */ React_default.createElement("div", { ...props });
};

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

// common/Components/Heading/index.jsx
var Heading = getInObject(getModule(Filters.bySource('text":', 'headin":', "data-excessive-heading-level", "heading-sm/normal")), Filters.byStrings("data-excessive-heading-level"));
var Heading_default = Heading || function({ tag, ...rest }) {
	return React_default.createElement(tag, rest);
};

// common/Components/Icon/index.jsx
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
var MagnifyingGlassIcon = () => svg({ fill: "none" }, path({ fill: "currentColor", "fill-rule": "evenodd", "clip-rule": "evenodd" }, "M15.62 17.03a9 9 0 1 1 1.41-1.41l4.68 4.67a1 1 0 0 1-1.42 1.42l-4.67-4.68ZM17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"))();

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

// src/Emojis/components/EmojisList/index.jsx
var c = clsx("emoji-list");
var desiredEmojiSize = 80;
var gap = 12;

function getColNumberFromWidth(width, itemWidth, gap2) {
	return Math.floor((width + gap2) / (itemWidth + gap2));
}

function EmojisComponent() {
	const [val, setVal] = useState("");
	const [width, setWidth] = useState(window.innerWidth * 0.8);
	const emojiRenderSize = Settings_default.emojiRenderSize() || desiredEmojiSize;
	const ref = useRef();
	const scrollerRef = useRef();
	const emojis = useSyncExternalStore(EmojisManager_default.on, EmojisManager_default.getEmojis);
	const filteredEmojis = useMemo(() => emojis.filter((a) => a.name.toLowerCase().includes(val.toLowerCase())), [emojis, val]);
	const columns = useMemo(() => getColNumberFromWidth(width, emojiRenderSize, gap), [emojiRenderSize, width]);
	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const overflowListener = () => setWidth(node.clientWidth);
		const resizeObserver = new ResizeObserver(overflowListener);
		resizeObserver.observe(node);
		return () => resizeObserver?.disconnect();
	}, []);
	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		setWidth(node.clientWidth);
	}, []);
	useEffect(() => {
		scrollerRef?.current?.scrollToTop?.();
	}, [val]);
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			ref,
			style: { "--emoji-size": emojiRenderSize },
			className: c("container")
		},
		!filteredEmojis.length ? /* @__PURE__ */ React_default.createElement(
			Heading_default, {
				className: c("empty"),
				tag: "h1",
				variant: "text-md/medium"
			},
			"No Saved Emojis"
		) : /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement("div", { className: c("header") }, /* @__PURE__ */ React_default.createElement(
			TextInput_default, {
				clearable: true,
				autoFocus: true,
				fullWidth: true,
				placeholder: "Search Emojis",
				leading: ({ color }) => /* @__PURE__ */ React_default.createElement(
					MagnifyingGlassIcon, {
						width: "16",
						height: "16",
						color: color.css ?? color
					}
				),
				onChange: (c4) => setVal(c4),
				value: val
			}
		)), /* @__PURE__ */ React_default.createElement("div", { className: c("body") }, /* @__PURE__ */ React_default.createElement(
			GridScroller_default, {
				ref: scrollerRef,
				style: { width },
				className: c("emojis-list"),
				columns,
				fade: true,
				itemGutter: gap,
				getItemKey: (_, index) => filteredEmojis[index].id,
				sections: [filteredEmojis.length],
				getItemHeight: () => emojiRenderSize,
				renderItem: (_, index, style) => {
					const emoji = filteredEmojis[index];
					return /* @__PURE__ */ React_default.createElement(
						EmojiCard, {
							style,
							key: emoji.id,
							...emoji
						}
					);
				}
			}
		)))
	);
}

function EmojiCard({ animated, name, id, style }) {
	const [hover, setHover] = useState(false);
	const EmojiContextMenu = useMemo(() => {
		const Menu = ContextMenu.buildMenu(
			[
				getContextMenuItem("send", id, animated),
				getContextMenuItem("insert", id, animated),
				getCopyContextMenuItem(id, name),
				{
					label: "Delete",
					action: () => {
						EmojisManager_default.remove(id);
						EmojisManager_default.commit();
					}
				}
			].filter(Boolean)
		);
		return (props) => /* @__PURE__ */ React_default.createElement(Menu, { ...props });
	}, [animated, id, name]);
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			onMouseEnter: () => setHover(true),
			onMouseLeave: () => setHover(false),
			style,
			onContextMenu: (e) => {
				ContextMenu.open(e, EmojiContextMenu, {
					position: "bottom",
					align: "left"
				});
			},
			onClick: () => sendDirectly(id),
			className: c("emoji-card", animated && "emoji-card-animated")
		},
		/* @__PURE__ */
		React_default.createElement(Tooltip_default2, { note: name }, /* @__PURE__ */ React_default.createElement("div", { className: c("emoji-img") }, /* @__PURE__ */ React_default.createElement(
			"img", {
				alt: name,
				src: buildEmojiUrl(id, hover && animated, 80)
			}
		)))
	);
}

// src/Emojis/patches/patchExpressionPicker.jsx
var ExpressionPicker = getModule((a) => a?.type?.toString().includes("handleDrawerResizeHandleMouseDown"), { searchExports: false });
var { ExpressionPickerStore } = getMangled("expression-picker-last-active-view", {
	ExpressionPickerStore: (a) => a.getState
});
var VIEW_TYPE = "SAVED_EMOJIS";
Plugin_default.onStart(() => {
	if (!ExpressionPicker) return Logger_default.patchError("ExpressionPicker");
	after(ExpressionPicker, "type", ({ ret }) => {
		const thing = findInTree(ret, Filters.byKeys("align", "autoInvert"), { walkable: ["props", "children"] });
		if (!thing?.children) return ret;
		afterOnce(thing, "children", ({ ret: ret2 }) => {
			const body = findInTree(ret2, (el) => el?.[0]?.type === "nav", { walkable: ["props", "children"] });
			const head = findInTree(body, (el) => el?.[0]?.props?.["aria-selected"] !== void 0, { walkable: ["props", "children"] });
			const TabButtonComponent = head?.[0]?.type?.type;
			if (!TabButtonComponent) return;
			const activeView = ExpressionPickerStore.getState().activeView;
			const selected = VIEW_TYPE === activeView;
			head.push(
				/* @__PURE__ */
				React_default.createElement(ErrorBoundary_default, { id: "EmojisList-TabButtonComponent" }, /* @__PURE__ */ React_default.createElement(
					TabButtonComponent, {
						id: VIEW_TYPE,
						"aria-controls": VIEW_TYPE,
						"aria-selected": selected,
						viewType: VIEW_TYPE,
						isActive: selected
					},
					"Saved Emojis"
				))
			);
			if (selected) {
				body.push(
					/* @__PURE__ */
					React_default.createElement(ErrorBoundary_default, { id: "EmojisList" }, /* @__PURE__ */ React_default.createElement(EmojisComponent, null))
				);
			}
		});
	});
});

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

// common/Components/FieldSet/index.jsx
var c2 = classNameFactory("fieldset");

function FieldSet({ label, description, children, gap: gap2 = 15, direction = FieldSet.direction.VERTICAL }) {
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
			style: { gap: gap2 }
		},
		children
	));
}
FieldSet.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// MODULES-AUTO-LOADER:@Modules/Slider
var Slider_default = /* @__PURE__ */ (() => getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true }))();

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

// common/Components/Divider/index.jsx
var c3 = classNameFactory("divider");

function Divider({ gap: gap2 = 15, gutter = 0, direction = Divider.direction.HORIZONTAL }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { "--divider-gap": `${gap2}px`, "--divider-gutter": `${gutter}%` },
			className: c3("base", direction)
		}
	);
}
Divider.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// common/Components/SettingSlider/index.jsx
function SettingSlider({ setting, border, processValue = Math.round, label, description, ...props }) {
	const val = Settings_default(setting.get);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Slider_default, {
			...props,
			mini: true,
			label,
			description,
			initialValue: val,
			onValueChange: (e) => setting.set(processValue(e))
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, null));
}

// src/Emojis/components/SettingComponent.jsx
var emojiSizes = [48, 56, 60, 64, 80, 96, 100, 128, 160, 240, 256, 300];
var emojiRenderSizes = [50, 75, 100, 125, 150, 175, 200, 225, 250];
var SettingComponent_default = () => {
	return /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, /* @__PURE__ */ React_default.createElement(
		SettingSlider, {
			setting: Settings_default.emojiSize,
			label: "Emoji Size",
			description: "The size of the Emoji in pixels",
			stickToMarkers: true,
			sortedMarkers: true,
			equidistant: true,
			markers: emojiSizes,
			minValue: emojiSizes[0],
			maxValue: emojiSizes[emojiSizes.length - 1],
			onValueRender: Math.round
		}
	), /* @__PURE__ */ React_default.createElement(
		SettingSlider, {
			setting: Settings_default.emojiRenderSize,
			label: "Saved Emoji Size",
			markers: emojiRenderSizes,
			minValue: emojiRenderSizes[0],
			maxValue: emojiRenderSizes[emojiRenderSizes.length - 1],
			onValueRender: Math.round
		}
	));
};

// src/Emojis/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent_default, null);
module.exports = () => Plugin_default;
