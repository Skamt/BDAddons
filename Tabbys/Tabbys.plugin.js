/**
 * @runAt idle
 * @name Tabbys
 * @description Adds Browser like tabs/bookmarks for channels
 * @version 1.0.14
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Tabbys
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Tabbys/Tabbys.plugin.js
 */

// common/Utils/Array.js
var set = (array, index, item) => array.toSpliced(index, 1, item);
var add = (array, item, index) => array.toSpliced(index ?? array.length, 0, item);
var remove = (array, index) => array.toSpliced(index, 1);
var removeMany = (array, indices) => array.filter((_, i) => indices.indexOf(i) === -1);
var slice = (array, from, to) => array.slice(from, to);

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

// common/React.jsx
var useState = /* @__PURE__ */ (() => BdApi.React.useState)();
var useContext = /* @__PURE__ */ (() => BdApi.React.useContext)();
var useEffect = /* @__PURE__ */ (() => BdApi.React.useEffect)();
var useRef = /* @__PURE__ */ (() => BdApi.React.useRef)();
var useCallback = /* @__PURE__ */ (() => BdApi.React.useCallback)();
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;
var NoopComponent = () => null;

// config:@Config
var Config_default = {
	"info": {
		"name": "Tabbys",
		"version": "1.0.14",
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
		"bookmarkOverflowWrap": false,
		"ctrlClickChannel": true,
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
		"highlightFolderUnread": true,
		"tabSwitch": false
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var getOwnerInstance = /* @__PURE__ */ (() => BdApi.ReactUtils.getOwnerInstance.bind(BdApi.ReactUtils))();

// common/Utils/Logger.js
var Logger_default = Logger;

// common/Plugin.js
var target = /* @__PURE__ */ (() => new EventTarget())();

function wrap(handler) {
	return (e2) => {
		try {
			handler.apply(null, e2);
		} catch (err) {
			Logger_default.error(`Could not run [${e2.type}] handler`, { handler }, "\n", err);
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

// src/Tabbys/styles.css
StylesLoader_default.push(`:root {
	/* overrides */

	--tabbys-bookmarkbar-height: calc(var(--custom-app-top-bar-height) - 5px);

	/* Sizes */
	--size: 32px;
	--tabbys-btn-size: calc(var(--size) * 0.8);
	--tabbys-tab-btn-size: calc(var(--size) * 0.6);
	--radius-round: calc(infinity * 1px);
	--tabs-gap: 8px;
	--bookmarks-gap: 8px;
	--folder-gap: 8px;

	/* Cosmetiques */
	--ping: rgb(218, 62, 68);
	--unread: rgb(88, 101, 242);
	--svg-color: #fff;
}

:root {
	/* --tabbys-bg:var(--neutral-5); */
	--tabbys-bg-hover: var(--background-mod-normal);
	--tabbys-bg-selected: var(--background-mod-strong);

	--tabbys-text: var(--interactive-text-default);
	--tabbys-text-unread: var(--interactive-text-active);

	--tabbys-btn-color: var(--interactive-text-default);
	--tabbys-btn-color-hover: var(--interactive-text-hover);
	--tabbys-btn-color-active: var(--interactive-text-active);

	--tabbys-btn-bg: var(--background-accent);
	--tabbys-btn-bg-hover: var(--interactive-muted);
	--tabbys-btn-bg-active: var(--background-mod-strong);

	--tabbys-folder-menu-bg: var(--background-surface-highest);

}

.no-drag {
	-webkit-app-region: no-drag;
}

.fcc {
	display: flex;
	align-items: center;
	justify-content: center;
}

.rounded-full {
	border-radius: var(--radius-round);
}

.icon-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	overflow: hidden;
}

.icon-wrapper img,
.icon-wrapper svg {
	height: 100%;
	width: 100%;
}

.discord-icon {
	color: white;
	background: #6361f8;
	padding: 4px;
}

.Tabbys-menuitem-move-left svg,
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
	cursor: pointer;
}

.card-title {
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

.card img {
	border-radius: inherit;
}

.typing-dots {
	flex: 0 0 auto;
}
`);

// common/Utils/index.js
function hasOwn(object, key) {
	return object && key && key in object;
}

function clsx(prefix) {
	return (...args) => args.filter(Boolean).map((a) => `${prefix}-${a}`).join(" ");
}
var getPathName = (url) => {
	try {
		return new URL(url).pathname;
	} catch {}
};

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
	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null)
		return false;
	const keysA = Object.keys(objA);
	if (keysA.length !== Object.keys(objB).length) return false;
	for (let i = 0; i < keysA.length; i++)
		if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]]))
			return false;
	return true;
}

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

function getNestedProp(obj, path2) {
	return path2.split(".").reduce((ob, prop) => ob?.[prop], obj);
}

function reRender(selector) {
	const target2 = document.querySelector(selector)?.parentElement;
	if (!target2) return;
	const instance = getOwnerInstance(target2);
	if (!instance) return;
	const unpatch = BdApi.Patcher.instead("RE_RENDER", instance, "render", () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}
var nop = () => {};

// common/consts.js
var LAZY_DISCORD_COMPONENT_WRAPPER = "LazyDiscordComponentWrapper";

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getBySource = /* @__PURE__ */ (() => Webpack.getBySource)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function Suspended({ promise, fallback, ...props }) {
	const comp = React_default.use(promise);
	if (comp) return React_default.createElement(comp, props);
	return fallback;
}

function waitForComponent(filter, options, Fallback = NoopComponent) {
	const promise = waitForModule(filter, options);
	const placeHolderComponent = (props) => /* @__PURE__ */ React_default.createElement(React_default.Suspense, { fallback: /* @__PURE__ */ React_default.createElement(Fallback, null) }, /* @__PURE__ */ React_default.createElement(
		Suspended, {
			...props,
			fallback: /* @__PURE__ */ React_default.createElement(Fallback, null),
			promise
		}
	));
	placeHolderComponent.displayName = LAZY_DISCORD_COMPONENT_WRAPPER;
	return placeHolderComponent;
}

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target2) => target2[type] && filter(target2[type]);
}

function getModuleAndKey(filter, options) {
	let module2;
	const target2 = getModule((entry, m2) => filter(entry) ? module2 = m2 : false, options);
	module2 = module2?.exports;
	if (!module2) return;
	const key = Object.keys(module2).find((k) => module2[k] === target2);
	if (!key) return;
	return [module2, key];
}

// common/DiscordModules/Modules.js
var DiscordPopout = /* @__PURE__ */ (() => getModule((a) => a?.prototype?.render && a.Animation, { searchExports: true }))();
var Dispatcher = /* @__PURE__ */ (() => getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true }))();
var transitionTo = /* @__PURE__ */ (() => getModule(Filters.byStrings("transitionTo - Transitioning to"), { searchExports: true }))();
var IconsUtils = /* @__PURE__ */ (() => getModule((a) => a.getChannelIconURL))();
var ChannelUtils = /* @__PURE__ */ (() => getModule((m2) => m2.openPrivateChannel))();

// common/DiscordModules/zustand.js
var zustand = /* @__PURE__ */ (() => getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
})?.zustand)();
var subscribeWithSelector = /* @__PURE__ */ (() => getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), {
	searchExports: true
}))();

function create(initialState2) {
	const Store2 = /* @__PURE__ */ zustand(initialState2);
	/* @__PURE__ */
	Object.defineProperty(Store2, "state", {
		configurable: false,
		get: () => Store2.getState()
	});
	return Store2;
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

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = /* @__PURE__ */ (() => getStore("UserStore"))();

// common/Utils/String.js
function isValidString(string) {
	return string && string.length > 0;
}

function join(char = "", ...strs) {
	return strs.filter(Boolean).join(char);
}

// MODULES-AUTO-LOADER:@Stores/ChannelStore
var ChannelStore_default = /* @__PURE__ */ (() => getStore("ChannelStore"))();

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = /* @__PURE__ */ (() => getStore("SelectedChannelStore"))();

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
	GROUP_DM: "GROUP_DM",
	GUILD: "GUILD",
	SERVERS: "SERVERS",
	VERIFICATION: "VERIFICATION",
	SHOP: "SHOP",
	NITRO: "NITRO",
	HOME: "HOME",
	CHANNEL: "CHANNEL",
	DM: "DM"
};

// MODULES-AUTO-LOADER:@Stores/UserGuildJoinRequestStore
var UserGuildJoinRequestStore_default = /* @__PURE__ */ (() => getStore("UserGuildJoinRequestStore"))();

