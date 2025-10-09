/**
 * @name Tabbys
 * @description Adds Browser like tabs/bookmarks for channels
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Tabbys
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Tabbys/Tabbys.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "Tabbys",
		"version": "1.0.0",
		"description": "Adds Browser like tabs/bookmarks for channels",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/Tabbys/Tabbys.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/Tabbys",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"size": 32,
		"tabMinWidth": 150,
		"tabWidth": 250,
		"showSettingsButton": true,
		"showTabbar": true,
		"showBookmarkbar": false,
		"keepTitle": false,
		"privacyMode": false,
		"showTabUnreads": true,
		"showTabPings": true,
		"showTabTyping": true,
		"highlightTabUnread": true,
		"showBookmarkUnreads": true,
		"showBookmarkPings": true,
		"showBookmarkTyping": true,
		"highlightBookmarkUnread": true,
		"showFolderUnreads": true,
		"showFolderPings": true,
		"showFolderTyping": true,
		"highlightFolderUnread": true
	}
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var Data = /* @__PURE__ */ (() => Api.Data)();
var React = /* @__PURE__ */ (() => Api.React)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var Webpack = /* @__PURE__ */ (() => Api.Webpack)();
var getOwnerInstance = /* @__PURE__ */ (() => Api.ReactUtils.getOwnerInstance.bind(Api.ReactUtils))();

// common/React.jsx
var useState = /* @__PURE__ */ (() => React.useState)();
var useContext = /* @__PURE__ */ (() => React.useContext)();
var useEffect = /* @__PURE__ */ (() => React.useEffect)();
var useRef = /* @__PURE__ */ (() => React.useRef)();
var React_default = /* @__PURE__ */ (() => React)();
var NoopComponent = () => null;
var LazyComponent = (get) => {
	const Comp = (props) => {
		const Component = get() ?? NoopComponent;
		return /* @__PURE__ */ React.createElement(Component, { ...props });
	};
	return Comp;
};

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

// src/Tabbys/styles.css
StylesLoader_default.push(`



.no-drag{
	-webkit-app-region: no-drag;
}

.df{
	display:flex;
}

.fcc{
	display:flex;
	align-items:center;
	justify-content:center;
}


.rounded-full{
	border-radius: var(--radius-round);
}

.box-border{
	box-sizing:border-box;
}

.pointer-pointer{
	cursor:pointer;
}


.ellipsis{
	
}

:root{
	/* overrides */
	
	--tabbys-bookmarkbar-height: calc(var(--custom-app-top-bar-height) - 5px);
	
	/* Sizes */
	--size:32px;
	--tabbys-btn-size:calc(var(--size) * .8);
	--tabbys-tab-btn-size:calc(var(--size) * .6);
	--radius-round: calc(infinity * 1px);
	--tabs-gap:8px;
	--bookmarks-gap:8px;
	--folder-gap:8px;
	
	/* Cosmetiques */
	--ping: rgb(218, 62, 68);
	--unread: rgb(88, 101, 242);
	--svg-color:#fff;
}

:root{ 
	/* --tabbys-bg:var(--neutral-5); */
	--tabbys-bg-hover: var(--background-mod-normal);
	--tabbys-bg-selected: var(--background-mod-strong);
	
	--tabbys-text: var(--interactive-normal);
	--tabbys-text-unread:var(--interactive-active);
	
	--tabbys-btn-color:var(--interactive-normal);
	--tabbys-btn-color-hover:var(--interactive-hover);
	--tabbys-btn-color-active:var(--interactive-active);

	--tabbys-btn-bg:var(--background-accent);
	--tabbys-btn-bg-hover:var(--interactive-muted);
	--tabbys-btn-bg-active:var(--background-mod-strong);
	
	--tabbys-folder-menu-bg:var(--background-surface-highest);
}

.Tabbys-menuitem-new-tab-to-left svg,
.Tabbys-menuitem-close-tabs-to-left svg {
	rotate: 180deg;
}

.card {
	display: flex;
	line-height: 150%;
	align-items: center;
	height: var(--size);
	transform: translate(0);
	gap: 8px;
	padding: 0 4px;
	font-size: calc(var(--size) * 0.5);
	color: var(--tabbys-text);
	border-radius: calc(var(--size) * 0.2);
}

.card-title{
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	flex: 1 1 0;
}

.card:hover {
	background: var(--tabbys-bg-hover);
}

.card.hasUnread {
	color: var(--tabbys-text-unread);
}

.card:active,
.card.isSelected {
	background: var(--tabbys-bg-selected);
}

.card-icon {
	pointer-events: none;
	flex: 0 0 auto;
	width: calc(var(--size) * 0.75);
	height: calc(var(--size) * 0.75);
	border-radius: var(--radius-round);
}

.user-avatar {
	/* flex:0 0 auto; */
}

.card img {
	border-radius: inherit;
}

.icon-wrapper img,
.icon-wrapper svg {
	height: 100%;
	width: 100%;
}

.icon-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	overflow: hidden;
}

.discord-icon {
	color: white;
	background: #6361f8;
	padding: 4px;
}

.typing-dots {
	flex: 0 0 auto;
}
`);

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function waitForComponent(filter, options) {
	let myValue = () => {};
	const lazyComponent = LazyComponent(() => myValue);
	waitForModule(filter, options).then((v) => {
		myValue = v;
		Object.assign(lazyComponent, v);
	});
	return lazyComponent;
}

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target) => target[type] && filter(target[type]);
}

function getModuleAndKey(filter, options) {
	let module2;
	const target = getModule((entry, m2) => filter(entry) ? module2 = m2 : false, options);
	module2 = module2?.exports;
	if (!module2) return;
	const key = Object.keys(module2).find((k) => module2[k] === target);
	if (!key) return;
	return { module: module2, key };
}

// common/DiscordModules/Modules.js
var DiscordPopout = /* @__PURE__ */ (() => getModule((a) => a?.prototype?.render && a.Animation, { searchExports: true }))();
var Dispatcher = /* @__PURE__ */ (() => getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: false }))();
var transitionTo = /* @__PURE__ */ (() => getModule(Filters.byStrings(`"transitionTo - Transitioning to "`), { searchExports: true }))();
var DragSource = /* @__PURE__ */ (() => getModule(Filters.byStrings("drag-source", "collect"), { searchExports: true }))();
var DropTarget = /* @__PURE__ */ (() => getModule(Filters.byStrings("drop-target", "collect"), { searchExports: true }))();
var FieldWrapper = /* @__PURE__ */ (() => getModule(reactRefMemoFilter("render", "fieldWrapper", "title", "titleId"), { searchExports: true }))();
var IconsUtils = /* @__PURE__ */ (() => getModule((a) => a.getChannelIconURL))();
var ChannelUtils = /* @__PURE__ */ (() => getModule((m2) => m2.openPrivateChannel))();

// src/Tabbys/patches/lotgoutInterceptor.js
Plugin_default.on(Events.START, () => {
	function interceptor(e2) {
		if (e2.type !== "LOGOUT") return;
		e2.goHomeAfterSwitching = false;
	}
	Dispatcher.addInterceptor(interceptor);
	Plugin_default.once(Events.STOP, () => {
		const index = Dispatcher._interceptors.indexOf(interceptor);
		Dispatcher._interceptors.splice(index, 1);
	});
});

// common/Utils/index.js
function clsx(prefix) {
	return (...args) => args.filter(Boolean).map((a) => `${prefix}-${a}`).join(" ");
}

function getPathName(url) {
	try {
		return new URL(url).pathname;
	} catch {}
}

function debounce(func, wait = 166) {
	let timeout;

	function debounced(...args) {
		const later = () => {
			func.apply(this, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	}
	debounced.clear = () => {
		clearTimeout(timeout);
	};
	return debounced;
}

function shallow(objA, objB) {
	if (Object.is(objA, objB)) return true;
	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;
	const keysA = Object.keys(objA);
	if (keysA.length !== Object.keys(objB).length) return false;
	for (let i = 0; i < keysA.length; i++)
		if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;
	return true;
}

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

function getNestedProp(obj, path2) {
	return path2.split(".").reduce((ob, prop) => ob?.[prop], obj);
}

function reRender(selector) {
	const target = document.querySelector(selector)?.parentElement;
	if (!target) return;
	const instance = getOwnerInstance(target);
	const unpatch = Patcher.instead(instance, "render", () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}
var nop = () => {};

// common/DiscordModules/zustand.js
var { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});
var subscribeWithSelector = getModule(Filters.byStrings("equalityFn", "fireImmediately"), { searchExports: true });
var zustand_default = zustand;

// common/Utils/Array.js
function set(array, index, item) {
	return array.toSpliced(index, 1, item);
}

function remove(array, index) {
	return array.toSpliced(index, 1);
}

function removeMany(array, indices) {
	return array.filter((_, i) => indices.indexOf(i) === -1);
}

function add(array, item, index) {
	return array.toSpliced(index ?? array.length, 0, item);
}

function slice(array, from, to) {
	return array.slice(from, to);
}

function arrayMove(array, from, to) {
	const newArray = array.slice();
	newArray.splice(to, 0, newArray.splice(from, 1)[0]);
	return newArray;
}

function meta2(array, filter) {
	const index = array.findIndex(filter);
	if (index === -1) return { items: null };
	return {
		index,
		length: array.length,
		item: array[index],
		isSingle: array.length === 1,
		isFirst: index === 0,
		isLast: index === array.length - 1,
		nextItem: array[index + 1],
		previousItem: array[index - 1]
	};
}

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = getStore("UserStore");

// common/Utils/String.js
function isValidString(string) {
	return string && string.length > 0;
}

function join(char = "", ...strs) {
	return strs.filter(Boolean).join(char);
}

// MODULES-AUTO-LOADER:@Stores/ChannelStore
var ChannelStore_default = getStore("ChannelStore");

// common/Utils/User.js
function getUserName(userObject = {}) {
	const { global_name, globalName, username } = userObject;
	if (isValidString(global_name)) return global_name;
	if (isValidString(globalName)) return globalName;
	if (isValidString(username)) return username;
}

// src/Tabbys/consts.js
var DNDTypes = {
	TAB: "TAB",
	BOOKMARK: "BOOKMARK",
	SUB_BOOKMARK: "SUB_BOOKMARK",
	SUB_FOLDER: "SUB_FOLDER",
	DRAGGABLE_GUILD_CHANNEL: "DRAGGABLE_GUILD_CHANNEL",
	FOLDER: "FOLDER"
};
var pathTypes = {
	QUESTS: "QUESTS",
	APPS: "APPS",
	SERVERS: "SERVERS",
	VERIFICATION: "VERIFICATION",
	SHOP: "SHOP",
	NITRO: "NITRO",
	HOME: "HOME",
	CHANNEL: "CHANNEL",
	DM: "DM"
};

// MODULES-AUTO-LOADER:@Stores/UserGuildJoinRequestStore
var UserGuildJoinRequestStore_default = getStore("UserGuildJoinRequestStore");

// common/DiscordModules/Enums.js
var GuildFeaturesEnum = getModule(Filters.byKeys("CLYDE_ENABLED"), { searchExports: true }) || {
	"CLYDE_ENABLED": "CLYDE_ENABLED"
};
var EmojiSendAvailabilityEnum = getModule(Filters.byKeys("GUILD_SUBSCRIPTION_UNAVAILABLE"), { searchExports: true }) || {
	"PREMIUM_LOCKED": 2
};
var EmojiIntentionEnum = getModule(Filters.byKeys("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true }) || {
	"CHAT": 3
};
var DiscordPermissionsEnum = getModule(Filters.byKeys("ADD_REACTIONS"), { searchExports: true }) || {
	"EMBED_LINKS": "16384n",
	"USE_EXTERNAL_EMOJIS": "262144n"
};
var StickerTypeEnum = getModule(Filters.byKeys("GUILD", "STANDARD"), { searchExports: true }) || {
	"STANDARD": 1,
	"GUILD": 2
};
var ProfileTypeEnum = getModule(Filters.byKeys("POPOUT", "SETTINGS"), { searchExports: true }) || {
	"POPOUT": 0,
	"MODAL": 1,
	"SETTINGS": 2,
	"PANEL": 3,
	"CARD": 4
};
var ChannelTypeEnum = getModule(Filters.byKeys("GUILD_TEXT", "DM"), { searchExports: true }) || {
	"GUILD_CATEGORY": 4,
	"0": "GUILD_TEXT",
	"1": "DM",
	"2": "GUILD_VOICE",
	"3": "GROUP_DM",
	"4": "GUILD_CATEGORY",
	"5": "GUILD_ANNOUNCEMENT",
	"6": "GUILD_STORE",
	"10": "ANNOUNCEMENT_THREAD",
	"11": "PUBLIC_THREAD",
	"12": "PRIVATE_THREAD",
	"13": "GUILD_STAGE_VOICE",
	"14": "GUILD_DIRECTORY",
	"15": "GUILD_FORUM",
	"16": "GUILD_MEDIA",
	"17": "LOBBY",
	"18": "DM_SDK",
	"10000": "UNKNOWN"
};

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = getStore("SelectedChannelStore");

// src/Tabbys/utils.js
function getGuildChannelPath(guildId) {
	const selectedChannelId = SelectedChannelStore_default.getChannelId(guildId);
	return `/channels/${guildId}/${selectedChannelId}`;
}
var types = {
	"store": { title: "Nitro", type: pathTypes.NITRO },
	"shop": { title: "Shop", type: pathTypes.SHOP },
	"servers": { title: "Servers", type: pathTypes.SERVERS },
	"applications": { title: "Applications", type: pathTypes.APPS },
	"quests": { title: "Quests", type: pathTypes.QUESTS },
	"home": { title: "Home", type: pathTypes.HOME },
	"unknown": { type: null, title: "Unknown" }
};
var channelRegex = /\/channels\/(@me|@favorites|\d+)\/(\d+)\/?(?:threads\/(\d+))?/;

function parsePath(path2) {
	if (path2.startsWith("/member-verification")) {
		const id = path2.split("/").pop();
		const guild = UserGuildJoinRequestStore_default.getJoinRequestGuild(id);
		if (!guild) return types.unknown;
		return {
			title: guild.name,
			type: null
		};
	}
	if (path2 === "/shop") return types.shop;
	if (path2 === "/store") return types.store;
	if (path2 === "/channels/@me") return types.home;
	if (path2 === "/quest-home") return types.quests;
	if (path2.startsWith("/discovery/")) {
		const category = path2.split("/")[2];
		if (category === "servers" || category === "applications" || category === "quests") return types[category];
		else types.unknown;
	}
	const channelMatch = path2.match(channelRegex);
	if (!channelMatch) return types.unknown;
	const [, guildId, channelId, threadId] = channelMatch;
	const channel = ChannelStore_default.getChannel(threadId || channelId);
	if (!channel) return types.unknown;
	if (channel.isDM()) {
		const user = UserStore_default.getUser(channel.recipients[0]);
		if (!user) return types.unknown;
		return {
			type: pathTypes.DM,
			channelId: channel.id,
			path: constructPath("@me", channelId),
			username: user.username,
			avatar: user.avatar,
			userId: user.id
		};
	}
	return {
		guildId,
		channelId: threadId || channelId,
		type: pathTypes.CHANNEL,
		path: constructPath(guildId, channelId, threadId)
	};
}

function constructPath(guildId, channelId, threadId) {
	let path2 = `/channels/${guildId}/${channelId}/`;
	if (threadId) path2 += `threads/${threadId}/`;
	return path2;
}

function navigate(tab) {
	if (tab.type === pathTypes.DM) {
		const channel = ChannelStore_default.getChannel(tab.channelId);
		if (channel) return transitionTo(tab.path);
		return ChannelUtils.openPrivateChannel({ recipientIds: [tab.userId] });
	}
	return transitionTo(tab.path);
}

// src/Tabbys/Store/shared.js
function getArrayItemById(arr, id) {
	return arr.findIndex((a) => a.id === id);
}

function reOrder(arr, fromId, toId, pos) {
	const fromIndex = getArrayItemById(arr, fromId);
	let toIndex = getArrayItemById(arr, toId);
	if (fromIndex === -1 || toIndex === -1) return arr;
	if (pos === "before" && toIndex > fromIndex) toIndex--;
	if (pos === "after" && toIndex < fromIndex) toIndex++;
	return arrayMove(arr, fromIndex, toIndex);
}

function addBy(arr, targetId, payload, fn = (a) => a) {
	const targetIndex = targetId ? getArrayItemById(arr, targetId) : arr.length;
	if (targetIndex === -1) return arr;
	return add(arr, payload, fn(targetIndex));
}

function setArrayItem(arr, targetId, payload) {
	const tabIndex = getArrayItemById(arr, targetId);
	if (tabIndex === -1) return arr;
	return set(arr, tabIndex, payload);
}

function mergeArrayItem(arr, targetId, payload) {
	const tabIndex = getArrayItemById(arr, targetId);
	const item = arr[tabIndex];
	if (!item) return arr;
	return set(arr, tabIndex, Object.assign({}, item, payload));
}

function createFolder(name) {
	return { id: crypto.randomUUID(), name, items: [] };
}

function createBookmarkFolder(folderId, parentId) {
	return { id: crypto.randomUUID(), folderId, parentId };
}

function createSubBookmark(folderId, path2) {
	const bookmark = createFromPath(path2);
	return Object.assign({ parentId: folderId }, bookmark);
}

function createFromPath(path2 = "/channels/@me") {
	return Object.assign({ id: crypto.randomUUID(), path: path2 }, parsePath(path2));
}

function createFrom(...objs) {
	return Object.assign({}, ...objs, { id: crypto.randomUUID() });
}

function sort(pos) {
	return (index) => pos === "after" ? index + 1 : index;
}

// src/Tabbys/Store/tabs.js
var getters = {
	getTabIndex(id) {
		return this.state.tabs.findIndex((tab) => tab.id === id);
	},
	getSelectedTabIndex() {
		return this.getTabIndex(this.state.selectedId);
	},
	getTab(id) {
		return this.state.tabs[this.getTabIndex(id)];
	},
	getSelectedTab() {
		return this.state.tabs[this.getSelectedTabIndex()];
	},
	getTabMeta(id) {
		return meta2(this.state.tabs, (tab) => tab.id === id);
	},
	getTabsCount() {
		return this.state.tabs.length;
	}
};
var setters = {
	setTabs(tabs) {
		if (tabs && Array.isArray(tabs)) this.setState({ tabs });
	},
	setSelectedId(id) {
		if (this.getTabIndex(id) === -1) return;
		this.setState({ selectedId: id, lastSelectedIdAfterNewTab: null });
	},
	setTab(tabId, payload) {
		this.setState({ tabs: setArrayItem(this.state.tabs, tabId, payload) });
	},
	updateTab(tabId, payload) {
		this.setState({ tabs: mergeArrayItem(this.state.tabs, tabId, payload) });
	},
	setTabPath(tabId, path2) {
		if (path2) this.setTab(tabId, { id: tabId, path: path2, ...parsePath(path2) });
	}
};
var tabs_default = {
	state: {
		tabs: [],
		selectedId: null,
		lastSelectedIdAfterNewTab: null
	},
	selectors: {
		tabs: (state) => state.tabs,
		// isSingleTab: state => state.tabs.length === 1,
		selectedId: (state) => state.selectedId,
		lastSelectedIdAfterNewTab: (state) => state.lastSelectedIdAfterNewTab
	},
	actions: {
		...getters,
		...setters,
		newTab(path2) {
			const { selectedId, tabs } = this.state;
			const tab = createFromPath(path2);
			this.setState({
				tabs: add(tabs, tab),
				selectedId: tab.id,
				lastSelectedIdAfterNewTab: selectedId
			});
		},
		reOrderTabs(fromId, toId, pos) {
			this.setTabs(reOrder(this.state.tabs, fromId, toId, pos));
		},
		addTabBy(tab, targetId, fn) {
			this.setState({ tabs: addBy(this.state.tabs, targetId, tab, fn) });
		},
		addTab(path2) {
			this.addTabBy(createFromPath(path2));
		},
		addTabToRight(tabId) {
			this.addTabBy(createFromPath(), tabId, (a) => a + 1);
		},
		addTabToLeft(tabId) {
			this.addTabBy(createFromPath(), tabId);
		},
		duplicateTab(tabId) {
			const tab = this.getTab(tabId);
			if (tab) this.addTabBy(createFrom(tab), tabId, (a) => a + 1);
		},
		removeTab(id) {
			const { selectedId, lastSelectedIdAfterNewTab, tabs } = this.state;
			if (tabs.length === 1) return;
			const { index, nextItem: next, previousItem: previous, isSingle } = this.getTabMeta(id);
			const isSelected = selectedId === id;
			const newSelected = !isSelected ? selectedId : lastSelectedIdAfterNewTab ? lastSelectedIdAfterNewTab : next ? next.id : previous.id;
			this.setState({
				tabs: remove(tabs, index),
				selectedId: newSelected,
				lastSelectedIdAfterNewTab: null
			});
		}
	}
};

// src/Tabbys/Store/methods.js
function isDescendent(parentId, childId) {
	const child = Store_default.getFolder(childId);
	if (!child.parentId) return false;
	if (child.parentId === parentId) return true;
	return isDescendent(parentId, child.parentId);
}

function deleteBookmark(itemId, parentId) {
	if (parentId) Store_default.removeItemFromFolder(parentId, itemId);
	else Store_default.removeBookmark(itemId);
}

function deleteFolder(folderId, itemId, parentId) {
	Store_default.deleteFolder(folderId);
	deleteBookmark(itemId, parentId);
}

function getBookmark(bookmarkId, folderId) {
	return folderId ? Store_default.getFolderItem(folderId, bookmarkId) : Store_default.getBookmark(bookmarkId);
}

function setBookmarkName(bookmarkId, name, parentId) {
	const bookmark = getBookmark(bookmarkId, parentId);
	if (!bookmark) return;
	if (parentId) Store_default.updateFolderItem(parentId, bookmarkId, { name });
	else Store_default.updateBookmark(bookmarkId, { name });
}

function getBookmarkNameState(bookmarkId, parentId) {
	const bookmark = getBookmark(bookmarkId, parentId);
	return bookmark?.noName;
}

function toggleBookmarkNameState(bookmarkId, parentId) {
	const bookmark = getBookmark(bookmarkId, parentId);
	if (!bookmark) return;
	if (parentId) Store_default.updateFolderItem(parentId, bookmarkId, { noName: !bookmark.noName });
	else Store_default.updateBookmark(bookmarkId, { noName: !bookmark.noName });
}

function ensureTab() {
	if (Store_default.getTabsCount() > 0) return;
	const tab = createFromPath(location.pathname);
	Store_default.setState({ tabs: [tab], selectedId: tab.id });
}

function openBookmark(bookmarkId, folderId) {
	const bookmark = getBookmark(bookmarkId, folderId);
	if (bookmark) navigate(bookmark);
}

function setTabFromBookmark(tabId, bookmarkId, folderId) {
	const { noName, id, ...bookmark } = getBookmark(bookmarkId, folderId) || {};
	if (bookmark) Store_default.updateTab(tabId, bookmark);
	Store_default.setSelectedId(tabId);
}

function addFolder(name) {
	if (!name) return;
	const folder = createFolder(name);
	const bookmark = createBookmarkFolder(folder.id);
	Store_default.setState({
		folders: add(Store_default.state.folders, folder),
		bookmarks: add(Store_default.state.bookmarks, bookmark)
	});
}

function addSubFolder(name, parentId) {
	if (!name) return;
	const folder = createFolder(name);
	Store_default.setState({ folders: add(Store_default.state.folders, folder) });
	Store_default.addFolderToFolder(parentId, folder.id);
}

function removeTabsToRight(id) {
	const { item, index, isLast, isSingle } = Store_default.getTabMeta(id);
	if (!item || isLast || isSingle) return;
	const newSelected = Store_default.getSelectedTabIndex() < index + 1 ? Store_default.state.selectedId : id;
	Store_default.setState({
		tabs: slice(Store_default.state.tabs, 0, index + 1),
		selectedId: newSelected,
		lastSelectedIdAfterNewTab: null
	});
}

function removeTabsToLeft(id) {
	const { item, index, isFirst, isSingle, length } = Store_default.getTabMeta(id);
	if (!item || isFirst || isSingle) return;
	const newSelected = Store_default.getSelectedTabIndex() > index ? Store_default.state.selectedId : id;
	Store_default.setState({
		tabs: slice(Store_default.state.tabs, index, length),
		selectedId: newSelected,
		lastSelectedIdAfterNewTab: null
	});
}

function removeOtherTabs(id) {
	const tab = Store_default.getTab(id);
	if (tab) Store_default.setState({ tabs: [tab], selectedId: tab.id, lastSelectedIdAfterNewTab: null });
}

function openTabAt(path2, targetId, pos) {
	Store_default.addTabBy(createFromPath(path2), targetId, sort(pos));
}

function openBookmarkAt(bookmarkId, targetId, pos, folderId) {
	const { path: path2 } = getBookmark(bookmarkId, folderId) || {};
	if (path2) openTabAt(path2, targetId, pos);
}

function addBookmarkAt(path2, targetId, pos) {
	Store_default.addBookmarkBy(createFromPath(path2), targetId, sort(pos));
}

function bookmarkTabAt(tabId, targetId, pos) {
	const { path: path2 } = Store_default.getTab(tabId) || {};
	if (path2) addBookmarkAt(path2, targetId, pos);
}

function moveSubBookmarkToBookmarksAt(itemId, parentId, targetId, pos) {
	const subBookmark = Store_default.getFolderItem(parentId, itemId);
	if (!subBookmark) return;
	Store_default.addBookmarkBy(createFrom(subBookmark, { parentId: null }), targetId, sort(pos));
	Store_default.removeItemFromFolder(parentId, itemId);
}

function moveSubFolderToBookmarksAt(subFolderId, itemId, parentId, targetId, pos) {
	const folder = createBookmarkFolder(subFolderId);
	Store_default.addBookmarkBy(folder, targetId, sort(pos));
	Store_default.removeItemFromFolder(parentId, itemId);
	Store_default.updateFolder(subFolderId, { parentId: null });
}

function addToFolderAt(path2, folderId, targetId, pos) {
	return Store_default.addToFolderBy(folderId, createSubBookmark(folderId, path2), targetId, sort(pos));
}

function addTabToFolderAt(tabId, folderId, targetId, pos) {
	const { path: path2 } = Store_default.getTab(tabId) || {};
	if (path2) addToFolderAt(path2, folderId, targetId, pos);
}

function moveBookmarkToFolderAt(itemId, targetFolderId, parentId, targetId, pos) {
	const bookmark = getBookmark(itemId, parentId);
	deleteBookmark(itemId, parentId);
	Store_default.addToFolderBy(targetFolderId, createFrom(bookmark, { parentId: targetFolderId }), targetId, sort(pos));
}

function moveFolderToFolderAt(folderId, itemId, targetFolderId, parentId, targetId, pos) {
	if (isDescendent(folderId, targetFolderId)) return;
	deleteBookmark(itemId, parentId);
	Store_default.addToFolderBy(targetFolderId, createBookmarkFolder(folderId, targetFolderId), targetId, sort(pos));
	Store_default.updateFolder(folderId, { parentId: targetFolderId });
}

// src/Tabbys/Store/folders.js
var getters2 = {
	getFolderIndex(folderId) {
		return this.state.folders.findIndex((a) => a.id === folderId);
	},
	getFolder(folderId) {
		return this.state.folders[this.getFolderIndex(folderId)];
	},
	getFolderItemIndex(folderId, itemId) {
		const folder = this.getFolder(folderId);
		if (!folder) return -1;
		return folder.items.findIndex((a) => a.id === itemId);
	},
	getFolderItems(folderId) {
		const folder = this.getFolder(folderId);
		if (!folder) return;
		return folder.items;
	},
	getFolderItem(folderId, itemId) {
		const folder = this.getFolder(folderId);
		if (!folder) return;
		const itemIndex = this.getFolderItemIndex(folderId, itemId);
		return folder.items[itemIndex];
	}
};
var setters2 = {
	setFolders(folders) {
		if (folders && Array.isArray(folders)) this.setState({ folders });
	},
	setFolder(folderId, payload) {
		this.setState({ folders: setArrayItem(this.state.folders, folderId, payload) });
	},
	updateFolder(folderId, payload) {
		this.setState({ folders: mergeArrayItem(this.state.folders, folderId, payload) });
	},
	setFolderName(folderId, name) {
		if (name) this.updateFolder(folderId, { name });
	},
	setFolderItems(folderId, items) {
		if (items && Array.isArray(items)) this.updateFolder(folderId, { items });
	},
	setFolderItem(folderId, itemId, payload) {
		const items = this.getFolderItems(folderId);
		this.setFolderItems(folderId, setArrayItem(items, itemId, payload));
	},
	updateFolderItem(folderId, itemId, payload) {
		const items = this.getFolderItems(folderId);
		this.setFolderItems(folderId, mergeArrayItem(items, itemId, payload));
	}
};
var folders_default = {
	state: {
		folders: []
	},
	selectors: {
		folders: (state) => state.folders
	},
	actions: {
		...getters2,
		...setters2,
		reOrderFolder(folderId, fromId, toId, pos) {
			const items = this.getFolderItems(folderId);
			this.setFolderItems(folderId, reOrder(items, fromId, toId, pos));
		},
		addToFolderBy(folderId, bookmark, targetId, fn) {
			const items = this.getFolderItems(folderId);
			if (items) this.updateFolder(folderId, { items: addBy(items, targetId, bookmark, fn) });
		},
		addToFolder(folderId, path2) {
			this.addToFolderBy(folderId, createSubBookmark(folderId, path2));
		},
		addFolderToFolder(parentId, folderId) {
			this.addToFolderBy(parentId, createBookmarkFolder(folderId, parentId));
		},
		removeItemFromFolder(folderId, itemId) {
			const folder = this.getFolder(folderId);
			if (!folder) return;
			const itemIndex = this.getFolderItemIndex(folderId, itemId);
			if (itemIndex === -1) return;
			const item = folder.items[itemIndex];
			this.updateFolder(folderId, { items: remove(folder.items, itemIndex) });
		},
		deleteFolder(folderId) {
			const { folders } = this.state;
			const folderIndex = this.getFolderIndex(folderId);
			if (folderIndex === -1) return;
			const getIndices = (folderId2) => {
				const folder = this.getFolder(folderId2);
				let index = folder.items.length;
				const indices2 = [];
				while (index--) {
					const item = folder.items[index];
					if (!item.folderId) continue;
					indices2.push(this.getFolderIndex(item.folderId), ...getIndices(item.folderId));
				}
				return indices2;
			};
			const indices = getIndices(folderId);
			this.setState({ folders: removeMany(folders, [folderIndex, ...indices]) });
		}
	}
};

// src/Tabbys/Store/bookmarks.js
var getters3 = {
	getBookmarkIndex(id) {
		return this.state.bookmarks.findIndex((bookmark) => bookmark.id === id);
	},
	getBookmark(id) {
		return this.state.bookmarks[this.getBookmarkIndex(id)];
	},
	getBookmarkMeta(id) {
		return meta(this.state.bookmarks, (bookmark) => bookmark.id === id);
	},
	getBookmarksCount() {
		return this.state.bookmarks.length;
	}
};
var setters3 = {
	setBookmarks(bookmarks) {
		if (bookmarks && Array.isArray(bookmarks)) this.setState({ bookmarks });
	},
	setBookmark(bookmarkId, payload) {
		this.setState({ bookmarks: setArrayItem(this.state.bookmarks, bookmarkId, payload) });
	},
	updateBookmark(bookmarkId, payload) {
		this.setState({ bookmarks: mergeArrayItem(this.state.bookmarks, bookmarkId, payload) });
	},
	setBookmarkName(bookmarkId, name) {
		if (name) this.updateBookmark(bookmarkId, { name });
	}
};
var bookmarks_default = {
	state: {
		bookmarks: []
	},
	selectors: {
		bookmarks: (state) => state.bookmarks
	},
	actions: {
		...getters3,
		...setters3,
		reOrderBookmarks(fromId, toId, pos) {
			this.setBookmarks(reOrder(this.state.bookmarks, fromId, toId, pos));
		},
		addBookmarkBy(bookmark, targetId, fn = (a) => a) {
			this.setState({ bookmarks: addBy(this.state.bookmarks, targetId, bookmark, fn) });
		},
		addBookmark(path2) {
			this.addBookmarkBy(createFromPath(path2));
		},
		removeBookmark(id) {
			const bookmarks = this.state.bookmarks;
			const index = bookmarks.findIndex((a) => a.id === id);
			if (index === -1) return;
			this.setState({ bookmarks: remove(bookmarks, index) });
		}
	}
};

// src/Tabbys/Store/index.js
var initialState = {
	...tabs_default.state,
	...folders_default.state,
	...bookmarks_default.state
};
var Store = zustand_default(subscribeWithSelector(() => initialState));
Object.defineProperty(Store, "state", {
	configurable: false,
	get: () => Store.getState()
});
Object.defineProperty(Store, "selectors", {
	value: Object.assign({}, folders_default.selectors, tabs_default.selectors, bookmarks_default.selectors)
});
Object.assign(Store, tabs_default.actions, bookmarks_default.actions, folders_default.actions);
Store.subscribe(
	(state) => state,
	() => {
		const user = UserStore_default.getCurrentUser();
		Data.save(user.id, Store.state);
	},
	shallow
);
Store.subscribe(Store.selectors.selectedId, () => {
	const selectedTab = Store.getSelectedTab();
	if (!selectedTab) return;
	if (selectedTab?.path === location.pathname) return;
	navigate(selectedTab);
});
Store.subscribe(
	() => Store.getSelectedTab(),
	(tab, o) => {
		if (tab?.path === o?.path) return;
		if (tab?.path === location.pathname) return;
		navigate(tab);
	},
	shallow
);
var onLocationChange = debounce((e2) => {
	const pathname = getPathName(e2.destination.url);
	if (!pathname) return;
	const selectedTab = Store.getSelectedTab();
	if (selectedTab?.path === pathname) return;
	Store.setTabPath(Store.state.selectedId, pathname);
}, 50);

function hydrateStore() {
	const user = UserStore_default.getCurrentUser();
	if (Store.state.user?.id === user.id) return;
	const userData = Data.load(user.id) || initialState;
	Store.setState({ ...userData });
	ensureTab();
}
Plugin_default.on(Events.START, () => {
	hydrateStore();
	window.navigation.addEventListener("navigate", onLocationChange);
	Dispatcher.subscribe("CONNECTION_OPEN", hydrateStore);
});
Plugin_default.on(Events.STOP, () => {
	window.navigation.removeEventListener("navigate", onLocationChange);
	Dispatcher.unsubscribe("CONNECTION_OPEN", hydrateStore);
});
var Store_default = Store;

// src/Tabbys/patches/patchChannelClick.js
var channelFilter = Filters.byStrings("href", "children", "onClick", "onKeyPress", "focusProps");
var channelComponent = getModule((a) => a.render && channelFilter(a.render), { searchExports: true });
Plugin_default.on(Events.START, () => {
	if (!channelComponent) return Logger_default.patchError("channelComponent");
	Patcher.after(channelComponent, "render", (_, [props], ret) => {
		const origClick = getNestedProp(ret, "props.children.props.onClick");
		const path2 = props.href;
		if (!path2 || !origClick) return ret;
		ret.props.children.props.onClick = (e2) => {
			e2.preventDefault();
			if (e2.ctrlKey) Store_default.newTab(path2);
			else origClick?.(e2);
		};
	});
});

// common/Utils/Settings.js
var SettingsStoreSelectors = {};
var persistMiddleware = (config) => (set2, get, api) => config((args) => (set2(args), Data.save("settings", get().getRawState())), get, api);
var SettingsStore = Object.assign(
	zustand_default(
		persistMiddleware(
			subscribeWithSelector((set2, get) => {
				const settingsObj = /* @__PURE__ */ Object.create(null);
				for (const [key, value] of Object.entries({
						...Config_default.settings,
						...Data.load("settings")
					})) {
					settingsObj[key] = value;
					settingsObj[`set${key}`] = (newValue) => set2({
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
var PenIcon = svg(null, "m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0 0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0 1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5 1.5 0 0 1-1.73-1.73Z");
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
var IdIcon = svg(null, "M15.3 14.48c-.46.45-1.08.67-1.86.67h-1.39V9.2h1.39c.78 0 1.4.22 1.86.67.46.45.68 1.22.68 2.31 0 1.1-.22 1.86-.68 2.31Z", path({ fillRule: "evenodd" }, "M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm1 15h2.04V7.34H6V17Zm4-9.66V17h3.44c1.46 0 2.6-.42 3.38-1.25.8-.83 1.2-2.02 1.2-3.58s-.4-2.75-1.2-3.58c-.79-.83-1.92-1.25-3.38-1.25H10Z"));

// src/Tabbys/patches/patchContextMenu.jsx
function channelPath(...args) {
	return `/channels/${args.filter(Boolean).join("/")}`;
}

function getPath(channel) {
	switch (channel.type) {
		case ChannelTypeEnum.GUILD_ANNOUNCEMENT:
		case ChannelTypeEnum.GUILD_FORUM:
		case ChannelTypeEnum.GUILD_MEDIA:
		case ChannelTypeEnum.GUILD_TEXT:
			return channelPath(channel.guild_id, channel.id);
		case ChannelTypeEnum.ANNOUNCEMENT_THREAD:
		case ChannelTypeEnum.PUBLIC_THREAD:
		case ChannelTypeEnum.PRIVATE_THREAD:
			return channelPath(channel.guild_id, channel.parent_id, "threads", channel.id);
		case ChannelTypeEnum.DM:
		case ChannelTypeEnum.GROUP_DM:
			return channelPath("@me", channel.id);
	}
}

function menu(path2) {
	const { showBookmarkbar, showTabbar } = Settings_default.state;
	if (!showBookmarkbar && !showTabbar) return;
	const menu2 = [ContextMenu.buildItem({ type: "separator" })];
	const bookmark = {
		action: () => Store_default.addBookmark(path2),
		icon: BookmarkOutlinedIcon,
		label: "Bookmark channel"
	};
	const tab = {
		action: () => Store_default.newTab(path2),
		icon: PlusIcon,
		label: "Open in new Tab"
	};
	const id = `${Config_default.info.name}-channel-options`;
	if (showBookmarkbar && !showTabbar) menu2.push(ContextMenu.buildItem({ id, ...bookmark }));
	else if (!showBookmarkbar && showTabbar) menu2.push(ContextMenu.buildItem({ id, ...tab }));
	else if (showBookmarkbar && showTabbar)
		menu2.push(
			ContextMenu.buildItem({
				type: "submenu",
				id,
				label: Config_default.info.name,
				items: [tab, bookmark]
			})
		);
	return menu2;
}
Plugin_default.on(Events.START, () => {
	const unpatch = [
		...["thread-context", "channel-context"].map(
			(context) => ContextMenu.patch(context, (retVal, { channel, targetIsUser }) => {
				if (!channel || targetIsUser) return;
				const path2 = getPath(channel);
				if (!path2) return;
				retVal.props.children.push(...menu(path2));
			})
		),
		ContextMenu.patch("channel-mention-context", (retVal, { originalLink }) => {
			const path2 = getPathName(originalLink);
			if (!path2) return;
			retVal.props.children.push(...menu(path2));
		}),
		ContextMenu.patch("user-context", (retVal, { user }) => {
			if (user.email) return;
			const channel = ChannelStore_default.getDMChannelFromUserId(user.id);
			if (!channel) return;
			const path2 = getPath(channel);
			if (!path2) return;
			retVal.props.children.push(...menu(path2));
		})
	];
	Plugin_default.once(Events.STOP, () => {
		unpatch.forEach((a) => a && typeof a === "function" && a());
	});
});

// src/Tabbys/patches/patchDMClick.js
var DMChannelFilter = Filters.byStrings("navigate", "location", "href", "createHref");
var DMChannel = getModule((a) => a.render && DMChannelFilter(a.render), { searchExports: true });
Plugin_default.on(Events.START, () => {
	if (!DMChannel) return Logger_default.patchError("DMChannel");
	Patcher.before(DMChannel, "render", (_, [props]) => {
		const path2 = props.to;
		if (!path2) return;
		props.onClick = (e2) => {
			if (e2.ctrlKey) {
				e2.preventDefault();
				Store_default.newTab(path2);
			}
		};
	});
});

// src/Tabbys/patches/patchGuildClick.js
var B = s(325257).exports.Z;
Plugin_default.on(Events.START, () => {
	if (!B) return Logger_default.patchError("GuildComponent");
	Patcher.after(B, "type", (_, [{ guild }], ret) => {
		const targetProps = getNestedProp(ret, "props.children.1.props.children.props.children.props.children.props");
		if (!targetProps) return ret;
		const origClick = targetProps.onClick;
		const path2 = getGuildChannelPath(guild.id);
		targetProps.onClick = (e2) => {
			e2.preventDefault();
			if (e2.ctrlKey) Store_default.newTab(path2);
			else origClick?.(e2);
		};
	});
});

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

// src/Tabbys/components/App/styles.css
StylesLoader_default.push(`div:has(> .tabbys-app-container):not(#a) {
	grid-template-rows: [top] auto [titleBarEnd] min-content [noticeEnd] 1fr [end];
	padding-top: 0;
}

.tabbys-app-container {
	--custom-app-top-bar-height: calc(var(--size));
	--space-32: calc(var(--size));
}

.tabbys-app-container * {
	box-sizing: border-box;
}

.tabbys-app-container {
	grid-column: 1/-1;
	display: grid;
	grid-template-areas: "leading trailing";
	grid-template-columns: minmax(0, 1fr) auto auto;
	transform: translate(0);
	gap: calc(var(--size) * 0.1) 0;
}

.tabbys-app-showTabbar.tabbys-app-showBookmarkbar.tabbys-app-keepTitle {
	grid-template-areas:
		"leading trailing"
		"tabbar tabbar"
		"bookmarkbar bookmarkbar";
	margin-bottom: 3px;
}

.tabbys-app-showTabbar.tabbys-app-showBookmarkbar {
	grid-template-areas:
		"tabbar trailing"
		"bookmarkbar bookmarkbar";
	margin-bottom: 3px;
}

.tabbys-app-showBookmarkbar {
	grid-template-areas: "bookmarkbar trailing";
}

.tabbys-app-showTabbar {
	grid-template-areas: "tabbar trailing";
}

.tabbys-app-showTabbar.tabbys-app-keepTitle {
	grid-template-areas:
		"leading trailing"
		"tabbar tabbar";
	margin-bottom: 3px;
}

.tabbys-app-showBookmarkbar.tabbys-app-keepTitle {
	grid-template-areas:
		"leading trailing"
		"bookmarkbar bookmarkbar";
	margin-bottom: 3px;
}

.tabbys-app-leading {
	grid-area: leading;
	position: relative;
	-webkit-app-region: drag;
}

.tabbys-app-tabbar {
	grid-area: tabbar;
	overflow: hidden;
	margin-right: 3px;
}

.tabbys-app-bookmarkbar {
	grid-area: bookmarkbar;
}

.tabbys-app-trailing {
	grid-area: trailing;
}

.tabbys-app-settings-button {
	color: var(--icon-tertiary);
	cursor: pointer;
}

.tabbys-app-settings-button:hover {
	color: var(--icon-secondary);
}

.tabbys-app-privacyMode .card-icon,
.tabbys-app-privacyMode .card-title{
	position:relative;
}

.tabbys-app-privacyMode .card-icon:after,
.tabbys-app-privacyMode .card-title:after{
	content:"";
	inset:0;
	position:absolute;
	background:currentColor;
	pointer-events
}`);

// common/Utils/css.js
function join2(...args) {
	const classNames = /* @__PURE__ */ new Set();
	for (const arg of args) {
		if (arg && typeof arg === "string") classNames.add(arg);
		else if (Array.isArray(arg)) arg.forEach((name) => classNames.add(name));
		else if (arg && typeof arg === "object") Object.entries(arg).forEach(([name, value]) => value && classNames.add(name));
	}
	return Array.from(classNames).join(" ");
}
var classNameFactory = (prefix = "", connector = "-") => (...args) => {
	const classNames = /* @__PURE__ */ new Set();
	for (const arg of args) {
		if (arg && typeof arg === "string") classNames.add(arg);
		else if (Array.isArray(arg)) arg.forEach((name) => classNames.add(name));
		else if (arg && typeof arg === "object") Object.entries(arg).forEach(([name, value]) => value && classNames.add(name));
	}
	return Array.from(classNames, (name) => `${prefix}${connector}${name}`).join(" ");
};

// src/Tabbys/components/TabBar/styles.css
StylesLoader_default.push(`.tabbar-container {
	display: flex;
	height: 100%;
	max-height: 100%;
	--droppable-gap: var(--tabs-gap);
}

.tabbar-tabs-scroller-content {
	gap: var(--tabs-gap);
	padding: 0 var(--tabs-gap);
}

.tabbar-new-tab {
	height: var(--tabbys-btn-size);
	width: var(--tabbys-btn-size);
	flex: 0 0 var(--tabbys-btn-size);
	margin: 0 5px;
	border-radius: var(--radius-round);
	padding: 3px;
	align-self: center;
	cursor: pointer;
	color: var(--tabbys-btn-color);
}

.tabbar-new-tab:hover {
	background: var(--tabbys-btn-bg-hover);
	color: var(--tabbys-btn-color-hover);
}

.tabbar-new-tab:active {
	background: var(--tabbys-btn-bg-active);
	color: var(--tabbys-btn-color-active);
}
`);

// src/Tabbys/components/TabsScroller/styles.css
StylesLoader_default.push(`.scroller-container {
	display: inline-flex;
	overflow: hidden;
	box-sizing: border-box;
	max-width: 100%;
	max-height: 100%;
	gap: 5px;
}

.scroller-content {
	display: flex;
	overflow: auto hidden;
	min-width: 0;
	flex: 1 0 0;
	scrollbar-width: none;
	box-sizing: border-box;
}

.scroller-btn-start {
	rotate: 180deg;
}

.scroller-btn {
	height: var(--tabbys-btn-size);
	width: var(--tabbys-btn-size);
	aspect-ratio: 1;

	padding: 2px;
	align-self: center;
	cursor: pointer;
	background: #0000;
	color: var(--tabbys-btn-color);
	/* border: 1px solid var(--tabbys-border-subtle); */
}

.scroller-btn:hover {
	background: var(--tabbys-btn-bg-hover);
	color: var(--tabbys-btn-color-hover);
}

.scroller-btn:active {
	background: var(--tabbys-btn-bg-active);
	color: var(--tabbys-btn-color-active);
}
`);

// common/Utils/HTMLElement.js
function getElRect(el) {
	if (!el) return;
	const rect = el.getBoundingClientRect().toJSON();
	rect.el = el;
	return rect;
}

function getElMeta(target) {
	if (!target) return;
	const res = {
		parentMeta: getElRect(target.parentElement),
		nextSiblingMeta: getElRect(target.nextElementSibling),
		previousSiblingMeta: getElRect(target.previousElementSibling),
		targetMeta: getElRect(target)
	};
	return res;
}

function isScrollable(el, dir = "h") {
	switch (dir) {
		case "h":
		case "H":
			return el.scrollWidth > el.clientWidth;
		case "v":
		case "V":
			return el.scrollHeight > el.clientHeight;
	}
}

function easeInOutSin(time) {
	return (1 + Math.sin(Math.PI * time - Math.PI / 2)) / 2;
}

function animate(property, element, to, options = {}, cb = () => {}) {
	const {
		ease = easeInOutSin,
			duration = 300
		// standard
	} = options;
	let start = null;
	const from = element[property];
	let cancelled = false;
	const cancel = () => {
		cancelled = true;
	};
	const step = (timestamp) => {
		if (cancelled) {
			cb(new Error("Animation cancelled"));
			return;
		}
		if (start === null) {
			start = timestamp;
		}
		const time = Math.min(1, (timestamp - start) / duration);
		element[property] = ease(time) * (to - from) + from;
		if (time >= 1) {
			requestAnimationFrame(() => {
				cb(null);
			});
			return;
		}
		requestAnimationFrame(step);
	};
	if (from === to) {
		cb(new Error("Element already at target position"));
		return cancel;
	}
	requestAnimationFrame(step);
	return cancel;
}

// src/Tabbys/components/TabsScroller/index.jsx
function useIsScrollable() {
	const [isOverflowing, setIsOverflowing] = useState(false);
	const scrollerNode = useRef();
	useEffect(() => {
		const node = scrollerNode.current;
		if (!node) return;
		scrollerNode.current = node;
		setIsOverflowing(isScrollable(node));
	}, []);
	useEffect(() => {
		const node = scrollerNode.current;
		if (!node) return;
		const overflowListener = debounce(() => setIsOverflowing(isScrollable(node)));
		const resizeObserver = new ResizeObserver(overflowListener);
		resizeObserver.observe(node);
		const mutationObserver = new MutationObserver(overflowListener);
		mutationObserver.observe(node, { childList: true });
		return () => {
			overflowListener.clear();
			mutationObserver?.disconnect();
			resizeObserver?.disconnect();
		};
	}, []);
	return [scrollerNode, isOverflowing];
}
var c = clsx("scroller");

function TabsScroller({ items, renderItem, shouldScroll, scrollTo, onScrollToEnd, containerClassName, contentClassName, endScrollButtonClassName, scrollButtonClassName, startScrollButtonClassName, getScrollSize }) {
	const [ref, isOverflowing] = useIsScrollable();
	useEffect(() => {
		setTimeout(() => {
			scrollItemIntoView(scrollTo);
		}, 0);
	}, [shouldScroll]);

	function scroll(scrollValue) {
		const scrollerNode = ref.current;
		if (!scrollerNode) return;
		animate("scrollLeft", ref.current, scrollerNode.scrollLeft + scrollValue);
	}

	function scrollDelta() {
		const scrollerNode = ref.current;
		if (!scrollerNode) return;
		return getScrollSize ? getScrollSize(scrollerNode) : scrollerNode.clientWidth / 2;
	}

	function scrollItemIntoView(index) {
		if (index == null) return;
		const scrollerNode = ref.current;
		if (!scrollerNode) return;
		const target = scrollerNode.children[index];
		if (!target) return;
		const { parentMeta, targetMeta, nextSiblingMeta, previousSiblingMeta } = getElMeta(target);
		if (!nextSiblingMeta) return scroll(targetMeta.right + targetMeta.width - parentMeta.right);
		if (!previousSiblingMeta) return scroll(targetMeta.left - targetMeta.width - parentMeta.left);
		if (targetMeta.left < parentMeta.left) return scroll(previousSiblingMeta.right - parentMeta.left);
		if (targetMeta.right > parentMeta.right) return scroll(nextSiblingMeta.left - parentMeta.right);
	}
	return /* @__PURE__ */ React_default.createElement("div", { className: join2(c("container"), containerClassName) }, isOverflowing && // biome-ignore lint/a11y/useButtonType: <explanation>
		/* @__PURE__ */
		React_default.createElement(
			"button", {
				onClick: () => scroll(-1 * scrollDelta()),
				className: join2(c("btn", "btn-start"), "icon-wrapper", "rounded-full", scrollButtonClassName, startScrollButtonClassName)
			},
			/* @__PURE__ */
			React_default.createElement(ArrowIcon, null)
		), /* @__PURE__ */ React_default.createElement(
			"div", {
				ref,
				className: join2(c("content"), contentClassName)
			},
			items.map((item, index) => renderItem(item, index))
		), isOverflowing && // biome-ignore lint/a11y/useButtonType: <explanation>
		/* @__PURE__ */
		React_default.createElement(
			"button", {
				onClick: () => scroll(scrollDelta()),
				className: join2(c("btn", "btn-end"), "icon-wrapper", "rounded-full", scrollButtonClassName, endScrollButtonClassName)
			},
			/* @__PURE__ */
			React_default.createElement(ArrowIcon, null)
		));
}

// src/Tabbys/components/Tab/styles.css
StylesLoader_default.push(`.tab-container {
	width: var(--tab-width, 250px);
	min-width: var(--tab-min-width, 150px);
	flex: 0 1 auto;
}

.tab-canDrop {
	background: dodgerblue !important;
	color: white !important;
}

.tab-close-button {
	z-index: 5;
	padding: 2px;
	cursor: pointer;
	color: var(--tabbys-btn-color);
	border-radius: inherit;

	width: var(--tabbys-tab-btn-size);
	height: var(--tabbys-tab-btn-size);
}

.tab-close-button:hover {
	background: var(--tabbys-btn-bg-hover);
	color: var(--tabbys-btn-color-hover);
}

.tab-close-button:active {
	background: var(--tabbys-btn-bg-active);
	color: var(--tabbys-btn-color-active);
}
`);

// src/Tabbys/components/DND/Sortables/styles.css
StylesLoader_default.push(`.dnd-droppable.dnd-dragInProgress {
	z-index: 999;
	pointer-events: all;
}

.dnd-droppable.dnd-over {
	color: dodgerblue;
}

.dnd-droppable {
	position: absolute;
	height: 100%;
	width: calc(50% + 1px + (var(--droppable-gap) / 2));
	color: #0000;
	z-index: -1;
	pointer-events: none;
}

.dnd-droppable.dnd-before {
	/* background:#f005;  */
	left: calc((var(--droppable-gap) / 2) * -1);
}

.dnd-droppable.dnd-after {
	/* background:#ff05;  */
	right: calc((var(--droppable-gap) / 2) * -1);
}

.dnd-droppable:after {
	content: "";
	position: absolute;
	width: 4px;
	background: currentColor;
	height: 100%;
	z-index: -1;
	border-radius: var(--radius-round);
}

.dnd-droppable.dnd-before:after {
	translate: 50% 0;
	right: 100%;
}

.dnd-droppable.dnd-after:after {
	left: 100%;
	translate: -50% 0;
}

/* overrides */

.tab-container > .dnd-droppable,
.folder-container .dnd-droppable {
	width: calc(100% / 6);
}

/* menu */

.overflow-popout .dnd-droppable {
	position: absolute;
	height: calc(50% + 1px + (var(--droppable-gap) / 2));
	width: 100%;
	left: 0;
	right: unset;
}

.overflow-popout .dnd-droppable.dnd-before {
	top: calc((var(--droppable-gap) / 2) * -1);
}

.overflow-popout .dnd-droppable.dnd-after {
	bottom: calc((var(--droppable-gap) / 2) * -1);
}

.overflow-popout .dnd-droppable:after {
	width: 100%;
	height: 2px;
	left: 0;
	right: unset;
	translate: 0;
}

.overflow-popout .dnd-droppable.dnd-before:after {
	translate: 0 50%;
	bottom: 100%;
}

.overflow-popout .dnd-droppable.dnd-after:after {
	top: 100%;
	translate: 0 -50%;
}

.overflow-popout .folder-container .dnd-droppable {
	height: calc(100% / 6);
}
`);

// src/Tabbys/components/DND/Sortables/DroppableMarkup.jsx
var c2 = classNameFactory("dnd");

function DroppableMarkup({ isOver, canDrop, dropRef, draggedIsMe, dragInProgress, pos }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			ref: dropRef,
			className: c2("droppable", pos, !draggedIsMe && canDrop && isOver && "over", canDrop && dragInProgress && "dragInProgress")
		}
	);
}

// src/Tabbys/components/DND/shared.js
function collect(connect, monitor, props) {
	const item = monitor.getItem();
	return {
		dragInProgress: !!item,
		isOver: monitor.isOver({ shallow: true }),
		canDrop: monitor.canDrop(),
		draggedIsMe: item?.id === props.id,
		dropRef: connect.dropTarget()
	};
}

function makeDraggable(type) {
	return DragSource(type, { beginDrag: (a) => a }, (connect, monitor) => ({
		isDragging: !!monitor.isDragging(),
		dragRef: connect.dragSource()
	}));
}

function makeDroppable(types2, drop) {
	return DropTarget(types2, { drop }, collect);
}

// src/Tabbys/components/DND/Sortables/Tab.jsx
var Tab = makeDroppable(
	[DNDTypes.DRAGGABLE_GUILD_CHANNEL, DNDTypes.TAB, DNDTypes.BOOKMARK, DNDTypes.SUB_BOOKMARK],
	(me, monitor) => {
		const dropped = monitor.getItem();
		if (me.id === dropped.id) return;
		const itemType = monitor.getItemType();
		switch (itemType) {
			case DNDTypes.TAB:
				return Store_default.reOrderTabs(dropped.id, me.id, me.pos);
			case DNDTypes.BOOKMARK:
				return openBookmarkAt(dropped.id, me.id, me.pos);
			case DNDTypes.SUB_BOOKMARK:
				return openBookmarkAt(dropped.id, me.id, me.pos, dropped.parentId);
			case DNDTypes.DRAGGABLE_GUILD_CHANNEL:
				return openTabAt(`/channels/${dropped.guildId}/${dropped.id}`, me.id, me.pos);
		}
	}
)(DroppableMarkup);

function Tab_default({ id }) {
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Tab, {
			id,
			pos: "after"
		}
	), /* @__PURE__ */ React_default.createElement(
		Tab, {
			id,
			pos: "before"
		}
	));
}

// src/Tabbys/components/DND/Sortables/Bookmark.jsx
var Bookmark = makeDroppable(
	[DNDTypes.DRAGGABLE_GUILD_CHANNEL, DNDTypes.BOOKMARK, DNDTypes.TAB, DNDTypes.FOLDER, DNDTypes.SUB_BOOKMARK, DNDTypes.SUB_FOLDER],
	(me, monitor) => {
		const dropped = monitor.getItem();
		if (me.id === dropped.id) return;
		const itemType = monitor.getItemType();
		switch (itemType) {
			case DNDTypes.BOOKMARK:
			case DNDTypes.FOLDER:
				return Store_default.reOrderBookmarks(dropped.id, me.id, me.pos);
			case DNDTypes.TAB:
				return bookmarkTabAt(dropped.id, me.id, me.pos);
			case DNDTypes.SUB_BOOKMARK:
				return moveSubBookmarkToBookmarksAt(dropped.id, dropped.parentId, me.id, me.pos);
			case DNDTypes.SUB_FOLDER:
				return moveSubFolderToBookmarksAt(dropped.folderId, dropped.id, dropped.parentId, me.id, me.pos);
			case DNDTypes.DRAGGABLE_GUILD_CHANNEL:
				return addBookmarkAt(`/channels/${dropped.guildId}/${dropped.id}`, me.id, me.pos);
		}
	}
)(DroppableMarkup);

function Bookmark_default({ id }) {
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Bookmark, {
			id,
			pos: "before"
		}
	), /* @__PURE__ */ React_default.createElement(
		Bookmark, {
			id,
			pos: "after"
		}
	));
}

// src/Tabbys/components/DND/Sortables/SubBookmark.jsx
var SubBookmark = makeDroppable(
	[DNDTypes.SUB_BOOKMARK, DNDTypes.DRAGGABLE_GUILD_CHANNEL, DNDTypes.SUB_FOLDER, DNDTypes.FOLDER, DNDTypes.TAB, DNDTypes.BOOKMARK],
	(me, monitor) => {
		const dropped = monitor.getItem();
		if (me.id === dropped.id) return;
		if (me.parentId === dropped.folderId) return;
		const itemType = monitor.getItemType();
		switch (itemType) {
			case DNDTypes.SUB_BOOKMARK: {
				if (me.parentId === dropped.parentId) Store_default.reOrderFolder(me.parentId, dropped.id, me.id, me.pos);
				else moveBookmarkToFolderAt(dropped.id, me.parentId, dropped.parentId, me.id, me.pos);
				return;
			}
			case DNDTypes.SUB_FOLDER: {
				if (me.parentId === dropped.parentId) Store_default.reOrderFolder(me.parentId, dropped.id, me.id, me.pos);
				else moveFolderToFolderAt(dropped.folderId, dropped.id, me.parentId, dropped.parentId, me.id, me.pos);
				return;
			}
			case DNDTypes.TAB:
				return addTabToFolderAt(dropped.id, me.parentId, me.id, me.pos);
			case DNDTypes.BOOKMARK:
				return moveBookmarkToFolderAt(dropped.id, me.parentId, dropped.parentId, me.id, me.pos);
			case DNDTypes.FOLDER: {
				return moveFolderToFolderAt(dropped.folderId, dropped.id, me.parentId, dropped.parentId, me.id, me.pos);
			}
			case DNDTypes.DRAGGABLE_GUILD_CHANNEL:
				return addToFolderAt(`/channels/${dropped.guildId}/${dropped.id}`, me.parentId, me.id, me.pos);
		}
	}
)(DroppableMarkup);

function SubBookmark_default(props) {
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		SubBookmark, {
			...props,
			pos: "before"
		}
	), /* @__PURE__ */ React_default.createElement(
		SubBookmark, {
			...props,
			pos: "after"
		}
	));
}

// src/Tabbys/components/DND/Droppables/Tab.js
var DraggableTab = makeDraggable(DNDTypes.TAB);
var DroppableTab = makeDroppable(
	[DNDTypes.BOOKMARK, DNDTypes.DRAGGABLE_GUILD_CHANNEL, DNDTypes.SUB_BOOKMARK],
	(me, monitor) => {
		if (!monitor.isOver({ shallow: true })) return;
		const dropped = monitor.getItem();
		const itemType = monitor.getItemType();
		switch (itemType) {
			case DNDTypes.BOOKMARK:
			case DNDTypes.SUB_BOOKMARK:
				return setTabFromBookmark(me.id, dropped.id, dropped.parentId);
			case DNDTypes.DRAGGABLE_GUILD_CHANNEL:
				return Store_default.setTabPath(me.id, `/channels/${dropped.guildId}/${dropped.id}`);
		}
	}
);
var Tab_default2 = (comp) => DraggableTab(DroppableTab(comp));

// src/Tabbys/components/DND/Droppables/Folder.js
var Folder_default = (comp) => makeDroppable(
	[DNDTypes.DRAGGABLE_GUILD_CHANNEL, DNDTypes.BOOKMARK, DNDTypes.SUB_BOOKMARK, DNDTypes.TAB, DNDTypes.FOLDER, DNDTypes.SUB_FOLDER],
	(me, monitor) => {
		if (!monitor.isOver({ shallow: true })) return;
		const dropped = monitor.getItem();
		if (dropped.id === me.id) return;
		if (me.folderId === dropped.parentId) return;
		const itemType = monitor.getItemType();
		switch (itemType) {
			case DNDTypes.BOOKMARK:
				return moveBookmarkToFolderAt(dropped.id, me.folderId);
			case DNDTypes.TAB:
				return addTabToFolderAt(dropped.id, me.folderId);
			case DNDTypes.FOLDER:
				return moveFolderToFolderAt(dropped.folderId, dropped.id, me.folderId);
			case DNDTypes.SUB_BOOKMARK:
				return moveBookmarkToFolderAt(dropped.id, me.folderId, dropped.parentId);
			case DNDTypes.SUB_FOLDER:
				return moveFolderToFolderAt(dropped.folderId, dropped.id, me.folderId, dropped.parentId);
			case DNDTypes.DRAGGABLE_GUILD_CHANNEL:
				return addToFolderAt(`/channels/${dropped.guildId}/${dropped.id}`, me.folderId);
		}
	}
)(comp);

// src/Tabbys/contextmenus/helper.jsx
var c3 = classNameFactory(`${Config_default.info.name}-menuitem`);

function wrapMenuItem(item) {
	if (!item?.label) return item;
	const tag = item.label.toLowerCase().replace(/^[^a-z]+|[^\w-]+/gi, "-");
	return {
		id: c3(tag),
		className: c3(tag),
		...item
	};
}

// src/Tabbys/components/PromptModal/styles.css
StylesLoader_default.push(`.create-folder-modal-content {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: var(--modal-vertical-padding) var(--modal-horizontal-padding);
}

.create-folder-modal-footer {
	gap: 12px;
	align-items: center;
}

.transparent-background.transparent-background {
	background: transparent;
	border: unset;
}
`);

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

// MODULES-AUTO-LOADER:@Modules/Button
var Button_default = getModule((a) => a && a.Link && a.Colors, { searchExports: true });

// common/Components/Button/index.jsx
function ButtonComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("button", { ...props });
}
var ManaButton = /* @__PURE__ */ getModule(Filters.byStrings(`"data-mana-component":"button"`), { searchExports: true }) || ButtonComponentFallback;
var ManaTextButton = /* @__PURE__ */ getModule(Filters.byStrings(`"data-mana-component":"text-button"`), { searchExports: true }) || ButtonComponentFallback;

// common/Components/TextInput/index.jsx
var TextInput = getModule(Filters.byStrings("showCharacterCount", "clearable"), { searchExports: true });
var TextInput_default = TextInput || function TextInputFallback(props) {
	return /* @__PURE__ */ React_default.createElement("div", { style: { color: "#fff" } }, /* @__PURE__ */ React_default.createElement(
		"input", {
			...props,
			type: "text",
			onChange: (e2) => props.onChange?.(e2.target.value)
		}
	));
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

// src/Tabbys/components/PromptModal/index.jsx
var c4 = clsx("create-folder-modal");

function PromptModal({ modalProps, required, title, placeholder, label, initialValue = "", onSubmit }) {
	const [val, setVal] = useState(initialValue);
	const saveHandler = (e2) => {
		onSubmit?.(val);
		modalProps.onClose?.();
	};
	return /* @__PURE__ */ React_default.createElement(
		Modals.ModalRoot, {
			...modalProps,
			fullscreenOnMobile: false,
			className: c4("root")
		},
		/* @__PURE__ */
		React_default.createElement(Modals.ModalHeader, { separator: true }, /* @__PURE__ */ React_default.createElement(
			Heading_default, {
				variant: "heading-lg/semibold",
				style: { flexGrow: 1 }
			},
			title
		), /* @__PURE__ */ React_default.createElement(Modals.ModalCloseButton, { onClick: modalProps.onClose })),
		/* @__PURE__ */
		React_default.createElement("div", { className: c4("content") }, /* @__PURE__ */ React_default.createElement(FieldWrapper, { title: label }, /* @__PURE__ */ React_default.createElement(
			TextInput_default, {
				value: val,
				onChange: setVal,
				fullWidth: true,
				required,
				placeholder: initialValue || placeholder,
				autoFocus: true
			}
		)), /* @__PURE__ */ React_default.createElement(
			ManaTextButton, {
				text: "reset",
				textVariant: "text-sm/medium",
				type: "button",
				onClick: () => setVal(initialValue)
			}
		)),
		/* @__PURE__ */
		React_default.createElement(
			Modals.ModalFooter, {
				className: c4("footer"),
				separator: true
			},
			/* @__PURE__ */
			React_default.createElement(
				ManaButton, {
					text: "Save",
					onClick: saveHandler
				}
			),
			/* @__PURE__ */
			React_default.createElement(
				ManaTextButton, {
					text: "Cancel",
					onClick: modalProps.onClose
				}
			)
		)
	);
}

function openPromptModal(props) {
	ModalActions.openModal((e2) => /* @__PURE__ */ React_default.createElement(ErrorBoundary, null, /* @__PURE__ */ React_default.createElement(
		PromptModal, {
			modalProps: e2,
			...props
		}
	)));
}

// src/Tabbys/contextmenus/shared.js
function MarkAsReadItem(channelId, hasUnread) {
	return {
		action: () => channelId && Dispatcher.dispatch({
			type: "CHANNEL_ACK",
			channelId,
			force: true
		}),
		label: "Mark as read",
		disabled: !hasUnread
	};
}

function createFolder2(parentId) {
	openPromptModal({
		title: "Create Folder",
		placeholder: "New Folder Name",
		label: "New Folder Name",
		required: true,
		onSubmit: (name) => {
			if (!name) return;
			if (parentId) return addSubFolder(name, parentId);
			addFolder(name);
		}
	});
}

function CopyChannelIdItem(id) {
	return {
		action: () => copy(id),
		label: "Copy Channel ID",
		icon: IdIcon
	};
}

function CopyUserIdItem(id) {
	return {
		action: () => copy(id),
		label: "Copy User ID",
		icon: IdIcon
	};
}

function CopyGuildIdItem(id) {
	return {
		action: () => copy(id),
		label: "Copy Server ID",
		icon: IdIcon
	};
}

function CopyPathItem(path2) {
	return {
		action: () => copy(path2),
		label: "Copy Path"
	};
}

// src/Tabbys/contextmenus/TabContextMenu.jsx
function TabContextMenu_default(id, { path: path2, channelId, userId, guildId, hasUnread }) {
	const canClose = Store_default.getTabsCount() > 1;
	const folders = Store_default.state.folders.map(({ id: folderId, name }) => {
		return {
			action: () => addTabToFolderAt(id, folderId),
			label: name,
			icon: BookmarkOutlinedIcon
		};
	}).map(wrapMenuItem);
	const copies = [
		CopyPathItem(path2),
		channelId && CopyChannelIdItem(channelId),
		guildId && CopyGuildIdItem(guildId),
		userId && CopyUserIdItem(userId)
	].filter(Boolean).map(wrapMenuItem);
	const Menu2 = ContextMenu.buildMenu(
		[
			MarkAsReadItem(channelId, hasUnread),
			{ type: "separator" },
			{
				action: () => Store_default.addTabToRight(id),
				label: "New tab to right",
				icon: VectorIcon
			},
			{
				action: () => Store_default.addTabToLeft(id),
				label: "New tab to left",
				icon: VectorIcon
			},
			{ type: "separator" },
			{
				action: () => Store_default.duplicateTab(id),
				label: "Duplicate tab",
				icon: DuplicateIcon
			},
			{
				label: "Bookmark tab",
				action: () => bookmarkTabAt(id),
				type: folders.length > 0 ? "submenu" : null,
				icon: folders.length > 0 ? nop : BookmarkOutlinedIcon,
				items: folders
			},
			{ type: "separator" },
			...copies,
			canClose && { type: "separator" },
			canClose && {
				type: "submenu",
				label: "Close",
				action: () => Store_default.removeTab(id),
				color: "danger",
				items: [{
						action: () => removeTabsToRight(id),
						label: "Close Tabs to Right",
						icon: VectorIcon,
						color: "danger"
					},
					{
						action: () => removeTabsToLeft(id),
						label: "Close Tabs to Left",
						icon: VectorIcon,
						color: "danger"
					},
					{
						action: () => removeOtherTabs(id),
						label: "Close Other Tabs",
						icon: LightiningIcon,
						color: "danger"
					}
				].filter(Boolean).map(wrapMenuItem)
			}
		].filter(Boolean).map(wrapMenuItem)
	);
	return (props) => /* @__PURE__ */ React_default.createElement(Menu2, { ...props });
}

// MODULES-AUTO-LOADER:@Modules/useStateFromStores
var useStateFromStores_default = getModule(Filters.byStrings("getStateFromStores"), { searchExports: true });

// MODULES-AUTO-LOADER:@Stores/ReadStateStore
var ReadStateStore_default = getStore("ReadStateStore");

// src/Tabbys/components/Tab/BaseTab.jsx
var c5 = classNameFactory("tab");

function BaseTab({ id, icon, path: path2, title, guildId, userId, channelId, children, ...props }) {
	const { isOver, canDrop, isDragging, dragRef, dropRef } = props;
	const shouldHightLight = Settings_default(Settings_default.selectors.highlightTabUnread);
	const hasUnread = useStateFromStores_default([ReadStateStore_default], () => shouldHightLight && ReadStateStore_default.hasUnread(channelId), [shouldHightLight, channelId]);
	const isSelected = Store_default(Store_default.selectors.selectedId) === id;
	const isSingle = Store_default(Store_default.selectors.isSingle);
	const onClick = (e2) => {
		e2.stopPropagation();
		Store_default.setSelectedId(id);
	};
	const onCloseClick = (e2) => {
		e2.stopPropagation();
		Store_default.removeTab(id);
	};
	const contextmenuHandler = (e2) => {
		ContextMenu.open(e2, TabContextMenu_default(id, { userId, path: path2, guildId, channelId, hasUnread }), {
			position: "bottom",
			align: "left"
		});
	};
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			onContextMenu: contextmenuHandler,
			ref: (e2) => dragRef(dropRef(e2)),
			className: join2(c5("container", isOver && canDrop && "canDrop"), { isSelected, hasUnread, isDragging }, "card"),
			onClick
		},
		/* @__PURE__ */
		React_default.createElement(Tab_default, { id }),
		icon,
		/* @__PURE__ */
		React_default.createElement("div", { className: join2(c5("title"), "card-title") }, title),
		children,
		/* @__PURE__ */
		React_default.createElement(
			"div", {
				className: join2(c5("close-button"), "icon-wrapper", "card-button"),
				onClick: onCloseClick
			},
			/* @__PURE__ */
			React_default.createElement(CloseIcon, null)
		)
	);
}
var BaseTab_default = Tab_default2(BaseTab);

// src/Tabbys/components/NumberBadge/styles.css
StylesLoader_default.push(`.badge-pill {
	width: 16px;
	height: 16px;
	min-height: 16px;
	min-width: 16px;
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.02em;
	line-height: 1.4;
	text-transform: uppercase;
	flex: 0 0 auto;
	color: white;
}

.badge-ping {
	background-color: var(--ping);
}

.badge-unread {
	background-color: var(--unread);
}
`);

// src/Tabbys/components/NumberBadge/index.jsx
var c6 = clsx("badge");

function m(e2) {
	return e2 < 10 ? 13 : e2 < 100 ? 19 : 27;
}

function g(e2) {
	return e2 < 1e3 ? "".concat(e2) : "".concat(Math.min(Math.floor(e2 / 1e3), 9), "k+");
}
var NumberBadge_default = ({ count, type }) => {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { width: m(count) },
			className: join(" ", c6("pill", type), "fcc", "rounded-full")
		},
		g(count)
	);
};

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