// common/DiscordModules/Enums.js
var GuildFeaturesEnum = getModule(Filters.byKeys("CLYDE_ENABLED"), { searchExports: true });
var EmojiSendAvailabilityEnum = getModule(Filters.byKeys("GUILD_SUBSCRIPTION_UNAVAILABLE"), { searchExports: true });
var EmojiIntentionEnum = getModule(Filters.byKeys("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true });
var DiscordPermissionsEnum = getModule(Filters.byKeys("ADD_REACTIONS"), { searchExports: true });
var StickerTypeEnum = getModule(Filters.byKeys("GUILD", "STANDARD"), { searchExports: true });
var ProfileTypeEnum = getModule(Filters.byKeys("POPOUT", "SETTINGS"), { searchExports: true });
var ChannelTypeEnum = getModule(Filters.byKeys("GUILD_TEXT", "DM"), { searchExports: true });
var RelationshipTypeEnum = getModule(Filters.byKeys("FRIEND", "PENDING_INCOMING"), { searchExports: true });

// src/Tabbys/utils.js
var valueToPx = (e2) => `${Math.round(e2)}px`;

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
	"home": { title: "Home", type: pathTypes.HOME }
};
var parsers = [
	{ regex: /^\/quest-home$/, handle: types.quests },
	{ regex: /^\/channels\/@me$/, handle: types.home },
	{ regex: /^\/shop$/, handle: types.shop },
	{ regex: /^\/store$/, handle: types.store },
	{ regex: /^\/discovery\/(applications|servers|quests)/, handle: (type) => types[type] },
	{
		regex: /^\/channels\/(\d+)\/(.+)$/,
		handle(guildId, type) {
			return {
				guildId,
				channelName: type,
				type: pathTypes.CHANNEL,
				path: constructPath(guildId, type)
			};
		}
	},
	{
		regex: /^\/member-verification\/(\d+)/,
		handle(guildId) {
			if (!guildId) return;
			const guild = UserGuildJoinRequestStore_default.getJoinRequestGuild(guildId);
			if (!guild) return;
			return {
				guildId,
				guildName: guild.name,
				icon: guild.icon,
				type: pathTypes.VERIFICATION
			};
		}
	},
	{
		regex: /^\/channels\/(\d+|@favorites)\/(\d+)\/?(?:threads\/(\d+))?/,
		handle(guildId, channelId, threadId) {
			return {
				guildId,
				channelId: threadId || channelId,
				type: pathTypes.CHANNEL,
				path: constructPath(guildId, channelId, threadId)
			};
		}
	},
	{
		regex: /^\/channels\/@me\/(\d+)/,
		handle(channelId) {
			const channel = ChannelStore_default.getChannel(channelId);
			if (!channel) return;
			if (channel.isGroupDM())
				return {
					channelId,
					type: pathTypes.GROUP_DM,
					path: constructPath("@me", channelId)
				};
			const user = UserStore_default.getUser(channel.recipients[0]);
			if (!user) return;
			return {
				type: pathTypes.DM,
				channelId: channel.id,
				path: constructPath("@me", channelId),
				username: getUserName(user),
				avatar: user.avatar,
				userId: user.id
			};
		}
	}
];

function parsePath(path2) {
	if (!path2) return;
	for (let i = parsers.length - 1; i >= 0; i--) {
		const parser = parsers[i];
		const match = path2.match(parser.regex);
		if (!match) continue;
		const [, ...captures] = match;
		if (typeof parser.handle === "function") return parser.handle(...captures, path2);
		return parser.handle;
	}
}

function getNameFromPath(path2) {
	return path2?.split("/").pop() || "???";
}

function constructPath(guildId, channelId, threadId) {
	let path2 = `/channels/${guildId}/${channelId}/`;
	if (threadId) path2 += `threads/${threadId}/`;
	return path2;
}

function navigate({ type, channelId, path: path2, userId }) {
	if (type === pathTypes.DM) {
		const channel = ChannelStore_default.getChannel(channelId);
		if (channel) return transitionTo(path2);
		return ChannelUtils.openPrivateChannel({ recipientIds: [userId] });
	}
	return transitionTo(path2);
}

function getSize(e2) {
	if (e2 >= 32) return { size: 24, avatarSize: "SIZE_24" };
	if (e2 >= 28 && e2 < 32) return { size: 20, avatarSize: "SIZE_20" };
	if (e2 >= 24 && e2 < 28) return { size: 16, avatarSize: "SIZE_16" };
	return { size: 20, avatarSize: "SIZE_20" };
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
	getFirstTab() {
		return this.state.tabs[0];
	},
	getLastTab() {
		return this.state.tabs[this.state.tabs.length - 1];
	},
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
		moveRight(tabId) {
			const tabMeta = this.getTabMeta(tabId);
			const toIndex = tabMeta.nextItem ? tabMeta.index + 1 : 0;
			this.setState({ tabs: arrayMove(this.state.tabs, tabMeta.index, toIndex) });
		},
		moveLeft(tabId) {
			const tabMeta = this.getTabMeta(tabId);
			const toIndex = tabMeta.previousItem ? tabMeta.index - 1 : this.state.tabs.length - 1;
			this.setState({ tabs: arrayMove(this.state.tabs, tabMeta.index, toIndex) });
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
var Store = create(subscribeWithSelector(() => initialState));
Object.defineProperty(Store, "selectors", {
	value: Object.assign({}, folders_default.selectors, tabs_default.selectors, bookmarks_default.selectors)
});
Object.assign(Store, tabs_default.actions, bookmarks_default.actions, folders_default.actions);
Store.subscribe(
	(state) => state,
	() => {
		const user = UserStore_default.getCurrentUser();
		Data.save(user.id, { ...Store.state });
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
Plugin_default.onStart(() => {
	hydrateStore();
	window.navigation.addEventListener("navigate", onLocationChange);
	Dispatcher.subscribe("CONNECTION_OPEN", hydrateStore);
});
Plugin_default.onStop(() => {
	window.navigation.removeEventListener("navigate", onLocationChange);
	Dispatcher.unsubscribe("CONNECTION_OPEN", hydrateStore);
});
var Store_default = Store;

// src/Tabbys/Store/methods.js
function switchLeft() {
	const selectedMeta = Store_default.getTabMeta(Store_default.state.selectedId);
	const target2 = selectedMeta.previousItem ?? Store_default.getLastTab();
	if (!target2) return;
	Store_default.setSelectedId(target2.id);
}

function switchRight() {
	const selectedMeta = Store_default.getTabMeta(Store_default.state.selectedId);
	const target2 = selectedMeta.nextItem ?? Store_default.getFirstTab();
	if (!target2) return;
	Store_default.setSelectedId(target2.id);
}

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

// src/Tabbys/patches/keybinds.js
function onKeyDown(e2) {
	if (!Settings_default.state.tabSwitch) return;
	if (e2.key !== "Tab" || !e2.ctrlKey) return;
	e2.stopPropagation();
	if (e2.shiftKey) switchLeft();
	else switchRight();
}
Plugin_default.onStart(() => document.addEventListener("keydown", onKeyDown));
Plugin_default.onStop(() => document.removeEventListener("keydown", onKeyDown));

// src/Tabbys/patches/logoutInterceptor.js
function interceptor(e2) {
	if (e2.type !== "LOGOUT") return;
	e2.goHomeAfterSwitching = false;
}
Plugin_default.onStart(() => {
	Dispatcher.addInterceptor(interceptor);
	Plugin_default.onStop(
		() => {
			const index = Dispatcher._interceptors.indexOf(interceptor);
			Dispatcher._interceptors.splice(index, 1);
		}, { once: true }
	);
});

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

// src/Tabbys/patches/patchChannelClick.js
var channelComponent = getModule(
	reactRefMemoFilter("render", "children", "onClick", "onKeyPress", "focusProps"), { searchExports: true }
);
Plugin_default.onStart(() => {
	after(channelComponent, "render", ({ args: [props], ret }) => {
		const origClick = getNestedProp(ret, "props.children.props.onClick");
		const path2 = props.href;
		if (!path2 || !origClick) return ret;
		ret.props.children.props.onClick = (e2) => {
			e2.preventDefault();
			if (e2.ctrlKey && Settings_default.state.ctrlClickChannel) Store_default.newTab(path2);
			else origClick?.(e2);
		};
	});
});

// common/Patcher/contextmenu.js
var contextmenuUnPatches = [];
Plugin_default.onStop(() => {
	contextmenuUnPatches.filter(Boolean).forEach((a) => a());
	contextmenuUnPatches = [];
});
var patch2 = (id, callback) => {
	const undo = ContextMenu.patch(id, callback);
	contextmenuUnPatches.push(undo);
};
var patchMultiple = (navIds, callback) => {
	for (let i = 0; i < navIds.length; i++) {
		patch2(navIds[i], callback);
	}
};
var contextmenu_default = ContextMenu;

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
var join2 = (...args) => Array.from(transform(...args)).join(" ");
var classNameFactory = (prefix = "", connector = "-") => (...args) => Array.from(transform(...args), (name) => `${prefix}${connector}${name}`).join(" ");

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
var BookmarkIconPath = "M17 4H7a1 1 0 0 0-1 1v13.74l3.99-3.61a3 3 0 0 1 4.02 0l3.99 3.6V5a1 1 0 0 0-1-1ZM7 2a3 3 0 0 0-3 3v16a1 1 0 0 0 1.67.74l5.66-5.13a1 1 0 0 1 1.34 0l5.66 5.13a1 1 0 0 0 1.67-.75V5a3 3 0 0 0-3-3H7Z";
var BookmarkOutlinedIcon = /* @__PURE__ */ svg(null, /* @__PURE__ */ path({ fillRule: "evenodd" }, BookmarkIconPath));
var ArrowIcon = /* @__PURE__ */ svg(null, "M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z");
var CloseIcon = /* @__PURE__ */ svg(null, "M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z");
var DuplicateIcon = /* @__PURE__ */ svg(null, "M4 5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v.18a1 1 0 1 0 2 0V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h.18a1 1 0 1 0 0-2H5a1 1 0 0 1-1-1V5Z", "M8 11a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3v-8Zm2 0a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-8Z");
var LightiningIcon = /* @__PURE__ */ svg(null, "M7.65 21.75a1 1 0 0 0 1.64.96l11.24-9.96a1 1 0 0 0-.66-1.75h-4.81a.5.5 0 0 1-.5-.6l1.79-8.15a1 1 0 0 0-1.64-.96L3.47 11.25A1 1 0 0 0 4.13 13h4.81c.32 0 .56.3.5.6l-1.79 8.15Z");
var PlusIcon = /* @__PURE__ */ svg(null, "M13 5a1 1 0 1 0-2 0v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2h-6V5Z");
var VectorIcon = /* @__PURE__ */ svg(null, "M20.7 12.7a1 1 0 0 0 0-1.4l-5-5a1 1 0 1 0-1.4 1.4l3.29 3.3H4a1 1 0 1 0 0 2h13.59l-3.3 3.3a1 1 0 0 0 1.42 1.4l5-5Z");
var DiscordIcon = /* @__PURE__ */ svg(null, "M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a18.43 18.43 0 0 0 5.63 2.87c.46-.62.86-1.28 1.2-1.98-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.7 1.7 11.28 0l.46.37c-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.47-4.87-.78-9.09-3.3-12.83ZM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27Zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27Z");
var ServersIcon = /* @__PURE__ */ svg(null, "M10.55 4.4c.13-.24.1-.54-.12-.71L8.6 2.24a1 1 0 0 0-1.24 0l-4 3.15a1 1 0 0 0-.38.79v4.03c0 .43.5.66.82.39l2.28-1.9a3 3 0 0 1 3.84 0c.03.02.08 0 .08-.04V6.42a4 4 0 0 1 .55-2.02ZM7.36 10.23a1 1 0 0 1 1.28 0l1.18.99 2.98 2.48 1.84 1.53a1 1 0 0 1-.67 1.77.1.1 0 0 0-.1.09l-.23 3.06a2 2 0 0 1-2 1.85H4.36a2 2 0 0 1-2-1.85l-.24-3.16a1 1 0 0 1-.76-1.76l6-5Z", "M12 10.2c0 .14.07.28.18.38l3.74 3.12a3 3 0 0 1 .03 4.58.55.55 0 0 0-.2.37l-.12 1.65a4 4 0 0 1-.17.9c-.12.38.13.8.52.8H20a2 2 0 0 0 2-2V3.61a1.5 1.5 0 0 0-2-1.41l-6.66 2.33A2 2 0 0 0 12 6.42");
var QuestsIcon = /* @__PURE__ */ svg(null, "M7.5 21.7a8.95 8.95 0 0 1 9 0 1 1 0 0 0 1-1.73c-.6-.35-1.24-.64-1.9-.87.54-.3 1.05-.65 1.52-1.07a3.98 3.98 0 0 0 5.49-1.8.77.77 0 0 0-.24-.95 3.98 3.98 0 0 0-2.02-.76A4 4 0 0 0 23 10.47a.76.76 0 0 0-.71-.71 4.06 4.06 0 0 0-1.6.22 3.99 3.99 0 0 0 .54-5.35.77.77 0 0 0-.95-.24c-.75.36-1.37.95-1.77 1.67V6a4 4 0 0 0-4.9-3.9.77.77 0 0 0-.6.72 4 4 0 0 0 3.7 4.17c.89 1.3 1.3 2.95 1.3 4.51 0 3.66-2.75 6.5-6 6.5s-6-2.84-6-6.5c0-1.56.41-3.21 1.3-4.51A4 4 0 0 0 11 2.82a.77.77 0 0 0-.6-.72 4.01 4.01 0 0 0-4.9 3.96A4.02 4.02 0 0 0 3.73 4.4a.77.77 0 0 0-.95.24 3.98 3.98 0 0 0 .55 5.35 4 4 0 0 0-1.6-.22.76.76 0 0 0-.72.71l-.01.28a4 4 0 0 0 2.65 3.77c-.75.06-1.45.33-2.02.76-.3.22-.4.62-.24.95a4 4 0 0 0 5.49 1.8c.47.42.98.78 1.53 1.07-.67.23-1.3.52-1.91.87a1 1 0 1 0 1 1.73Z");
var AppsIcon = /* @__PURE__ */ svg(null, /* @__PURE__ */ path({ "fill-rule": "evenodd", "clip-rule": "evenodd" }, "M20.97 4.06c0 .18.08.35.24.43.55.28.9.82 1.04 1.42.3 1.24.75 3.7.75 7.09v4.91a3.09 3.09 0 0 1-5.85 1.38l-1.76-3.51a1.09 1.09 0 0 0-1.23-.55c-.57.13-1.36.27-2.16.27s-1.6-.14-2.16-.27c-.49-.11-1 .1-1.23.55l-1.76 3.51A3.09 3.09 0 0 1 1 17.91V13c0-3.38.46-5.85.75-7.1.15-.6.49-1.13 1.04-1.4a.47.47 0 0 0 .24-.44c0-.7.48-1.32 1.2-1.47l2.93-.62c.5-.1 1 .06 1.36.4.35.34.78.71 1.28.68a42.4 42.4 0 0 1 4.4 0c.5.03.93-.34 1.28-.69.35-.33.86-.5 1.36-.39l2.94.62c.7.15 1.19.78 1.19 1.47ZM20 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM5 7a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2H7v1a1 1 0 1 1-2 0v-1H4a1 1 0 1 1 0-2h1V7Z"));
var SettingIcon = /* @__PURE__ */ svg(
	null,
	"M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
);
var PenIcon = /* @__PURE__ */ svg(null, "m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0 0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0 1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5 1.5 0 0 1-1.73-1.73Z");
var TrashBinIcon = /* @__PURE__ */ svg(null, "M14.25 1c.41 0 .75.34.75.75V3h5.25c.41 0 .75.34.75.75v.5c0 .41-.34.75-.75.75H3.75A.75.75 0 0 1 3 4.25v-.5c0-.41.34-.75.75-.75H9V1.75c0-.41.34-.75.75-.75h4.5Z", /* @__PURE__ */ path({ fillRule: "evenodd", "clip-rule": "evenodd" }, "M5.06 7a1 1 0 0 0-1 1.06l.76 12.13a3 3 0 0 0 3 2.81h8.36a3 3 0 0 0 3-2.81l.75-12.13a1 1 0 0 0-1-1.06H5.07ZM11 12a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm3-1a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"));
var FolderIcon = /* @__PURE__ */ svg({ fill: "none" },
	/* @__PURE__ */
	path({
			"stroke": "currentColor",
			"stroke-width": "2"
		},
		"M3 8.2C3 7.07989 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H9.67452C10.1637 5 10.4083 5 10.6385 5.05526C10.8425 5.10425 11.0376 5.18506 11.2166 5.29472C11.4184 5.4184 11.5914 5.59135 11.9373 5.93726L12.0627 6.06274C12.4086 6.40865 12.5816 6.5816 12.7834 6.70528C12.9624 6.81494 13.1575 6.89575 13.3615 6.94474C13.5917 7 13.8363 7 14.3255 7H17.8C18.9201 7 19.4802 7 19.908 7.21799C20.2843 7.40973 20.5903 7.71569 20.782 8.09202C21 8.51984 21 9.0799 21 10.2V15.8C21 16.9201 21 17.4802 20.782 17.908C20.5903 18.2843 20.2843 18.5903 19.908 18.782C19.4802 19 18.9201 19 17.8 19H6.2C5.07989 19 4.51984 19 4.09202 18.782C3.71569 18.5903 3.40973 18.2843 3.21799 17.908C3 17.4802 3 16.9201 3 15.8V8.2Z"
	)
);
var ShopIcon = /* @__PURE__ */ svg(null, "M21 11.42V19a3 3 0 0 1-3 3h-2.75a.25.25 0 0 1-.25-.25V16a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5.75c0 .14-.11.25-.25.25H6a3 3 0 0 1-3-3v-7.58c0-.18.2-.3.37-.24a4.46 4.46 0 0 0 4.94-1.1c.1-.12.3-.12.4 0a4.49 4.49 0 0 0 6.58 0c.1-.12.3-.12.4 0a4.45 4.45 0 0 0 4.94 1.1c.17-.07.37.06.37.24Z", "M2.63 4.19A3 3 0 0 1 5.53 2H7a1 1 0 0 1 1 1v3.98a3.07 3.07 0 0 1-.3 1.35A2.97 2.97 0 0 1 4.98 10c-2 0-3.44-1.9-2.9-3.83l.55-1.98ZM10 2a1 1 0 0 0-1 1v4a3 3 0 0 0 3 3 3 3 0 0 0 3-2.97V3a1 1 0 0 0-1-1h-4ZM17 2a1 1 0 0 0-1 1v3.98a2.43 2.43 0 0 0 0 .05A2.95 2.95 0 0 0 19.02 10c2 0 3.44-1.9 2.9-3.83l-.55-1.98A3 3 0 0 0 18.47 2H17Z");
var NitroIcon = /* @__PURE__ */ svg(null, "M16.23 12c0 1.29-.95 2.25-2.22 2.25A2.18 2.18 0 0 1 11.8 12c0-1.29.95-2.25 2.22-2.25 1.27 0 2.22.96 2.22 2.25ZM23 12c0 5.01-4 9-8.99 9a8.93 8.93 0 0 1-8.75-6.9H3.34l-.9-4.2H5.3c.26-.96.68-1.89 1.21-2.7H1.89L1 3h12.74C19.13 3 23 6.99 23 12Zm-4.26 0c0-2.67-2.1-4.8-4.73-4.8A4.74 4.74 0 0 0 9.28 12c0 2.67 2.1 4.8 4.73 4.8a4.74 4.74 0 0 0 4.73-4.8Z");
var IdIcon = /* @__PURE__ */ svg(null, "M15.3 14.48c-.46.45-1.08.67-1.86.67h-1.39V9.2h1.39c.78 0 1.4.22 1.86.67.46.45.68 1.22.68 2.31 0 1.1-.22 1.86-.68 2.31Z", /* @__PURE__ */ path({ fillRule: "evenodd" }, "M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm1 15h2.04V7.34H6V17Zm4-9.66V17h3.44c1.46 0 2.6-.42 3.38-1.25.8-.83 1.2-2.02 1.2-3.58s-.4-2.75-1.2-3.58c-.79-.83-1.92-1.25-3.38-1.25H10Z"));

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = /* @__PURE__ */ (() => getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true }))();

// common/Components/Button/index.jsx
function ButtonComponentFallback(props) {
	return /* @__PURE__ */ React_default.createElement("button", { ...props });
}
var ManaButton = /* @__PURE__ */ (() => getModule(Filters.byStrings(`"data-mana-component":"button"`), { searchExports: true }) || ButtonComponentFallback)();
var ManaTextButton = /* @__PURE__ */ (() => getModule(Filters.byStrings(`"data-mana-component":"text-button"`), { searchExports: true }) || ButtonComponentFallback)();

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

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary_default = (props) => /* @__PURE__ */ React_default.createElement(BdApi.Components.ErrorBoundary, { ...props, name: Config_default?.info?.name });

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
var c = classNameFactory("fieldset");

function FieldSet({ label, description, children, gap = 15, direction = FieldSet.direction.VERTICAL }) {
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
	), /* @__PURE__ */ React_default.createElement(
		"div", {
			className: c("content", direction),
			style: { gap }
		},
		children
	));
}
FieldSet.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
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

// src/Tabbys/components/PromptModal/index.jsx
var c2 = clsx("create-folder-modal");

function PromptModal({ modalProps, required, title, placeholder, label, initialValue = "", onSubmit }) {
	const [val, setVal] = useState(initialValue);
	const [submitted, setSubmitted] = useState(false);
	const inputRef = useRef();
	const saveHandler = (e2) => {
		e2.preventDefault();
		setSubmitted(true);
		try {
			onSubmit?.(val);
			modalProps.onClose?.();
		} finally {
			setSubmitted(false);
		}
	};
	const resetHandler = () => {
		setVal("");
		inputRef.current.focus();
	};
	return /* @__PURE__ */ React_default.createElement("form", { onSubmit: saveHandler }, /* @__PURE__ */ React_default.createElement(
		Modals.ModalRoot, {
			...modalProps,
			fullscreenOnMobile: false,
			className: c2("root")
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
		React_default.createElement("div", { className: c2("content") }, /* @__PURE__ */ React_default.createElement(FieldSet, { label }, /* @__PURE__ */ React_default.createElement(
			TextInput_default, {
				inputRef,
				value: val,
				onChange: setVal,
				fullWidth: true,
				required,
				placeholder: placeholder || initialValue,
				autoFocus: true
			}
		)), /* @__PURE__ */ React_default.createElement(
			ManaTextButton, {
				text: "Reset Name",
				textVariant: "text-sm/medium",
				type: "button",
				onClick: resetHandler
			}
		)),
		/* @__PURE__ */
		React_default.createElement(
			Modals.ModalFooter, {
				className: c2("footer"),
				separator: true
			},
			/* @__PURE__ */
			React_default.createElement(
				ManaButton, {
					text: "Save",
					disable: submitted,
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
	));
}

function openPromptModal(props) {
	ModalActions.openModal((e2) => /* @__PURE__ */ React_default.createElement(ErrorBoundary_default, null, /* @__PURE__ */ React_default.createElement(
		PromptModal, {
			modalProps: e2,
			...props
		}
	)));
}

// src/Tabbys/contextmenus/shared.js
function MarkAsReadItem(channelId, hasUnread) {
	return !channelId ? [] : [{
			action: () => channelId && Dispatcher.dispatch({
				type: "CHANNEL_ACK",
				channelId,
				force: true
			}),
			label: "Mark as read",
			disabled: !hasUnread
		},
		{ type: "separator" }
	];
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

function copyItem(type, content) {
	const label = {
		channel: "Copy Channel ID",
		user: "Copy User ID",
		guild: "Copy Server ID",
		path: "Copy path"
	} [type];
	const item = {
		action: () => copy(content),
		label
	};
	if (type !== "path") item.leadingAccessory = { type: "icon", icon: IdIcon };
	return item;
}

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

function getFolders(transformer) {
	const items = [];
	for (let i = 0; i < Store_default.state.folders.length; i++) {
		const folder = Store_default.state.folders[i];
		const item = transformer(folder.id, folder.name);
		if (item) items.push(item);
	}
	return sanitize(items);
}

function getCopies({ guildId, userId, path: path2, channelId }) {
	const items = [];
	if (channelId) items.push(copyItem("channel", channelId));
	if (guildId) items.push(copyItem("guild", guildId));
	if (userId) items.push(copyItem("user", userId));
	if (path2) items.push(copyItem("path", path2));
	return sanitize(items);
}
var sanitize = (items) => items.filter(Boolean).map(wrapMenuItem);

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
	const menu2 = [contextmenu_default.buildItem({ type: "separator" })];
	const folders = Store_default.state.folders.map(
		({ id: id2, name }) => wrapMenuItem({
			action: () => addToFolderAt(path2, id2),
			label: name,
			leadingAccessory: { type: "icon", icon: BookmarkOutlinedIcon }
		})
	);
	const bookmark = {
		action: () => addBookmarkAt(path2),
		label: "Bookmark channel",
		type: folders.length > 0 ? "submenu" : null,
		leadingAccessory: { type: "icon", icon: folders.length > 0 ? nop : BookmarkOutlinedIcon },
		items: folders
	};
	const tab = {
		action: () => Store_default.newTab(path2),
		leadingAccessory: { type: "icon", icon: PlusIcon },
		label: "Open in new Tab"
	};
	const id = `${Config_default.info.name}-channel-options`;
	if (showBookmarkbar && !showTabbar) menu2.push(contextmenu_default.buildItem({ id, ...bookmark }));
	else if (!showBookmarkbar && showTabbar) menu2.push(contextmenu_default.buildItem({ id, ...tab }));
	else if (showBookmarkbar && showTabbar)
		menu2.push(
			contextmenu_default.buildItem({
				type: "submenu",
				id,
				label: Config_default.info.name,
				items: [tab, bookmark]
			})
		);
	return menu2;
}
Plugin_default.onStart(() => {
	patchMultiple(["thread-context", "channel-context"], (retVal, { channel, targetIsUser }) => {
		if (!channel || targetIsUser) return;
		const path2 = getPath(channel);
		if (!path2) return;
		retVal.props.children.push(...menu(path2));
	});
	patch2("channel-mention-context", (retVal, { originalLink }) => {
		const path2 = getPathName(originalLink);
		if (!path2) return;
		retVal.props.children.push(...menu(path2));
	});
	patch2("user-context", (retVal, { user }) => {
		if (user.email) return;
		const channel = ChannelStore_default.getDMChannelFromUserId(user.id);
		if (!channel) return;
		const path2 = getPath(channel);
		if (!path2) return;
		retVal.props.children.push(...menu(path2));
	});
});

// src/Tabbys/patches/patchDMClick.js
var DMChannel = getModule(
	reactRefMemoFilter("render", "navigate", "location", "href", "createHref"), { searchExports: true }
);
Plugin_default.onStart(() => {
	before(DMChannel, "render", ({ args: [props] }) => {
		const path2 = props.to;
		if (!path2) return;
		props.onClick = (e2) => {
			if (e2.ctrlKey && Settings_default.state.ctrlClickChannel) {
				e2.preventDefault();
				Store_default.newTab(path2);
			}
		};
	});
});

// src/Tabbys/patches/patchGuildClick.js
var GuildComponent = getBySource("guildsnav", {
	declarationFilter: Filters.byComponentType(Filters.byStrings("aria-owns=folder-items-", "onDragOverChanged"))
});
Plugin_default.onStart(() => {
	after(GuildComponent, "type", ({ args: [{ guild }], ret }) => {
		const targetProps = getNestedProp(ret, "props.children.1.props.children.props.children.props.children.props.children.props.children.props");
		if (!targetProps) return ret;
		const origClick = targetProps.onClick;
		const path2 = getGuildChannelPath(guild.id);
		targetProps.onClick = (e2) => {
			e2.preventDefault();
			if (e2.ctrlKey && Settings_default.state.ctrlClickChannel) Store_default.newTab(path2);
			else origClick?.(e2);
		};
	});
});

// src/Tabbys/components/App/styles.css
StylesLoader_default.push(`div:has(> .tabbys-app-container):not(#a) {
	grid-template-rows: [top] auto [titleBarEnd] min-content [noticeEnd] 1fr [end];
	padding-top: 0;
}

.tabbys-app-settings-button ~ :not([class^=winButtons]) svg{
	height: 100% !important;
	width: 100% !important;
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
	display: flex;
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
	color: var(--tabbys-btn-color);
	cursor: pointer;
}

.tabbys-app-settings-button:hover {
	color: var(--tabbys-btn-color-hover);
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

function getElMeta(target2) {
	if (!target2) return;
	const res = {
		parentMeta: getElRect(target2.parentElement),
		nextSiblingMeta: getElRect(target2.nextElementSibling),
		previousSiblingMeta: getElRect(target2.previousElementSibling),
		targetMeta: getElRect(target2)
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
var c4 = clsx("scroller");

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
		const target2 = scrollerNode.children[index];
		if (!target2) return;
		const { parentMeta, targetMeta, nextSiblingMeta, previousSiblingMeta } = getElMeta(target2);
		if (!nextSiblingMeta) return scroll(targetMeta.right + targetMeta.width - parentMeta.right);
		if (!previousSiblingMeta) return scroll(targetMeta.left - targetMeta.width - parentMeta.left);
		if (targetMeta.left < parentMeta.left) return scroll(previousSiblingMeta.right - parentMeta.left);
		if (targetMeta.right > parentMeta.right) return scroll(nextSiblingMeta.left - parentMeta.right);
	}
	return /* @__PURE__ */ React_default.createElement("div", { className: join2(c4("container"), containerClassName) }, isOverflowing && // biome-ignore lint/a11y/useButtonType: <explanation>
		/* @__PURE__ */
		React_default.createElement(
			"button", {
				onClick: () => scroll(-1 * scrollDelta()),
				className: join2(c4("btn", "btn-start"), "icon-wrapper", "rounded-full", scrollButtonClassName, startScrollButtonClassName)
			},
			/* @__PURE__ */
			React_default.createElement(ArrowIcon, null)
		), /* @__PURE__ */ React_default.createElement(
			"div", {
				ref,
				className: join2(c4("content"), contentClassName)
			},
			items.map((item, index) => renderItem(item, index))
		), isOverflowing && // biome-ignore lint/a11y/useButtonType: <explanation>
		/* @__PURE__ */
		React_default.createElement(
			"button", {
				onClick: () => scroll(scrollDelta()),
				className: join2(c4("btn", "btn-end"), "icon-wrapper", "rounded-full", scrollButtonClassName, endScrollButtonClassName)
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
var c5 = classNameFactory("dnd");

function DroppableMarkup({ isOver, canDrop, dropRef, draggedIsMe, dragInProgress, pos }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			ref: dropRef,
			className: c5("droppable", pos, !draggedIsMe && canDrop && isOver && "over", canDrop && dragInProgress && "dragInProgress")
		}
	);
}

// src/Tabbys/components/DND/shared.jsx
var DragSource;
var DropTarget;
waitForModule(Filters.byStrings("drag-source", "collect"), { searchExports: true }).then((a) => DragSource = a);
waitForModule(Filters.byStrings("drop-target", "collect"), { searchExports: true }).then((a) => DropTarget = a);

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

function makeDroppable(types2, drop) {
	let Result = null;
	return (Comp) => {
		return (props) => {
			if (Result) return /* @__PURE__ */ React_default.createElement(Result, { ...props });
			if (DropTarget) {
				Result = DropTarget(types2, { drop }, collect)(Comp);
				return /* @__PURE__ */ React_default.createElement(Result, { ...props });
			}
			return /* @__PURE__ */ React_default.createElement(
				Comp, {
					...props,
					dropRef: (a) => {}
				}
			);
		};
	};
}

function makeDraggable(type) {
	let Result = null;
	return (Comp) => {
		return (props) => {
			if (Result) return /* @__PURE__ */ React_default.createElement(Result, { ...props });
			if (DropTarget) {
				Result = DragSource(type, { beginDrag: (a) => a }, (connect, monitor) => ({
					isDragging: !!monitor.isDragging(),
					dragRef: connect.dragSource()
				}))(Comp);
				return /* @__PURE__ */ React_default.createElement(Result, { ...props });
			}
			return /* @__PURE__ */ React_default.createElement(
				Comp, {
					...props,
					dragRef: (a) => {}
				}
			);
		};
	};
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

// src/Tabbys/contextmenus/TabContextMenu.jsx
function TabContextMenu_default(id, { path: path2, channelId, userId, guildId, hasUnread }) {
	const canClose = Store_default.getTabsCount() > 1;
	const folders = getFolders((folderId, name) => ({
		action: () => addTabToFolderAt(id, folderId),
		label: name,
		icon: BookmarkOutlinedIcon
	}));
	const Menu2 = ContextMenu.buildMenu(
		sanitize([
			...MarkAsReadItem(channelId, hasUnread),
			{
				action: () => Store_default.addTabToRight(id),
				label: "New tab to right",
				leadingAccessory: { type: "icon", icon: VectorIcon }
			},
			{
				action: () => Store_default.addTabToLeft(id),
				label: "New tab to left",
				leadingAccessory: { type: "icon", icon: VectorIcon }
			},
			{ type: "separator" },
			{
				action: () => Store_default.duplicateTab(id),
				label: "Duplicate tab",
				leadingAccessory: { type: "icon", icon: DuplicateIcon }
			},
			{
				label: "Bookmark tab",
				action: () => bookmarkTabAt(id),
				type: folders.length > 0 ? "submenu" : null,
				leadingAccessory: { type: "icon", icon: BookmarkOutlinedIcon },
				items: folders
			},
			{ type: "separator" },
			...getCopies({ path: path2, channelId, userId, guildId }),
			{ type: "separator" },
			{
				type: "submenu",
				label: "Move",
				items: sanitize([{
						action: () => Store_default.moveRight(id),
						label: "Move right",
						leadingAccessory: { type: "icon", icon: VectorIcon }
					},
					{
						action: () => Store_default.moveLeft(id),
						label: "Move Left",
						leadingAccessory: { type: "icon", icon: VectorIcon }
					}
				])
			},
			canClose && { type: "separator" },
			canClose && {
				type: "submenu",
				label: "Close",
				action: () => Store_default.removeTab(id),
				color: "danger",
				items: sanitize([{
						action: () => removeTabsToRight(id),
						label: "Close Tabs to Right",
						leadingAccessory: { type: "icon", icon: VectorIcon },
						color: "danger"
					},
					{
						action: () => removeTabsToLeft(id),
						label: "Close Tabs to Left",
						leadingAccessory: { type: "icon", icon: VectorIcon },
						color: "danger"
					},
					{
						action: () => removeOtherTabs(id),
						label: "Close Other Tabs",
						leadingAccessory: { type: "icon", icon: LightiningIcon },
						color: "danger"
					}
				])
			}
		])
	);
	return (props) => /* @__PURE__ */ React_default.createElement(Menu2, { ...props });
}

// MODULES-AUTO-LOADER:@Modules/useStateFromStores
var useStateFromStores_default = /* @__PURE__ */ (() => getModule(Filters.byStrings("getStateFromStores"), { searchExports: true }))();

// MODULES-AUTO-LOADER:@Stores/ReadStateStore
var ReadStateStore_default = /* @__PURE__ */ (() => getStore("ReadStateStore"))();

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

// src/Tabbys/components/TypingDots/index.jsx
var TypingDots = waitForComponent(reactRefMemoFilter("type", "dotRadius", "className"), { searchExports: true });

function TypingDots_default({ users }) {
	const typingUsersNames = users?.map(getUserName).join(", ");
	return /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: typingUsersNames }, /* @__PURE__ */ React_default.createElement("div", { className: join(" ", "typing-dots", "fcc") }, /* @__PURE__ */ React_default.createElement(TypingDots, { dotRadius: 2.5 })));
}

// MODULES-AUTO-LOADER:@Stores/TypingStore
var TypingStore_default = /* @__PURE__ */ (() => getStore("TypingStore"))();

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
			return channelIds.map(getChannelState).reduce(
				(acc, item) => {
					const [mentionCount2, unreadCount2, hasUnread2] = item;
					acc[0] += mentionCount2;
					acc[1] += unreadCount2;
					acc[2] = acc[2] || hasUnread2;
					return acc;
				},
				[0, 0, false]
			);
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

// src/Tabbys/components/Card/context.js
var HideTitleContext = React_default.createContext(false);

// MODULES-AUTO-LOADER:@Stores/GuildStore
var GuildStore_default = /* @__PURE__ */ (() => getStore("GuildStore"))();

// common/Utils/Channel.js
function getGroupDmIcon(channelId, size) {
	const channel = ChannelStore_default.getChannel(channelId);
	return !channel ? "" : IconsUtils.getChannelIconURL({
		id: channel.id,
		icon: channel.icon,
		applicationId: channel.getApplicationId(),
		size
	});
}

function getGuildIcon(guildId, size) {
	const guild = GuildStore_default.getGuild(guildId);
	return !guild ? "" : IconsUtils.getGuildIconURL({
		id: guildId,
		icon: guild.icon,
		size
	});
}

// src/Tabbys/components/Card/Markup.jsx
function Markup({ icon, title }) {
	const hideTitle = React_default.useContext(HideTitleContext);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, icon, !hideTitle && /* @__PURE__ */ React_default.createElement("div", { className: "card-title" }, title));
}

// src/Tabbys/components/Card/Icon.jsx
function IconWrapper({ children, className }) {
	return /* @__PURE__ */ React_default.createElement("div", { className: join2("card-icon", className) }, children);
}

function Icon({ size, src, alt, icon, className }) {
	if (src)
		return /* @__PURE__ */ React_default.createElement(IconWrapper, { className: join2("icon-wrapper", className) }, /* @__PURE__ */ React_default.createElement(
			"img", {
				width: size,
				height: size,
				src,
				alt
			}
		));
	if (icon) return /* @__PURE__ */ React_default.createElement(IconWrapper, { className }, icon);
	return /* @__PURE__ */ React_default.createElement(IconWrapper, { className: join2("icon-wrapper", "discord-icon", className) }, /* @__PURE__ */ React_default.createElement(DiscordIcon, null));
}

// src/Tabbys/components/Card/Channel.jsx
function Channel({ name, channelName, guildId, channelId }) {
	const { size } = getSize(Settings_default((_) => _.size));
	const channel = useStateFromStores_default([ChannelStore_default], () => ChannelStore_default.getChannel(channelId), [channelId]);
	const title = name || channelName || channel?.name || channelId;
	const src = getGuildIcon(guildId || channel?.guild_id, size);
	return /* @__PURE__ */ React_default.createElement(
		Markup, {
			icon: /* @__PURE__ */ React_default.createElement(
				Icon, {
					size,
					src,
					alt: title
				}
			),
			title
		}
	);
}

// MODULES-AUTO-LOADER:@Stores/PresenceStore
var PresenceStore_default = /* @__PURE__ */ (() => getStore("PresenceStore"))();

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

// src/Tabbys/components/Card/DM.jsx
function getUserAvatar(id, avatar, size) {
	return `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp?size=${size}`;
}

function DM({ name, userId, avatar, username }) {
	const { size, avatarSize } = getSize(Settings_default((_) => _.size));
	const user = useStateFromStores_default([UserStore_default], () => UserStore_default.getUser(userId), [userId]);
	const title = name || getUserName(user) || username || userId;
	const src = getUserAvatar(user.id || userId, user.avatar || avatar, size);
	return /* @__PURE__ */ React_default.createElement(
		Markup, {
			icon: /* @__PURE__ */ React_default.createElement(
				Icon, {
					className: join2("fcc"),
					icon: /* @__PURE__ */ React_default.createElement(
						UserAvatar_default, {
							id: user.id,
							src,
							size: avatarSize
						}
					)
				}
			),
			title
		}
	);
}

// src/Tabbys/components/Card/Generic.jsx
function Generic({ title, type }) {
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
	}
	return /* @__PURE__ */ React_default.createElement(
		Markup, {
			icon: /* @__PURE__ */ React_default.createElement(
				Icon, {
					className: "icon-wrapper",
					icon
				}
			),
			title
		}
	);
}

// src/Tabbys/components/Card/GroupDM.jsx
function GroupDM({ name, channelId }) {
	const { size } = getSize(Settings_default((_) => _.size));
	const channel = useStateFromStores_default([ChannelStore_default], () => ChannelStore_default.getChannel(channelId), [channelId]);
	const title = name || channel?.rawRecipients?.map(getUserName).join(", ") || channelId;
	const src = getGroupDmIcon(channelId, size);
	return /* @__PURE__ */ React_default.createElement(
		Markup, {
			icon: /* @__PURE__ */ React_default.createElement(
				Icon, {
					size,
					src,
					alt: title
				}
			),
			title
		}
	);
}

// src/Tabbys/components/Card/MemberVerification.jsx
function MemberVerification({ icon, guildName, name, guildId }) {
	const { size } = getSize(Settings_default((_) => _.size));
	const title = name || guildName || guildId;
	const src = IconsUtils.getGuildIconURL({
		id: guildId,
		icon,
		size
	});
	return /* @__PURE__ */ React_default.createElement(
		Markup, {
			icon: /* @__PURE__ */ React_default.createElement(
				Icon, {
					size,
					src,
					alt: title
				}
			),
			title
		}
	);
}

// src/Tabbys/components/Card/Content.jsx
function Content({ type, ...props }) {
	switch (type) {
		case pathTypes.CHANNEL:
			return /* @__PURE__ */ React_default.createElement(Channel, { ...props });
		case pathTypes.DM:
			return /* @__PURE__ */ React_default.createElement(DM, { ...props });
		case pathTypes.GROUP_DM:
			return /* @__PURE__ */ React_default.createElement(GroupDM, { ...props });
		case pathTypes.VERIFICATION:
			return /* @__PURE__ */ React_default.createElement(MemberVerification, { ...props });
		case pathTypes.NITRO:
		case pathTypes.SHOP:
		case pathTypes.SERVERS:
		case pathTypes.QUESTS:
		case pathTypes.APPS:
		case pathTypes.HOME:
			return /* @__PURE__ */ React_default.createElement(
				Generic, {
					type,
					...props
				}
			);
	}
	return /* @__PURE__ */ React_default.createElement(
		Markup, {
			icon: /* @__PURE__ */ React_default.createElement(Icon, null),
			title: getNameFromPath(props.path)
		}
	);
}

// src/Tabbys/components/Tab/index.jsx
var c7 = classNameFactory("tab");

function Tab2({ id, isOver, canDrop, isDragging, dragRef, dropRef }) {
	const tab = Store_default((state) => Store_default.getTab(id), shallow);
	const { guildId, userId, path: path2, channelId } = tab;
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
	const onMiddleClick = (e2) => {
		if (e2.button !== 1) return;
		e2.preventDefault();
		Store_default.removeTab(id);
	};
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			onAuxClick: onMiddleClick,
			onContextMenu: contextmenuHandler,
			ref: (e2) => dragRef(dropRef(e2)),
			className: join2(c7("container", isOver && canDrop && "canDrop"), { isSelected, hasUnread, isDragging }, "card"),
			onClick
		},
		/* @__PURE__ */
		React_default.createElement(Tab_default, { id }),
		/* @__PURE__ */
		React_default.createElement(Content, { ...tab }),
		/* @__PURE__ */
		React_default.createElement(
			ChannelStatus, {
				type: "Tab",
				channelIds: [channelId]
			}
		),
		/* @__PURE__ */
		React_default.createElement(
			"div", {
				className: join2(c7("close-button"), "icon-wrapper", "card-button"),
				onClick: onCloseClick
			},
			/* @__PURE__ */
			React_default.createElement(CloseIcon, null)
		)
	);
}
var Tab_default3 = React_default.memo(Tab_default2(Tab2));

// MODULES-AUTO-LOADER:@Stores/ContextMenuStore
var ContextMenuStore_default = /* @__PURE__ */ (() => getStore("ContextMenuStore"))();

// MODULES-AUTO-LOADER:@Stores/LayerStore
var LayerStore_default = /* @__PURE__ */ (() => getStore("LayerStore"))();

// src/Tabbys/components/DragHandle/index.jsx
var { BasePopout } = getMangled(Filters.bySource("renderLayer", "POPOUT_PREVENT_CLOSE"), {
	BasePopout: (a) => a.contextType
});
var { ExpressionPickerStore } = getMangled("expression-picker-last-active-view", {
	ExpressionPickerStore: (a) => a.getState
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
	const isExpressionPickerOpen = ExpressionPickerStore((a) => a.activeView);
	const hasPopout = usePopoutListener();
	const hasAny = ModalActions.useModalsStore((a) => a.default?.length > 0 || a.popout?.length > 0);
	const hasLayers = useStateFromStores_default([LayerStore_default], () => LayerStore_default.hasLayers());
	const isOpen = useStateFromStores_default([ContextMenuStore_default], () => ContextMenuStore_default.isOpen());
	const style = { width: "100%", flex: "1 0 0" };
	if (!isExpressionPickerOpen && !hasAny && !isOpen && !hasLayers && !hasPopout) style["-webkit-app-region"] = "drag";
	return /* @__PURE__ */ React_default.createElement("div", { style });
}

// src/Tabbys/components/TabBar/index.jsx
var c8 = clsx("tabbar");

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
			className: c8("container")
		},
		/* @__PURE__ */
		React_default.createElement(
			TabsScroller, {
				shouldScroll: selectedId,
				scrollTo: selectedIndex,
				containerClassName: c8("tabs-scroller-container"),
				contentClassName: c8("tabs-scroller-content"),
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
				className: join2(c8("new-tab"), "icon-wrapper"),
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

.bookmarkbar-wrap {
	flex-wrap: wrap;
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
		placeholder: bookmark.username || "",
		initialValue: bookmark.name,
		onSubmit: (name) => setBookmarkName(id, name, parentId)
	});
}

function BookmarkContextMenu_default(id, { path: path2, channelId, userId, guildId, parentId, hasUnread }) {
	const folders = getFolders((folderId, name) => {
		if (folderId === parentId) return;
		return {
			action: () => moveBookmarkToFolderAt(id, folderId, parentId),
			label: name
		};
	});
	if (parentId) {
		if (folders.length) folders.push({ type: "separator" });
		folders.push({
			action: () => moveSubBookmarkToBookmarksAt(id, parentId),
			label: "Move To BookmarkBar"
		});
	}
	const Menu2 = ContextMenu.buildMenu(
		sanitize([
			...MarkAsReadItem(channelId, hasUnread),
			{
				action: () => openTabAt(path2),
				label: "Open in new Tab",
				leadingAccessory: { type: "icon", icon: PlusIcon }
			},
			{
				action: () => renameBookmark(id, parentId),
				label: "Rename",
				leadingAccessory: { type: "icon", icon: PenIcon }
			},
			{ type: "separator" },
			folders.length > 0 && {
				type: "submenu",
				label: "Move to folder",
				items: folders
			},
			{
				type: "toggle",
				label: "Hide Name",
				active: getBookmarkNameState(id, parentId),
				action: () => toggleBookmarkNameState(id, parentId)
			},
			{ type: "separator" },
			...getCopies({ path: path2, channelId, userId, guildId }),
			{ type: "separator" },
			{
				action: () => createFolder2(parentId),
				label: parentId ? "Create Sub Folder" : "Create Folder",
				leadingAccessory: { type: "icon", icon: PlusIcon }
			},
			{ type: "separator" },
			{
				color: "danger",
				label: "Delete Bookmark",
				leadingAccessory: { type: "icon", icon: TrashBinIcon },
				action: () => deleteBookmark(id, parentId)
			}
		])
	);
	return (props) => /* @__PURE__ */ React_default.createElement(Menu2, { ...props });
}

// src/Tabbys/components/Bookmark/index.jsx
function BaseBookmark({ id, parentId, dragRef, onClose, className }) {
	const shouldHightLight = Settings_default(Settings_default.selectors.highlightBookmarkUnread);
	const bookmark = Store_default((state) => parentId ? Store_default.getFolderItem(parentId, id) : Store_default.getBookmark(id), shallow) || {};
	const { noName, guildId, userId, path: path2, channelId } = bookmark;
	const hasUnread = useStateFromStores_default([ReadStateStore_default], () => shouldHightLight && ReadStateStore_default.hasUnread(channelId), [shouldHightLight, channelId]);
	const isSubBookmark = !!parentId;
	const sortHandle = isSubBookmark ? /* @__PURE__ */ React_default.createElement(
		SubBookmark_default, {
			id,
			parentId
		}
	) : /* @__PURE__ */ React_default.createElement(Bookmark_default, { id });
	const onClick = (e2) => {
		e2.stopPropagation();
		onClose?.();
		if (e2.ctrlKey) Store_default.newTab(path2);
		else openBookmark(id, parentId);
	};
	const onMiddleClick = (e2) => {
		if (e2.button !== 1) return;
		e2.preventDefault();
		Store_default.newTab(path2);
	};
	const contextmenuHandler = (e2) => {
		ContextMenu.open(e2, BookmarkContextMenu_default(id, { path: path2, guildId, userId, parentId, channelId, hasUnread }), {
			position: "bottom",
			align: "left"
		});
	};
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			onAuxClick: onMiddleClick,
			"data-id": isSubBookmark ? null : id,
			ref: dragRef,
			onContextMenu: contextmenuHandler,
			className: join2("bookmark-container", "card", isSubBookmark && "folder-item", className, { hasUnread }),
			onClick
		},
		/* @__PURE__ */
		React_default.createElement(HideTitleContext.Provider, { value: noName }, /* @__PURE__ */ React_default.createElement(Content, { ...bookmark })),
		/* @__PURE__ */
		React_default.createElement(
			ChannelStatus, {
				type: "Bookmark",
				channelIds: [channelId]
			}
		),
		sortHandle
	);
}
var Bookmark2 = React_default.memo(makeDraggable(DNDTypes.BOOKMARK)((props) => /* @__PURE__ */ React_default.createElement(BaseBookmark, { ...props })));
var SubBookmark2 = React_default.memo(makeDraggable(DNDTypes.SUB_BOOKMARK)((props) => /* @__PURE__ */ React_default.createElement(BaseBookmark, { ...props })));

// common/Components/Popout/index.jsx
var Popout_default = Object.assign(({ children, targetElementRef, ...props }) => {
	const ref = useRef();
	const helperRef = useCallback((e2) => {
		if (e2) ref.current = e2.nextElementSibling;
	}, []);
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
			return targetElementRef ? children(p) : /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement("span", { ref: helperRef, style: { display: "contents" } }), children(p));
		}
	);
}, DiscordPopout);

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
	const folders = getFolders((targetFolderId, name) => {
		if (targetFolderId === folderId) return;
		if (targetFolderId === parentId) return;
		if (isDescendent(folderId, targetFolderId)) return;
		return {
			action: () => moveFolderToFolderAt(folderId, id, targetFolderId, parentId),
			label: name
		};
	});
	if (parentId) {
		if (folders.length) folders.push({ type: "separator" });
		folders.push({
			action: () => moveSubFolderToBookmarksAt(folderId, id, parentId),
			label: "Move To BookmarkBar"
		});
	}
	const hasFolders = folders.length > 0;
	const Menu2 = ContextMenu.buildMenu(
		sanitize([{
				action: () => createFolder2(folderId),
				label: "Create Sub Folder",
				leadingAccessory: { type: "icon", icon: PlusIcon }
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
				leadingAccessory: { type: "icon", icon: PlusIcon }
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
				leadingAccessory: { type: "icon", icon: TrashBinIcon },
				action: () => deleteFolder(folderId, id, parentId)
			}
		])
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

function NoBookmarks() {
	return /* @__PURE__ */ React_default.createElement("div", { className: c12("empty") }, "You have no bookmarks yet");
}

function BookmarkBarWrapAround() {
	const bookmarks = Store_default(Store_default.selectors.bookmarks, shallow);
	const content = bookmarks.map(({ id, folderId }) => getItem({}, id, folderId));
	return /* @__PURE__ */ React_default.createElement("div", { className: c12("container") }, /* @__PURE__ */ React_default.createElement("div", { className: c12("content", "wrap") }, content.length > 0 ? content : /* @__PURE__ */ React_default.createElement(NoBookmarks, null), /* @__PURE__ */ React_default.createElement(DragHandle, null)));
}

function BookmarkBarOverflowMenu() {
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
		content.length > 0 ? content : /* @__PURE__ */ React_default.createElement(NoBookmarks, null)
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

function BookmarkBar() {
	const bookmarkOverflowWrap = Settings_default(Settings_default.selectors.bookmarkOverflowWrap, shallow);
	return bookmarkOverflowWrap ? /* @__PURE__ */ React_default.createElement(BookmarkBarWrapAround, null) : /* @__PURE__ */ React_default.createElement(BookmarkBarOverflowMenu, null);
}

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
var c13 = classNameFactory("divider");

function Divider({ gap = 15, gutter = 0, direction = Divider.direction.HORIZONTAL }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { "--divider-gap": `${gap}px`, "--divider-gutter": `${gutter}%` },
			className: c13("base", direction)
		}
	);
}
Divider.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// common/Components/SettingSlider/index.jsx
function SettingSlider({ settingKey, border, label, description, ...props }) {
	const [val, set2] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Slider_default, {
			...props,
			mini: true,
			label,
			description,
			initialValue: val,
			onValueChange: (e2) => set2(Math.round(e2))
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, null));
}

// src/Tabbys/contextmenus/SettingsContextMenu.jsx
var c14 = classNameFactory(`${Config_default.info.name}-menuitem`);
var { Separator, CheckboxItem, RadioItem, ControlItem, Group, Item, Menu } = ContextMenu;

function ContextMenuToggle({ settingKey, label, color }) {
	const [state, setState] = useState(Settings_default.state[settingKey]);
	return /* @__PURE__ */ React_default.createElement(
		CheckboxItem, {
			color,
			label,
			id: c14(label, settingKey),
			checked: state,
			action: () => {
				setState(!state);
				Settings_default[`set${settingKey}`](!Settings_default.state[settingKey]);
			}
		}
	);
}

function ContextMenuSlider({ settingKey, label, ...rest }) {
	const [val] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React_default.createElement(
		ControlItem, {
			id: c14(settingKey),
			label: `${label}: ${val}px`,
			control: () => /* @__PURE__ */ React_default.createElement("div", { style: { padding: "0 8px" } }, /* @__PURE__ */ React_default.createElement(SettingSlider, { ...rest, settingKey, onValueRender: valueToPx }))
		}
	);
}

function status() {
	function genStatusToggles(type) {
		return /* @__PURE__ */ React_default.createElement(Item, { label: type, id: c14(type) }, [
			{ settingKey: `show${type}Pings`, label: "Pings" },
			{ settingKey: `show${type}Unreads`, label: "Unreads" },
			{ settingKey: `show${type}Typing`, label: "Typings" },
			{ settingKey: `highlight${type}Unread`, label: "Highlight Unread" }
		].map(ContextMenuToggle));
	}
	return /* @__PURE__ */ React_default.createElement(Item, { label: "Status", id: c14("status") }, genStatusToggles("Tab"), genStatusToggles("Bookmark"), genStatusToggles("Folder"));
}

function appearence() {
	return /* @__PURE__ */ React_default.createElement(Item, { label: "Appearence", id: c14("appearence") }, [{
			settingKey: "size",
			label: "UI Size",
			minValue: 24,
			maxValue: 32
		},
		{
			label: "Tab width",
			settingKey: "tabWidth",
			minValue: 50,
			maxValue: 250
		},
		{
			label: "Tab min width",
			settingKey: "tabMinWidth",
			minValue: 50,
			maxValue: 250
		}
	].map(ContextMenuSlider), /* @__PURE__ */ React_default.createElement(Separator, null), [
		{ settingKey: "showTabbar", label: "Show Tabbar" },
		{ settingKey: "showBookmarkbar", label: "Show Bookmarks" },
		{ settingKey: "keepTitle", label: "Keep TitleBar" },
		{ settingKey: "privacyMode", label: "Privacy Mode" },
		{ settingKey: "showSettingsButton", label: "Show Settings button", color: "danger" }
	].map(ContextMenuToggle));
}

function SettingsContextMenu_default() {
	return /* @__PURE__ */ React_default.createElement(Menu, null, appearence(), status(), /* @__PURE__ */ React_default.createElement(Item, { label: "Functionality", id: c14("functionality") }, [
		{ settingKey: "bookmarkOverflowWrap", label: "Wrap Bookmarks" },
		{ settingKey: "ctrlClickChannel", label: "Ctrl+Click channel" },
		{ settingKey: "tabSwitch", label: "Tab switch keybinds" }
	].map(ContextMenuToggle)));
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
var c15 = classNameFactory("tabbys-app");

function App({ leading, title, trailing }) {
	const [size, privacyMode, keepTitle, showTabbar, showBookmarkbar, showSettingsButton] = Settings_default((_) => [_.size, _.privacyMode, _.keepTitle, _.showTabbar, _.showBookmarkbar, _.showSettingsButton], shallow);
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: {
				"--size": `${size}px`
			},
			className: c15("container", { showTabbar, showBookmarkbar, keepTitle, privacyMode })
		},
		keepTitle && /* @__PURE__ */ React_default.createElement("div", { className: c15("leading") }, [leading, title]),
		showTabbar && /* @__PURE__ */ React_default.createElement("div", { className: c15("tabbar") }, /* @__PURE__ */ React_default.createElement(TabBar, null)),
		/* @__PURE__ */
		React_default.createElement("div", { className: c15("trailing") }, React_default.cloneElement(trailing, {
			children: [showSettingsButton && /* @__PURE__ */ React_default.createElement(SettingsButton, null), ...trailing.props.children]
		})),
		showBookmarkbar && /* @__PURE__ */ React_default.createElement("div", { className: join2(c15("bookmarkbar")) }, /* @__PURE__ */ React_default.createElement(BookmarkBar, null))
	);
}

// src/Tabbys/patches/patchTitleBar.jsx
var TitleBar = getModuleAndKey(Filters.byStrings("PlatformTypes", "windowKey", "title"), {
	searchExports: true
});
var BaseClasses = getModule(Filters.byKeys("base", "activityPanel"));
Plugin_default.onStart(() => {
	after(...TitleBar, ({ args: [props], ret }) => {
		if (props.windowKey?.startsWith("DISCORD_")) return ret;
		const [leading, title, trailing] = ret?.props?.children || [];
		return /* @__PURE__ */ React_default.createElement(ErrorBoundary_default, null, /* @__PURE__ */ React_default.createElement(App, { leading, title, trailing }));
	});
	reRender(`.bar_c38106[data-window-chrome]`);
});
Plugin_default.onStop(() => reRender(`.tabbys-app-container`));

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
var c16 = classNameFactory("collapsible");

function Collapsible({ title, children }) {
	const [open, setOpen] = React_default.useState(false);
	return /* @__PURE__ */ React_default.createElement("div", { className: c16("container", { open }) }, /* @__PURE__ */ React_default.createElement(
		"div", {
			className: c16("header"),
			onClick: () => setOpen(!open)
		},
		/* @__PURE__ */
		React_default.createElement(
			Heading_default, {
				className: c16("title"),
				tag: "h5"
			},
			title
		),
		/* @__PURE__ */
		React_default.createElement("div", { className: c16("icon") }, /* @__PURE__ */ React_default.createElement(ArrowIcon, null))
	), /* @__PURE__ */ React_default.createElement("div", { className: c16("body") }, children));
}

// common/Components/Switch/index.jsx
var Switch_default = getMangled(Filters.bySource("auxiliaryContentPosition", "hasIcon"), {
	Switch: () => true
})?.Switch || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React_default.createElement("div", { style: { color: "#fff" } }, props.label, /* @__PURE__ */ React_default.createElement(
		"input", {
			type: "checkbox",
			checked: props.checked,
			onChange: (e2) => props.onChange(e2.target.checked)
		}
	));
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ settingKey, note, border = false, onChange = nop, description, ...rest }) {
	const [val, set2] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Switch_default, {
			...rest,
			hasIcon: true,
			checked: val,
			label: description || settingKey,
			description: note,
			onChange: (e2) => {
				set2(e2);
				onChange?.(e2);
			}
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, { gap: 15 }));
}

// src/Tabbys/components/SettingComponent/index.jsx
function SettingComponent() {
	return /* @__PURE__ */ React_default.createElement("div", { className: `${Config_default.info.name}-settings` }, /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 10 }, /* @__PURE__ */ React_default.createElement(Collapsible, { title: "Appearence" }, /* @__PURE__ */ React_default.createElement(Collapsible, { title: "toggles" }, /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [
		{ border: true, description: "Wrap Bookmarks", note: "Wrap overflowing bookmarks instead of clamping them into a overflow menu", settingKey: "bookmarkOverflowWrap" },
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
			markers: [24, 28, 32],
			onValueRender: valueToPx
		}
	), /* @__PURE__ */ React_default.createElement(Divider, { gap: 25 }), /* @__PURE__ */ React_default.createElement(
		SettingSlider, {
			settingKey: "tabWidth",
			label: "Tab width",
			description: "width a tab will take when there is enough space",
			minValue: 50,
			maxValue: 250,
			markers: [50, 100, 150, 200, 250],
			onValueRender: valueToPx
		}
	), /* @__PURE__ */ React_default.createElement(Divider, { gap: 25 }), /* @__PURE__ */ React_default.createElement(
		SettingSlider, {
			settingKey: "tabMinWidth",
			label: "Tab min width",
			description: "width at which a tab will stop shrinking when there is too many tabs",
			minValue: 50,
			maxValue: 250,
			markers: [50, 100, 150, 200, 250],
			onValueRender: valueToPx
		}
	)), /* @__PURE__ */ React_default.createElement(Collapsible, { title: "Status" }, ["Tab", "Bookmark", "Folder"].map((type) => {
		return /* @__PURE__ */ React_default.createElement(
			Collapsible, {
				key: type,
				title: type
			},
			/* @__PURE__ */
			React_default.createElement(FieldSet, { contentGap: 5 }, [
				{ description: "Unreads", settingKey: `show${type}Unreads` },
				{ description: "Pings", settingKey: `show${type}Pings` },
				{ description: "Typing", settingKey: `show${type}Typing` },
				{ description: "Highlight Unread", settingKey: `highlight${type}Unread` }
			].map(SettingSwtich))
		);
	})), /* @__PURE__ */ React_default.createElement(Collapsible, { title: "Functionality" }, /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [
		{ settingKey: "ctrlClickChannel", description: "Ctrl+Click Channel to open in new tab" },
		{ settingKey: "bookmarkOverflowWrap", description: "Wrap Bookmarks", note: "Wrap overflowing bookmarks instead of clamping them into a overflow menu" },
		{ settingKey: "tabSwitch", description: "Enable switch keybinds", note: "Switch between channels using keybinds --  switch right [Ctrl+Tab] / switch left [Ctrl+Shift+Tab]" }
	].map(SettingSwtich)))));
}

// src/Tabbys/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent, null);
module.exports = () => Plugin_default;