// src/Tabbys/components/TypingDots/index.jsx
var TypingDots = waitForComponent(reactRefMemoFilter("type", "dotRadius", "className"), { searchExports: true });

function TypingDots_default({ users }) {
	const typingUsersNames = users?.map(getUserName).join(", ");
	return /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: typingUsersNames }, /* @__PURE__ */ React_default.createElement("div", { className: join(" ", "typing-dots", "fcc") }, /* @__PURE__ */ React_default.createElement(TypingDots, { dotRadius: 2.5 })));
}

// MODULES-AUTO-LOADER:@Stores/TypingStore
var TypingStore_default = getStore("TypingStore");

// MODULES-AUTO-LOADER:@Stores/GuildStore
var GuildStore_default = getStore("GuildStore");

// common/Utils/Channel.js
function getChannelName(channel) {
	if (!channel) return "";
	if (channel.isGroupDM()) return channel.rawRecipients.map(getUserName).join(", ");
	return channel.name;
}

function getChannelIconURL(channel, size) {
	if (!channel) return "";
	if (channel.isGroupDM())
		return IconsUtils.getChannelIconURL({
			id: channel.id,
			icon: channel.icon,
			applicationId: channel.getApplicationId(),
			size
		});
	const guild = GuildStore_default.getGuild(channel.guild_id);
	return IconsUtils.getGuildIconURL({
		id: guild.id,
		icon: guild.icon,
		size
	});
}

// common/Utils/Hooks.js
function getChannelState(channelId) {
	const hasUnread = ReadStateStore_default.hasUnread(channelId);
	const mentionCount = ReadStateStore_default.getMentionCount(channelId);
	const unreadCount = ReadStateStore_default.getUnreadCount(channelId);
	return [mentionCount, unreadCount, hasUnread];
}

function useChannelsState(channelIds = []) {
	const [mentionCount, unreadCount, hasUnread] = useStateFromStores_default(
		[ReadStateStore_default],
		() => {
			return channelIds.map(getChannelState).reduce((acc, item) => {
				const [mentionCount2, unreadCount2, hasUnread2] = item;
				acc[0] += mentionCount2;
				acc[1] += unreadCount2;
				acc[2] = acc[2] || hasUnread2;
				return acc;
			}, [0, 0, false]);
		},
		[channelIds]
	);
	const typingUsersIds = useStateFromStores_default(
		[TypingStore_default],
		() => {
			return channelIds.flatMap((channelId) => Object.keys(TypingStore_default.getTypingUsers(channelId)));
		},
		[...channelIds]
	);
	const currentUser = UserStore_default.getCurrentUser();
	const typingUsers = typingUsersIds.filter((id) => id !== currentUser?.id).map(UserStore_default.getUser);
	return {
		isTyping: !!typingUsers.length,
		typingUsers,
		mentionCount,
		unreadCount,
		hasUnread
	};
}

// src/Tabbys/components/ChannelStatus/index.jsx
function getPropNames(type) {
	return ["Pings", "Unreads", "Typing"].map((a) => `show${type}${a}`);
}

function ChannelStatus({ channelIds, type, isDM }) {
	const { isTyping, typingUsers, mentionCount, unreadCount } = useChannelsState(channelIds);
	const [showPings, showUnreads, showTyping] = Settings_default((state) => getPropNames(type).map((a) => state[a]), shallow);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, showTyping && isTyping && /* @__PURE__ */ React_default.createElement(TypingDots_default, { users: typingUsers }), showPings && !!mentionCount && /* @__PURE__ */ React_default.createElement(
		NumberBadge_default, {
			count: mentionCount,
			type: "ping"
		}
	), showUnreads && !isDM && !!unreadCount && /* @__PURE__ */ React_default.createElement(
		NumberBadge_default, {
			count: unreadCount,
			type: "unread"
		}
	));
}

// src/Tabbys/components/Icons/Fallback.jsx
var Fallback_default = () => /* @__PURE__ */ React_default.createElement("div", { className: join2("card-icon", "discord-icon", "icon-wrapper") }, /* @__PURE__ */ React_default.createElement(DiscordIcon, null));

// MODULES-AUTO-LOADER:@Stores/PresenceStore
var PresenceStore_default = getStore("PresenceStore");

// common/Components/UserAvatar/index.jsx
var UserAvatar = waitForComponent(reactRefMemoFilter("type", "statusColor", "isTyping"), { searchExports: true });
var UserAvatar_default = ({ id, size, src }) => {
	const [status2, isMobile] = useStateFromStores_default([PresenceStore_default], () => [PresenceStore_default.getStatus(id), PresenceStore_default.isMobileOnline(id)], [id]);
	return /* @__PURE__ */ React_default.createElement(
		UserAvatar, {
			status: status2,
			isMobile,
			size,
			src
		}
	);
};

// src/Tabbys/components/Icons/shared.js
function getSize(e2) {
	if (e2 >= 32) return { size: 24, avatarSize: "SIZE_24" };
	if (e2 >= 28 && e2 < 32) return { size: 20, avatarSize: "SIZE_20" };
	if (e2 >= 24 && e2 < 28) return { size: 16, avatarSize: "SIZE_16" };
	return { size: 20, avatarSize: "SIZE_20" };
}

// src/Tabbys/components/Icons/DMIcon.jsx
function getUserAvatar2(id, avatar, size) {
	return `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp?size=${size}`;
}

function DMIcon({ user = {}, userId, fallbackAvatar }) {
	const { size, avatarSize } = getSize(Settings_default((_) => _.size));
	const src = getUserAvatar2(user.id || userId, user.avatar || fallbackAvatar, size);
	if (!src) return /* @__PURE__ */ React_default.createElement(Fallback_default, null);
	return /* @__PURE__ */ React_default.createElement("div", { className: join2("card-icon", "user-avatar", "fcc") }, /* @__PURE__ */ React_default.createElement(
		UserAvatar_default, {
			id: user.id,
			src,
			size: avatarSize
		}
	));
}

// src/Tabbys/components/Icons/ChannelIcon.jsx
function ChannelIcon({ guildId, name, channel }) {
	const { size } = getSize(Settings_default((_) => _.size));
	const src = getChannelIconURL(channel, size);
	if (!src) return /* @__PURE__ */ React_default.createElement(Fallback_default, null);
	return /* @__PURE__ */ React_default.createElement("div", { className: join2("card-icon", "icon-wrapper") }, /* @__PURE__ */ React_default.createElement(
		"img", {
			width: size,
			height: size,
			src,
			alt: name
		}
	));
}

// src/Tabbys/components/Icons/MiscIcon.jsx
function MiscIcon({ type }) {
	let icon = null;
	switch (type) {
		case pathTypes.NITRO:
			icon = /* @__PURE__ */ React_default.createElement(NitroIcon, null);
			break;
		case pathTypes.SHOP:
			icon = /* @__PURE__ */ React_default.createElement(ShopIcon, null);
			break;
		case pathTypes.SERVERS:
			icon = /* @__PURE__ */ React_default.createElement(ServersIcon, null);
			break;
		case pathTypes.QUESTS:
			icon = /* @__PURE__ */ React_default.createElement(QuestsIcon, null);
			break;
		case pathTypes.APPS:
			icon = /* @__PURE__ */ React_default.createElement(AppsIcon, null);
			break;
		default:
			return /* @__PURE__ */ React_default.createElement(Fallback_default, null);
	}
	return /* @__PURE__ */ React_default.createElement("div", { className: join2("card-icon", "icon-wrapper") }, icon);
}

// src/Tabbys/components/Tab/ChannelTab.jsx
function ChannelTab({ id, path: path2, guildId, channelId }) {
	const channel = useStateFromStores_default([ChannelStore_default], () => ChannelStore_default.getChannel(channelId), [channelId]);
	const name = getChannelName(channel);
	return /* @__PURE__ */ React_default.createElement(
		BaseTab_default, {
			id,
			channelId,
			guildId,
			path: path2,
			title: name || channelId,
			icon: /* @__PURE__ */ React_default.createElement(
				ChannelIcon, {
					guildId,
					name,
					channel
				}
			)
		},
		/* @__PURE__ */
		React_default.createElement(
			ChannelStatus, {
				type: "Tab",
				channelIds: [channelId]
			}
		)
	);
}

// src/Tabbys/components/Tab/DMTab.jsx
function DMTab({ id, userId, path: path2, avatar, username, channelId }) {
	const user = useStateFromStores_default([UserStore_default], () => UserStore_default.getUser(userId), [userId]);
	const name = getUserName(user) || username || userId;
	return /* @__PURE__ */ React_default.createElement(
		BaseTab_default, {
			id,
			channelId,
			userId,
			path: path2,
			title: name,
			icon: /* @__PURE__ */ React_default.createElement(
				DMIcon, {
					user,
					userId,
					fallbackAvatar: avatar
				}
			)
		},
		/* @__PURE__ */
		React_default.createElement(
			ChannelStatus, {
				type: "Tab",
				channelIds: [channelId],
				isDM: true
			}
		)
	);
}

// src/Tabbys/components/Tab/index.jsx
var Tab_default3 = React_default.memo(function Tab2({ id }) {
	const { type, ...tab } = Store_default((state) => Store_default.getTab(id), shallow);
	switch (type) {
		case pathTypes.CHANNEL:
			return /* @__PURE__ */ React_default.createElement(ChannelTab, { ...tab });
		case pathTypes.DM:
			return /* @__PURE__ */ React_default.createElement(DMTab, { ...tab });
		default:
			return /* @__PURE__ */ React_default.createElement(
				BaseTab_default, {
					...tab,
					icon: /* @__PURE__ */ React_default.createElement(MiscIcon, { type })
				}
			);
	}
});

// MODULES-AUTO-LOADER:@Stores/ContextMenuStore
var ContextMenuStore_default = getStore("ContextMenuStore");

// MODULES-AUTO-LOADER:@Stores/LayerStore
var LayerStore_default = getStore("LayerStore");

// src/Tabbys/components/DragHandle/index.jsx
var { BasePopout } = getMangled(Filters.bySource("renderLayer", "POPOUT_PREVENT_CLOSE"), {
	BasePopout: (a) => a.contextType
});

function usePopoutListener() {
	const [hasPopout, setHasPopout] = useState(false);
	const { windowDispatch } = useContext(BasePopout.contextType);
	useEffect(() => {
		function show() {
			setHasPopout(true);
		}

		function hide() {
			setHasPopout(false);
		}
		windowDispatch.subscribe("POPOUT_SHOW", show);
		windowDispatch.subscribe("POPOUT_HIDE", hide);
		return () => {
			windowDispatch.unsubscribe("POPOUT_SHOW", show);
			windowDispatch.unsubscribe("POPOUT_HIDE", hide);
		};
	}, [windowDispatch]);
	return hasPopout;
}

function DragHandle() {
	const hasPopout = usePopoutListener();
	const hasAny = ModalActions.ModalStore((a) => a.default?.length > 0 || a.popout?.length > 0);
	const hasLayers = useStateFromStores_default([LayerStore_default], () => LayerStore_default.hasLayers());
	const isOpen = useStateFromStores_default([ContextMenuStore_default], () => ContextMenuStore_default.isOpen());
	const style = { "width": "100%", "flex": "1 0 0" };
	if (!hasAny && !isOpen && !hasLayers && !hasPopout) style["-webkit-app-region"] = "drag";
	return /* @__PURE__ */ React_default.createElement("div", { style });
}

// src/Tabbys/components/TabBar/index.jsx
var c7 = clsx("tabbar");

function TabBar() {
	const [tabMinWidth, tabWidth] = Settings_default((_) => [_.tabMinWidth, _.tabWidth], shallow);
	const tabs = Store_default(Store_default.selectors.tabs, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));
	const selectedId = Store_default(Store_default.selectors.selectedId);
	const selectedIndex = Store_default.getSelectedTabIndex();
	const newTabHandler = (e2) => {
		e2.preventDefault();
		e2.stopPropagation();
		Store_default.newTab();
	};
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: {
				"--tab-width": `${tabWidth}px`,
				"--tab-min-width": `${tabMinWidth}px`
			},
			className: c7("container")
		},
		/* @__PURE__ */
		React_default.createElement(
			TabsScroller, {
				shouldScroll: selectedId,
				scrollTo: selectedIndex,
				containerClassName: c7("tabs-scroller-container"),
				contentClassName: c7("tabs-scroller-content"),
				items: tabs,
				renderItem: ({ id }) => /* @__PURE__ */ React_default.createElement(
					Tab_default3, {
						key: id,
						id
					}
				)
			}
		),
		/* @__PURE__ */
		React_default.createElement(
			"div", {
				className: join2(c7("new-tab"), "icon-wrapper"),
				onClick: newTabHandler
			},
			/* @__PURE__ */
			React_default.createElement(PlusIcon, null)
		),
		/* @__PURE__ */
		React_default.createElement(DragHandle, null)
	);
}

// src/Tabbys/components/BookmarkBar/styles.css
StylesLoader_default.push(`.bookmarkbar-container {
	display: flex;
	max-width: 100%;
	overflow: hidden;
	--droppable-gap: var(--bookmarks-gap);
}

.bookmarkbar-content {
	display: flex;
	flex: 0 1 auto;
	max-width: 100%;
	gap: var(--bookmarks-gap);
	overflow: hidden;
	padding: 0 var(--bookmarks-gap);
}

.bookmarkbar-hidden {
	opacity: 0;
	pointer-events: none;
}

.bookmarkbar-overflow-button {
	display: flex;
	flex: 0 0 calc(var(--size) * 0.85);
	height: calc(var(--size) * 0.85);
	aspect-ratio: 1;
	margin: 0 5px;
	padding: 3px;
	align-self: center;
	cursor: pointer;
	background: var(--tabbys-btn-bg);
	color: var(--tabbys-text);
	border-radius: var(--radius-round);
}

.bookmarkbar-empty {
	font-size: calc(var(--size) * 0.5);
	color: var(--tabbys-text);
	height: var(--size);
	display: flex;
	align-items: center;
}


`);

// src/Tabbys/components/Bookmark/styles.css
StylesLoader_default.push(`.bookmark-container {
	font-size: calc(var(--size) * 0.45);
	max-width: 250px;
}

.bookmark-title {
	white-space: nowrap;
}
`);

// src/Tabbys/contextmenus/BookmarkContextMenu.jsx
function renameBookmark(id, parentId) {
	const bookmark = getBookmark(id, parentId);
	if (!bookmark) return;
	openPromptModal({
		title: "Bookmark Name",
		label: "Bookmark Name",
		placeholder: bookmark.name,
		initialValue: bookmark.name,
		onSubmit: (name) => setBookmarkName(id, name, parentId)
	});
}

function BookmarkContextMenu_default(id, { path: path2, channelId, userId, guildId, parentId, hasUnread }) {
	const folders = Store_default.state.folders.map(({ id: folderId, name }) => {
		if (folderId === parentId) return;
		return {
			action: () => moveBookmarkToFolderAt(id, folderId, parentId),
			label: name
		};
	}).filter(Boolean).map(wrapMenuItem);
	if (parentId) {
		if (folders.length) folders.push({ type: "separator" });
		folders.push({
			action: () => moveSubBookmarkToBookmarksAt(id, parentId),
			label: "Move To BookmarkBar"
		});
	}
	const hasFolders = folders.length > 0;
	const copies = [
		CopyPathItem(path2),
		channelId && CopyChannelIdItem(channelId),
		guildId && CopyGuildIdItem(guildId),
		userId && CopyUserIdItem(userId)
	].filter(Boolean).map(wrapMenuItem);
	const Menu2 = ContextMenu.buildMenu(
		[
			MarkAsReadItem(channelId, hasUnread),
			{
				action: () => openBookmarkAt(id),
				label: "Open in new Tab",
				icon: PlusIcon
			},
			{
				action: () => renameBookmark(id, parentId),
				label: "Rename",
				icon: PenIcon
			},
			{
				type: "toggle",
				label: "Hide Name",
				active: getBookmarkNameState(id, parentId),
				action: () => toggleBookmarkNameState(id, parentId)
			},
			{ type: "separator" },
			hasFolders && {
				type: "submenu",
				label: "Move",
				items: folders
			},
			{
				action: createFolder2,
				label: "Create Folder",
				icon: PlusIcon
			},
			{ type: "separator" },
			...copies,
			{ type: "separator" },
			{
				color: "danger",
				label: "Delete Bookmark",
				icon: TrashBinIcon,
				action: () => deleteBookmark(id, parentId)
			}
		].filter(Boolean).map(wrapMenuItem)
	);
	return (props) => /* @__PURE__ */ React_default.createElement(Menu2, { ...props });
}

// src/Tabbys/components/Bookmark/BaseBookmark.jsx
var c8 = classNameFactory("bookmark");

function BaseBookmark(props) {
	const { id, icon, title, onClose, parentId, channelId, guildId, userId, path: path2, noName, className, children, ...rest } = props;
	const shouldHightLight = Settings_default(Settings_default.selectors.highlightBookmarkUnread);
	const hasUnread = useStateFromStores_default([ReadStateStore_default], () => shouldHightLight && ReadStateStore_default.hasUnread(channelId), [shouldHightLight, channelId]);
	const onClick = (e2) => {
		e2.stopPropagation();
		onClose?.();
		if (e2.ctrlKey) Store_default.newTab(path2);
		else openBookmark(id, parentId);
	};
	const contextmenuHandler = (e2) => {
		ContextMenu.open(e2, BookmarkContextMenu_default(id, { path: path2, guildId, userId, parentId, channelId, hasUnread }), {
			position: "bottom",
			align: "left"
		});
	};
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			...rest,
			onContextMenu: contextmenuHandler,
			className: join2(c8("container"), { hasUnread }, "card", className),
			onClick
		},
		icon,
		!noName && title && /* @__PURE__ */ React_default.createElement("div", { className: join2(c8("title"), "card-title") }, title),
		children
	);
}

// src/Tabbys/components/Bookmark/ChannelBookmark.jsx
function ChannelBookmark({ name, guildId, channelId, children, ...rest }) {
	const channel = useStateFromStores_default([ChannelStore_default], () => ChannelStore_default.getChannel(channelId), [channelId]);
	const title = name || getChannelName(channel) || channelId;
	return /* @__PURE__ */ React_default.createElement(
		BaseBookmark, {
			...rest,
			channelId,
			guildId,
			title,
			icon: /* @__PURE__ */ React_default.createElement(
				ChannelIcon, {
					guildId,
					name: title,
					channel
				}
			)
		},
		children,
		/* @__PURE__ */
		React_default.createElement(
			ChannelStatus, {
				type: "Bookmark",
				channelIds: [channelId]
			}
		)
	);
}

// src/Tabbys/components/Bookmark/DMBookmark.jsx
function DMBookmark({ name, userId, avatar, username, channelId, children, ...rest }) {
	const user = useStateFromStores_default([UserStore_default], () => UserStore_default.getUser(userId), [userId]);
	const title = name || getUserName(user) || username || userId;
	return /* @__PURE__ */ React_default.createElement(
		BaseBookmark, {
			...rest,
			title,
			channelId,
			userId,
			icon: /* @__PURE__ */ React_default.createElement(
				DMIcon, {
					userId,
					user,
					fallbackAvatar: avatar
				}
			)
		},
		children,
		/* @__PURE__ */
		React_default.createElement(
			ChannelStatus, {
				type: "Bookmark",
				channelIds: [channelId]
			}
		)
	);
}

// src/Tabbys/components/Bookmark/index.jsx
function BookmarkSwitch({ id, parentId, dragRef, ...rest }) {
	const { type, ...bookmark } = Store_default((state) => parentId ? Store_default.getFolderItem(parentId, id) : Store_default.getBookmark(id), shallow) || {};
	let props = { ...bookmark, ...rest, id, ref: dragRef };
	if (parentId)
		props = Object.assign(props, {
			parentId,
			className: "folder-item",
			children: /* @__PURE__ */ React_default.createElement(
				SubBookmark_default, {
					id,
					parentId
				}
			)
		});
	else
		props = Object.assign(props, {
			"data-id": id,
			children: /* @__PURE__ */ React_default.createElement(Bookmark_default, { id })
		});
	switch (type) {
		case pathTypes.CHANNEL:
			return /* @__PURE__ */ React_default.createElement(ChannelBookmark, { ...props });
		case pathTypes.DM:
			return /* @__PURE__ */ React_default.createElement(DMBookmark, { ...props });
		default:
			return /* @__PURE__ */ React_default.createElement(
				BaseBookmark, {
					...props,
					title: props.name || props.title,
					icon: /* @__PURE__ */ React_default.createElement(MiscIcon, { type })
				}
			);
	}
}
var Bookmark2 = React_default.memo(makeDraggable(DNDTypes.BOOKMARK)((props) => /* @__PURE__ */ React_default.createElement(BookmarkSwitch, { ...props })));
var SubBookmark2 = React_default.memo(makeDraggable(DNDTypes.SUB_BOOKMARK)((props) => /* @__PURE__ */ React_default.createElement(BookmarkSwitch, { ...props })));

// common/Components/Popout/index.jsx
var Popout_default = ({ children, targetElementRef, ...props }) => {
	const ref = useRef();
	return /* @__PURE__ */ React_default.createElement(
		DiscordPopout, {
			position: "top",
			align: "center",
			nudgeAlignIntoViewport: true,
			animation: DiscordPopout.Animation.FADE,
			spacing: 4,
			...props,
			targetElementRef: targetElementRef || ref
		},
		(p) => {
			if (targetElementRef) return children(p);
			const child = children(p);
			return React_default.cloneElement(child, {
				ref: (e2) => {
					ref.current = e2;
					const childRef = child.props.ref;
					if (!childRef) return e2;
					if (typeof childRef === "function") childRef(e2);
					else if (typeof childRef === "object") childRef.current = e2;
				}
			});
		}
	);
};

// src/Tabbys/components/Folder/styles.css
StylesLoader_default.push(`.folder-container {
	border-radius: calc(var(--size) * 0.3);
	font-size: calc(var(--size) * 0.45);
	max-width: 250px;
}

.folder-canDrop {
	background: dodgerblue !important;
	color: white !important;
}

.folder-container:hover {
	background: var(--tabbys-bg-hover);
}

.folder-container:active {
	background: var(--tabbys-bg-selected);
}

.folder-empty {
	color: var(--tabbys-text);
	font-size: calc(var(--size) * 0.45);
	padding: 4px;
	text-align: center;
}

.overflow-popout>.folder-item{
	max-width:100%;
	flex:0 0 auto;
}



.overflow-popout{
	background:var(--tabbys-folder-menu-bg);
	border:1px solid var(--tabbys-border-subtle);
	max-height:75vh;
	overflow: hidden auto;
	width:200px;
	min-width:250px;
	max-width:75vw;
	border-radius:8px;
	padding:8px;
	gap:var(--folder-gap);
	display:flex;
	flex-direction:column;
	box-shadow:0px 0px 8px 1px #0005;
	--droppable-gap:var(--folder-gap);
}

.overflow-popout::-webkit-scrollbar {
	height: 8px;
	width: 8px;
}

.overflow-popout::-webkit-scrollbar-track {
	background-color: var(--scrollbar-thin-track);
	border-color: var(--scrollbar-thin-track);
}

.overflow-popout::-webkit-scrollbar-thumb {
	background-clip: padding-box;
	background-color: var(--scrollbar-thin-thumb);
	border: 2px solid transparent;
	border-radius: 4px;
	min-height: 40px;
}

.overflow-popout::-webkit-scrollbar-corner {
	background-color: transparent;
}`);

// src/Tabbys/contextmenus/FolderContextMenu.jsx
function FolderContextMenu_default(id, { folderId, parentId }) {
	const folders = Store_default.state.folders.map(({ id: targetFolderId, name }) => {
		if (targetFolderId === folderId) return;
		if (targetFolderId === parentId) return;
		if (isDescendent(folderId, targetFolderId)) return;
		return {
			action: () => moveFolderToFolderAt(folderId, id, targetFolderId, parentId),
			label: name
		};
	}).filter(Boolean).map(wrapMenuItem);
	if (parentId) {
		if (folders.length) folders.push({ type: "separator" });
		folders.push({
			action: () => moveSubFolderToBookmarksAt(folderId, id, parentId),
			label: "Move To BookmarkBar"
		});
	}
	const hasFolders = folders.length > 0;
	const Menu2 = ContextMenu.buildMenu(
		[{
				action: () => createFolder2(folderId),
				label: "Create Sub Folder",
				icon: PlusIcon
			},
			{
				action: () => {
					const folder = Store_default.getFolder(folderId);
					if (!folder) return;
					openPromptModal({
						title: "Edit Folder Name",
						label: "Folder Name",
						placeholder: folder.name,
						initialValue: folder.name,
						required: true,
						onSubmit: (name) => name && Store_default.setFolderName(folderId, name)
					});
				},
				label: "Rename Folder",
				icon: PlusIcon
			},
			hasFolders && {
				type: "submenu",
				label: "Move",
				items: folders
			},
			{
				type: "separator"
			},
			{
				color: "danger",
				label: "Delete Folder",
				icon: TrashBinIcon,
				action: () => deleteFolder(folderId, id, parentId)
			}
		].filter(Boolean).map(wrapMenuItem)
	);
	return (props) => /* @__PURE__ */ React_default.createElement(Menu2, { ...props });
}

// src/Tabbys/components/Folder/BaseFolder.jsx
var c9 = classNameFactory("folder");

function BaseFolder({ id, channelIds, folderId, parentId, name, className, children, canDrop, isOver, ...rest }) {
	const shouldHightLight = Settings_default(Settings_default.selectors.highlightFolderUnread);
	const hasUnread = useStateFromStores_default(
		[ReadStateStore_default],
		() => {
			if (!shouldHightLight) return false;
			for (let i = channelIds.length - 1; i >= 0; i--)
				if (ReadStateStore_default.hasUnread(channelIds[i])) return true;
		},
		[shouldHightLight, channelIds]
	);
	const contextmenuHandler = (e2) => {
		ContextMenu.open(e2, FolderContextMenu_default(id, { hasUnread, folderId, parentId }), {
			position: "bottom",
			align: "left"
		});
	};
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			...rest,
			onContextMenu: contextmenuHandler,
			className: join2(c9("container", isOver && canDrop && "canDrop"), { hasUnread }, "card", className)
		},
		/* @__PURE__ */
		React_default.createElement("div", { className: join2(c9("icon"), "icon-wrapper", "card-icon") }, /* @__PURE__ */ React_default.createElement(FolderIcon, null)),
		/* @__PURE__ */
		React_default.createElement("div", { className: join2(c9("title"), "card-title") }, name),
		/* @__PURE__ */
		React_default.createElement(
			ChannelStatus, {
				type: "Folder",
				channelIds
			}
		),
		children
	);
}

// src/Tabbys/components/Folder/SubFolder.jsx
var c10 = classNameFactory("folder");

function SubFolder({ id, folderId, parentId, dragRef, dropRef, onClose, ...props }) {
	const { name, items } = Store_default((state) => Store_default.getFolder(folderId), shallow) || {};
	return /* @__PURE__ */ React_default.createElement(
		Popout_default, {
			position: "right",
			align: "top",
			spacing: 20,
			renderPopout: (e2) => /* @__PURE__ */ React_default.createElement(
				FolderPopoutMenu, {
					folderId,
					items,
					onClose: onClose || e2.closePopout
				}
			)
		},
		(e2) => /* @__PURE__ */ React_default.createElement(
			BaseFolder, {
				...props,
				ref: (e3) => dragRef(dropRef(e3)),
				id,
				channelIds: items.map((a) => a.channelId).filter(Boolean),
				folderId,
				parentId,
				className: c10("item"),
				onClick: e2.onClick,
				name
			},
			/* @__PURE__ */
			React_default.createElement(
				SubBookmark_default, {
					id,
					parentId
				}
			)
		)
	);
}
var SubFolder_default = makeDraggable(DNDTypes.SUB_FOLDER)(Folder_default(SubFolder));

// src/Tabbys/components/Folder/FolderPopoutMenu.jsx
var c11 = classNameFactory("folder");

function FolderPopoutMenu({ folderId, items, onClose }) {
	const isEmpty2 = items.length === 0;
	return /* @__PURE__ */ React_default.createElement("div", { className: "overflow-popout" }, isEmpty2 ? /* @__PURE__ */ React_default.createElement("div", { className: c11("empty") }, "(Empty)") : items.map((item) => {
		return item.folderId ? /* @__PURE__ */ React_default.createElement(
			SubFolder_default, {
				onClose: onClose || e.closePopout,
				parentId: folderId,
				folderId: item.folderId,
				id: item.id,
				key: item.id
			}
		) : /* @__PURE__ */ React_default.createElement(
			SubBookmark2, {
				onClose: onClose || e.closePopout,
				parentId: folderId,
				id: item.id,
				key: item.id
			}
		);
	}));
}

// src/Tabbys/components/Folder/Folder.jsx
function Folder({ id, folderId, dropRef, dragRef, ...props }) {
	const { name, items } = Store_default((state) => Store_default.getFolder(folderId), shallow) || {};
	return /* @__PURE__ */ React_default.createElement(
		Popout_default, {
			position: "bottom",
			align: "left",
			spacing: 12,
			renderPopout: (e2) => /* @__PURE__ */ React_default.createElement(
				FolderPopoutMenu, {
					folderId,
					items,
					onClose: e2.closePopout
				}
			)
		},
		(e2) => /* @__PURE__ */ React_default.createElement(
			BaseFolder, {
				...props,
				ref: (e3) => dragRef(dropRef(e3)),
				id,
				channelIds: items.map((a) => a.channelId).filter(Boolean),
				folderId,
				"data-id": id,
				onClick: e2.onClick,
				name
			},
			/* @__PURE__ */
			React_default.createElement(Bookmark_default, { id })
		)
	);
}
var Folder_default2 = React_default.memo(makeDraggable(DNDTypes.FOLDER)(Folder_default(Folder)));

// src/Tabbys/components/BookmarkBar/index.jsx
var c12 = classNameFactory("bookmarkbar");

function getItem(props, id, folderId) {
	return folderId ? /* @__PURE__ */ React_default.createElement(
		Folder_default2, {
			folderId,
			key: id,
			id,
			...props
		}
	) : /* @__PURE__ */ React_default.createElement(
		Bookmark2, {
			key: id,
			id,
			...props
		}
	);
}

function BookmarkBar() {
	const bookmarks = Store_default(Store_default.selectors.bookmarks, shallow);
	const contentRef = useRef();
	const [overflowedItems, setOverflowedItems] = useState([]);
	useEffect(() => {
		const node = contentRef.current;
		if (!node) return;
		const handleIntersection = (entries) => {
			setOverflowedItems((p) => {
				const res = new Set(p);
				for (let i = entries.length - 1; i >= 0; i--) {
					const id = entries[i].target.dataset.id;
					if (!id) continue;
					if (entries[i].isIntersecting) res.delete(id);
					else res.add(id);
				}
				return [...res];
			});
		};
		const intersectionObserver = new IntersectionObserver(handleIntersection, { root: node, threshold: 0.97 });
		for (const child of node.children) child.dataset.id && intersectionObserver.observe(child);
		const mutationObserver = new MutationObserver(
			(records) => records.forEach((record) => {
				record.removedNodes.forEach((node2) => {
					intersectionObserver.unobserve(node2);
					const id = node2.dataset.id;
					if (!id) return;
					setOverflowedItems((p) => {
						const res = new Set(p);
						if (res.has(id)) res.delete(id);
						return [...res];
					});
				});
				record.addedNodes.forEach((node2) => intersectionObserver.observe(node2));
			})
		);
		mutationObserver.observe(node, { childList: true });
		return () => {
			mutationObserver?.disconnect();
			intersectionObserver?.disconnect();
		};
	}, []);
	const content = bookmarks.map(({ id, folderId }, index) => {
		const hidden = overflowedItems.find((a) => a === id);
		return getItem({ className: c12({ hidden }) }, id, folderId);
	});
	return /* @__PURE__ */ React_default.createElement("div", { className: c12("container") }, /* @__PURE__ */ React_default.createElement(
		"div", {
			ref: contentRef,
			className: c12("content")
		},
		content.length > 0 ? content : /* @__PURE__ */ React_default.createElement("div", { className: c12("empty") }, "You have no bookmarks yet")
	), !!overflowedItems.length && /* @__PURE__ */ React_default.createElement(OverflowMenu, { items: bookmarks.filter(({ id }) => overflowedItems.find((a) => a === id)) }), /* @__PURE__ */ React_default.createElement(DragHandle, null));
}

function OverflowMenu({ items }) {
	return /* @__PURE__ */ React_default.createElement(
		Popout_default, {
			position: "bottom",
			align: "left",
			spacing: 12,
			renderPopout: (e2) => {
				const content = items.map(({ id, folderId }) => getItem({ className: "folder-item", onClick: e2.closePopout }, id, folderId));
				return /* @__PURE__ */ React_default.createElement("div", { className: "overflow-popout" }, content);
			}
		},
		(e2) => {
			return /* @__PURE__ */ React_default.createElement(
				"div", {
					className: join2(c12("overflow-button"), "icon-wrapper"),
					onClick: e2.onClick
				},
				/* @__PURE__ */
				React_default.createElement(ArrowIcon, null)
			);
		}
	);
}

// MODULES-AUTO-LOADER:@Modules/Slider
var Slider_default = getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true });

// src/Tabbys/contextmenus/SettingsContextMenu.jsx
var c13 = classNameFactory(`${Config_default.info.name}-menuitem`);
var { Separator, CheckboxItem, RadioItem, ControlItem, Group, Item, Menu } = ContextMenu;

function buildToggle({ key, label, color }) {
	const [state, setState] = useState(Settings_default.state[key]);
	return /* @__PURE__ */ React_default.createElement(
		CheckboxItem, {
			color,
			label,
			id: c13(label, key),
			checked: state,
			action: () => {
				setState(!state);
				Settings_default.state[`set${key}`](!Settings_default.state[key]);
			}
		}
	);
}

function ContextMenuSlider({ key, label, ...rest }) {
	const [val, set2] = Settings_default.useSetting(key);
	const beautify = (e2) => `${Math.round(e2)}px`;
	return /* @__PURE__ */ React_default.createElement(
		ControlItem, {
			id: c13(key),
			label: `${label}: ${val}px`,
			control: () => /* @__PURE__ */ React_default.createElement("div", { style: { padding: "0 8px" } }, /* @__PURE__ */ React_default.createElement(
				Slider_default, {
					...rest,
					mini: true,
					initialValue: val,
					onValueChange: (e2) => set2(Math.round(e2)),
					onValueRender: beautify
				}
			))
		}
	);
}

function status() {
	function d(type) {
		return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
			Item, {
				label: `${type}:`,
				id: c13(type),
				disabled: true
			}
		), [
			{ key: `show${type}Pings`, label: "Pings" },
			{ key: `show${type}Unreads`, label: "Unreads" },
			{ key: `show${type}Typing`, label: "Typings" },
			{ key: `highlight${type}Unread`, label: "Highlight Unread" }
		].map(buildToggle));
	}
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, d("Tab"), /* @__PURE__ */ React_default.createElement(Separator, null), d("Bookmark"), /* @__PURE__ */ React_default.createElement(Separator, null), d("Folder"));
}

function appearence() {
	return /* @__PURE__ */ React_default.createElement(
		Item, {
			label: "Appearence",
			id: c13("appearence")
		},
		[{
				key: "size",
				label: "UI Size",
				minValue: 24,
				maxValue: 32
			},
			{
				label: "Tab width",
				key: "tabWidth",
				minValue: 50,
				maxValue: 250
			},
			{
				label: "Tab min width",
				key: "tabMinWidth",
				minValue: 50,
				maxValue: 250
			}
		].map(ContextMenuSlider),
		/* @__PURE__ */
		React_default.createElement(Separator, null),
		[
			{ key: "showTabbar", label: "Show Tabbar" },
			{ key: "showBookmarkbar", label: "Show Bookmarks" },
			{ key: "keepTitle", label: "Keep TitleBar" },
			{ key: "privacyMode", label: "Privacy Mode" },
			{ key: "showSettingsButton", label: "Show Settings button", color: "danger" }
		].map(buildToggle)
	);
}

function SettingsContextMenu_default() {
	return /* @__PURE__ */ React_default.createElement(Menu, null, appearence(), /* @__PURE__ */ React_default.createElement(
		Item, {
			label: "Status",
			id: c13("status")
		},
		status()
	));
}

// src/Tabbys/components/SettingsButton/index.jsx
function SettingsButton() {
	return /* @__PURE__ */ React_default.createElement(
		Popout_default, {
			position: "bottom",
			align: "center",
			spacing: 12,
			renderPopout: (e2) => /* @__PURE__ */ React_default.createElement(SettingsContextMenu_default, { ...e2 })
		},
		(e2) => {
			return /* @__PURE__ */ React_default.createElement(
				"div", {
					...e2,
					className: join(" ", "icon-wrapper", "tabbys-app-settings-button")
				},
				/* @__PURE__ */
				React_default.createElement(Tooltip_default2, { note: "Settings" }, /* @__PURE__ */ React_default.createElement(SettingIcon, null))
			);
		}
	);
}

// src/Tabbys/components/App/index.jsx
var c14 = classNameFactory("tabbys-app");

function App({ leading, trailing }) {
	const [size, privacyMode, keepTitle, showTabbar, showBookmarkbar, showSettingsButton] = Settings_default((_) => [_.size, _.privacyMode, _.keepTitle, _.showTabbar, _.showBookmarkbar, _.showSettingsButton], shallow);
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: {
				"--size": `${size}px`
			},
			className: c14("container", { showTabbar, showBookmarkbar, keepTitle, privacyMode })
		},
		keepTitle && /* @__PURE__ */ React_default.createElement("div", { className: c14("leading") }, leading),
		showTabbar && /* @__PURE__ */ React_default.createElement("div", { className: c14("tabbar") }, /* @__PURE__ */ React_default.createElement(TabBar, null)),
		/* @__PURE__ */
		React_default.createElement("div", { className: c14("trailing") }, React_default.cloneElement(trailing, {
			children: [showSettingsButton && /* @__PURE__ */ React_default.createElement(SettingsButton, null), ...trailing.props.children]
		})),
		showBookmarkbar && /* @__PURE__ */ React_default.createElement("div", { className: join2(c14("bookmarkbar")) }, /* @__PURE__ */ React_default.createElement(BookmarkBar, null))
	);
}

// src/Tabbys/patches/patchTitleBar.jsx
var TitleBar = getModuleAndKey(Filters.byStrings("PlatformTypes", "windowKey", "title"), { searchExports: true });
Plugin_default.on(Events.START, () => {
	const { module: module2, key } = TitleBar;
	if (!module2 || !key) return Logger_default.patchError("patchTitleBar");
	Patcher.after(module2, key, (_, [props], ret) => {
		if (props.windowKey?.startsWith("DISCORD_")) return ret;
		const [, leading, trailing] = ret?.props?.children || [];
		return /* @__PURE__ */ React_default.createElement(ErrorBoundary, null, /* @__PURE__ */ React_default.createElement(
			App, {
				leading,
				trailing
			}
		));
	});
	reRender(".base_c48ade");
});

// common/Components/Collapsible/styles.css
StylesLoader_default.push(`.collapsible-container * {
	box-sizing: border-box;
}

.collapsible-container {
	gap: 0px 20px;
	display: grid;
	grid-template-rows: min-content 0fr;
	transition: grid-template-rows 200ms linear;
	user-select: none;
	color: var(--text-secondary);
	background: var(--background-mod-subtle);
	border-radius: 8px;
	margin-bottom: 5px;
}

.collapsible-open {
	grid-template-rows: min-content 1fr;
	color: var(--text-primary);
}

.collapsible-header {
	background: var(--background-mod-subtle);
	padding: 10px;
	gap: 8px;
	display: flex;
	border-radius: inherit;
	align-items: center;
	min-width: 0;
}

.collapsible-header:hover {
	background: var(--background-mod-normal);
}

.collapsible-header:active {
	background: var(--background-mod-faint);
}

.collapsible-icon {
	display: flex;
	flex: 0 0 auto;
	rotate: 0deg;
	transition: rotate 150ms linear;
	color: inherit;
}

.collapsible-title {
	flex: 1 1 0;
	text-transform: capitalize;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	pointer-events: none;
	color: inherit;
}

.collapsible-body {
	transition: padding 0ms 200ms;
	overflow: hidden;
}

.collapsible-open > .collapsible-header {
	border-radius: 8px 8px 0 0;
	background: var(--background-mod-strong);
}

.collapsible-open > .collapsible-body {
	padding: 15px;
	transition: none;
}

.collapsible-open > .collapsible-header > .collapsible-icon {
	rotate: 90deg;
}
`);

// common/Components/Collapsible/index.jsx
var c15 = classNameFactory("collapsible");

function Collapsible({ title, children }) {
	const [open, setOpen] = React_default.useState(false);
	return /* @__PURE__ */ React_default.createElement("div", { className: c15("container", { open }) }, /* @__PURE__ */ React_default.createElement(
		"div", {
			className: c15("header"),
			onClick: () => setOpen(!open)
		},
		/* @__PURE__ */
		React_default.createElement(
			Heading_default, {
				className: c15("title"),
				tag: "h5"
			},
			title
		),
		/* @__PURE__ */
		React_default.createElement("div", { className: c15("icon") }, /* @__PURE__ */ React_default.createElement(ArrowIcon, null))
	), /* @__PURE__ */ React_default.createElement("div", { className: c15("body") }, children));
}

// common/Components/Gap/styles.css
StylesLoader_default.push(`.gap-base {
	flex:1 0 0;
}

.gap-horizontal {
	width: 100%;
}

.gap-vertical {
	height: 100%;
}
`);

// common/Components/Gap/index.jsx
var c16 = classNameFactory("gap");

function Gap({ direction = "horizontal", gap, className }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { marginTop: gap },
			className: c16("base", { direction })
		}
	);
}
Gap.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// MODULES-AUTO-LOADER:@Modules/FormSwitch
var FormSwitch_default = getModule(Filters.byStrings("note", "tooltipNote"), { searchExports: true });

// common/Components/Switch/index.jsx
var Switch_default = getModule(Filters.byStrings('"data-toggleable-component":"switch"', 'layout:"horizontal"'), { searchExports: true }) || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("div", { style: { color: "#fff" } }, props.children, /* @__PURE__ */ React.createElement(
		"input", {
			type: "checkbox",
			checked: props.value,
			onChange: (e2) => props.onChange(e2.target.checked)
		}
	));
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ settingKey, note, onChange = nop, description, ...rest }) {
	const [val, set2] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React.createElement(
		Switch_default, {
			...rest,
			checked: val,
			label: description || settingKey,
			description: note,
			onChange: (e2) => {
				set2(e2);
				onChange(e2);
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

// common/Components/FieldSet/index.jsx
var c17 = classNameFactory("fieldset");

function FieldSet({ label, description, children, contentGap = 16 }) {
	return /* @__PURE__ */ React_default.createElement("fieldset", { className: c17("container") }, label && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c17("label"),
			tag: "legend",
			variant: "text-lg/medium"
		},
		label
	), description && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c17("description"),
			variant: "text-sm/normal",
			color: "text-secondary"
		},
		description
	), /* @__PURE__ */ React_default.createElement("div", { className: c17("content"), style: { gap: contentGap } }, children));
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
var c18 = classNameFactory("divider");

function Divider({ direction = "horizontal", gap }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: {
				marginTop: gap,
				marginBottom: gap
			},
			className: c18("base", { direction })
		}
	);
}
Divider.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// src/Tabbys/components/SettingComponent/index.jsx
function SettingSlider({ settingKey, label, description, ...props }) {
	const [val, set2] = Settings_default.useSetting(settingKey);
	const beautify = (e2) => `${Math.round(e2)}px`;
	return /* @__PURE__ */ React_default.createElement(
		Slider_default, {
			...props,
			mini: true,
			label,
			description,
			initialValue: val,
			onValueChange: (e2) => set2(Math.round(e2)),
			onValueRender: beautify
		}
	);
}

function SettingComponent() {
	return /* @__PURE__ */ React_default.createElement("div", { className: `${Config_default.info.name}-settings` }, /* @__PURE__ */ React_default.createElement(Collapsible, { title: "Appearence" }, /* @__PURE__ */ React_default.createElement(Collapsible, { title: "toggles" }, /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [
		{ description: "Show/Hide Tabbar", settingKey: "showTabbar" },
		{ description: "Show/Hide Bookmarkbar", settingKey: "showBookmarkbar" },
		{ description: "Show/Hide Titlebar", settingKey: "keepTitle" },
		{ description: "Show/Hide privacy mode", settingKey: "privacyMode" },
		{ description: "Show/Hide SettingsButton", settingKey: "showSettingsButton" }
	].map(SettingSwtich))), /* @__PURE__ */ React_default.createElement(Divider, { gap: 15 }), /* @__PURE__ */ React_default.createElement(
		SettingSlider, {
			settingKey: "size",
			label: "UI Size",
			description: "overall scale for the entire UI",
			minValue: 24,
			maxValue: 32,
			markers: [24, 28, 32]
		}
	), /* @__PURE__ */ React_default.createElement(Divider, { gap: 25 }), /* @__PURE__ */ React_default.createElement(
		SettingSlider, {
			settingKey: "tabWidth",
			label: "Tab width",
			description: "width a tab will take when there is enough space",
			minValue: 50,
			maxValue: 250,
			markers: [50, 100, 150, 200, 250]
		}
	), /* @__PURE__ */ React_default.createElement(Divider, { gap: 25 }), /* @__PURE__ */ React_default.createElement(
		SettingSlider, {
			settingKey: "tabMinWidth",
			label: "Tab min width",
			description: "width at which a tab will stop shrinking when there is too many tabs",
			minValue: 50,
			maxValue: 250,
			markers: [50, 100, 150, 200, 250]
		}
	)), /* @__PURE__ */ React_default.createElement(Gap, { gap: 15 }), /* @__PURE__ */ React_default.createElement(Collapsible, { title: "Status" }, ["Tab", "Bookmark", "Folder"].map((type) => {
		return /* @__PURE__ */ React_default.createElement(Collapsible, { title: type }, [
			{ description: "Unreads", settingKey: `show${type}Unreads` },
			{ description: "Pings", settingKey: `show${type}Pings` },
			{ description: "Typing", settingKey: `show${type}Typing` },
			{ description: "Highlight Unread", settingKey: `highlight${type}Unread` }
		].map((props) => [SettingSwtich(props), /* @__PURE__ */ React_default.createElement(Gap, { gap: 5 })]));
	})));
}

// src/Tabbys/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent, null);
Plugin_default.on(Events.START, () => {});
Plugin_default.on(Events.STOP, () => {
	Patcher.unpatchAll();
	reRender(".base_c48ade");
});
module.exports = () => Plugin_default;
