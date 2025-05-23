/**
 * @name Tabbys
 * @description Adds Browser like tabs/bookmarks for channels
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Tabbys
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Tabbys/Tabbys.plugin.js
 */

const config = {
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
		"size": 20,
		"tabDividerSize": 5,
		"showTabDivider": true,
		"showSettingsButton": true,
		"showTabbar": true,
		"showBookmarkbar": true,
		"showUnreads": true,
		"showDMNames": true,
		"showPings": true,
		"showTyping": true,
		"focusNewTab": true
	}
}

// common\Api.js
const Api = new BdApi(config.info.name);
const DOM = Api.DOM;
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;
const ContextMenu = Api.ContextMenu;
const Logger = Api.Logger;
const Webpack = Api.Webpack;
/* annoying */
const getOwnerInstance = Api.ReactUtils.getOwnerInstance.bind(Api.ReactUtils);

// common\React.js
const useState = React.useState;
const useEffect = React.useEffect;
const useRef = React.useRef;
const Children = React.Children;

// common\Utils.jsx
function isValidString(string) {
	return string && string.length > 0;
}

function getUserName(userObject = {}) {
	const { global_name, globalName, username } = userObject;
	if (isValidString(global_name)) return global_name;
	if (isValidString(globalName)) return globalName;
	if (isValidString(username)) return username;
	return "???";
}

function concateClassNames(...args) {
	return args.filter(Boolean).join(" ");
}

function getPathName(url) {
	try {
		return new URL(url).pathname;
	} catch {}
}

function easeInOutSin(time) {
	return (1 + Math.sin(Math.PI * time - Math.PI / 2)) / 2;
}

function animate(property, element, to, options = {}, cb = () => {}) {
	const {
		ease = easeInOutSin,
			duration = 300
	} = options;
	let start = null;
	const from = element[property];
	let cancelled = false;
	const cancel = () => {
		cancelled = true;
	};
	const step = timestamp => {
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
	var keysA = Object.keys(objA);
	if (keysA.length !== Object.keys(objB).length) return false;
	for (var i = 0; i < keysA.length; i++)
		if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;
	return true;
}

function getNestedProp(obj, path) {
	return path.split(".").reduce((ob, prop) => ob?.[prop], obj);
}

function reRender(selector) {
	const target = document.querySelector(selector)?.parentElement;
	if (!target) return;
	const instance = getOwnerInstance(target);
	const unpatch = Patcher.instead(instance, "render", () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}
const nop = () => {};

// common\Utils\Logger.js
Logger.patchError = patchId => {
	console.error(`%c[${config.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};

// common\Utils\List.js
function arrToObject(arr, key) {
	if (!key) return;
	return arr.reduce((acc, item) => {
		acc[item[key]] = item;
		return acc;
	}, {});
}
class List {
	list = [];
	map = {};
	indexMap = {};
	constructor(identifierKey = "id") {
		this.identifierKey = identifierKey;
	}
	get length() {
		return this.list.length;
	}
	clear() {
		this.setList([]);
	}
	updateMap(item) {
		this.map[item[this.identifierKey]] = item;
	}
	recreateIndexMap() {
		this.indexMap = {};
		this.list.forEach((item, index) => {
			this.indexMap[item[this.identifierKey]] = index;
		});
	}
	setList(arr) {
		arr = [...arr];
		this.list = arr;
		this.map = arrToObject(arr, this.identifierKey);
		this.recreateIndexMap();
	}
	addItem(item) {
		item = { ...item };
		this.list = this.list.toSpliced(this.list.length, 0, item);
		this.updateMap(item);
		this.indexMap[item[this.identifierKey]] = this.list.length - 1;
	}
	addItemAtIndex(item, index) {
		if (index == null) return;
		item = { ...item };
		this.list = this.list.toSpliced(index, 0, item);
		this.updateMap(item);
		this.recreateIndexMap();
	}
	removeItem(index) {
		if (index == null || index < 0) return;
		const item = this.getItemByIndex(index);
		this.list = this.list.toSpliced(index, 1);
		delete this.map[item[this.identifierKey]];
		this.recreateIndexMap();
	}
	removeItemByIdentifier(id) {
		const index = this.getItemIndex(id);
		this.removeItem(index);
	}
	swapItem(fromIndex, toIndex) {
		if (fromIndex === toIndex) return;
		if (fromIndex < 0 || fromIndex >= this.length) return;
		const fromItem = this.getItemByIndex(fromIndex);
		const tempList = [...this.list];
		const toItem = tempList.splice(toIndex, 1, fromItem)[0];
		tempList.splice(fromIndex, 1, toItem);
		this.setList(tempList);
	}
	swapItemById(fromId, toId) {
		this.swapItem(this.getItemIndex(fromId), this.getItemIndex(toId));
	}
	setItem(index, item) {
		if (index == null || index < 0) return;
		const currentItem = this.getItemByIndex(index);
		item = {
			...currentItem,
			...item,
			[this.identifierKey]: currentItem[this.identifierKey]
		};
		this.list = this.list.toSpliced(index, 1, item);
		this.updateMap(item);
	}
	setItemById(id, item) {
		const index = this.getItemIndex(id);
		if (index == null) return;
		this.setItem(index, item);
	}
	getItemByIndex(index) {
		return this.list[index];
	}
	getItemById(id) {
		return this.map[id];
	}
	getItemIndex(id) {
		return this.indexMap[id];
	}
	getListSlice(from, to) {
		return this.list.slice(from, to);
	}
	getItemMeta(id) {
		const index = this.getItemIndex(id);
		if (index == null || index < 0) return {};
		const item = this.getItemById(id);
		if (!item) return {};
		return {
			item,
			index,
			isSingle: this.list.length === 1,
			isFirst: index === 0,
			isLast: index === this.list.length - 1,
			nextItem: this.getItemByIndex(index + 1),
			previousItem: this.getItemByIndex(index - 1)
		};
	}
}

// src\Tabbys\Store\bookmarksStore.js
const bookmarksList = new List();
const store$1 = (set) => ({
	bookmarks: [],
	clearBookmarks() {
		bookmarksList.clear();
		set({ bookmarks: bookmarksList.list });
	},
	setBookmarks(list = []) {
		bookmarksList.setList(list);
		set({ bookmarks: bookmarksList.list });
	},
	addBookmark(bookmark) {
		bookmarksList.addItem(bookmark);
		set({ bookmarks: bookmarksList.list });
	},
	addBookmarkAtIndex(bookmark, index) {
		bookmarksList.addItemAtIndex(bookmark, index);
		set({ bookmarks: bookmarksList.list });
	},
	removeBookmark(id) {
		bookmarksList.removeItemByIdentifier(id);
		set({ bookmarks: bookmarksList.list });
	},
	setBookmark(id, payload) {
		bookmarksList.setItemById(id, payload);
		set({ bookmarks: bookmarksList.list });
	},
	swapBookmark(fromId, toId) {
		bookmarksList.swapItemById(fromId, toId);
		set({ bookmarks: bookmarksList.list });
	},
	getBookmark(id) {
		return bookmarksList.getItemById(id);
	}
});
const selectors$1 = {
	bookmarks: state => state.bookmarks
};
const bookmarksStore = {
	store: store$1,
	selectors: selectors$1
};

// common\Webpack.js
const getModule = Webpack.getModule;
const Filters = Webpack.Filters;
const getMangled = Webpack.getMangled;
const getStore = Webpack.getStore;

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return;
	return { module, key };
}

// common\DiscordModules\Modules.js
const DiscordPopout = getModule(Filters.byPrototypeKeys("shouldShowPopout", "toggleShow"), { searchExports: true });
const Dispatcher = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: false });
const transitionTo = getModule(Filters.byStrings(`"transitionTo - Transitioning to "`), { searchExports: true });
const DragSource = getModule(Filters.byStrings("drag-source", "collect"), { searchExports: true });
const DropTarget = getModule(Filters.byStrings("drop-target", "collect"), { searchExports: true });

// common\Components\Flex\index.jsx
const Flex = getModule(a => a.defaultProps?.direction, { searchExports: true });

// common\Components\ContextMenu\index.jsx
function MenuLabel({ label, icon }) {
	return (
		React.createElement(Flex, {
			className: `${config.info.name}-menu-label-icon`,
			direction: Flex.Direction.HORIZONTAL,
			align: Flex.Align.CENTER,
			style: { gap: 8 },
		}, icon, React.createElement('div', null, label))
	);
}

// @Modules\useStateFromStores
const useStateFromStores = getModule(Filters.byStrings("getStateFromStores"), { searchExports: true });

// @Stores\UserStore
const UserStore = getStore("UserStore");

// @Stores\ChannelStore
const ChannelStore = getStore("ChannelStore");

// @Stores\ReadStateStore
const ReadStateStore = getStore("ReadStateStore");

// @Stores\TypingStore
const TypingStore = getStore("TypingStore");

// @Stores\GuildStore
const GuildStore = getStore("GuildStore");

// common\Utils\User.js
function getUserAvatar({ id, guildId, size }) {
	return UserStore.getUser(id).getAvatarURL(guildId, size);
}

// src\Tabbys\utils.jsx
const ChannelIconsUtils = getModule(a => a.getChannelIconURL);

function buildTab(tabObj) {
	const id = crypto.randomUUID();
	return { ...tabObj, id };
}

function getDmAvatar(channel, size) {
	const recipientId = channel.recipients[0];
	return getUserAvatar({ id: recipientId, size });
}

function getChannelName(channel) {
	if (!channel) return;
	if (channel.isDM() || channel.isGroupDM()) return channel.rawRecipients.map(getUserName).join(", ");
	return channel.name;
}

function getChannelIcon(channel, size) {
	if (!channel) return;
	if (channel.isDM()) return getDmAvatar(channel, size);
	if (channel.isGroupDM())
		return ChannelIconsUtils.getChannelIconURL({
			id: channel.id,
			icon: channel.icon,
			applicationId: channel.getApplicationId(),
			size: size
		});
	const guild = GuildStore.getGuild(channel.guild_id);
	if (guild) return guild.getIconURL(size);
}

function useChannelState(channelId) {
	const [mentionCount, unreadCount, hasUnread] = useStateFromStores(
		[ReadStateStore],
		() => {
			const hasUnread = ReadStateStore.hasUnread(channelId);
			const mentionCount = ReadStateStore.getMentionCount(channelId);
			const unreadCount = ReadStateStore.getUnreadCount(channelId);
			return [mentionCount, unreadCount, hasUnread];
		},
		[channelId]
	);
	const typingUsersIds = useStateFromStores([TypingStore], () => Object.keys(TypingStore.getTypingUsers(channelId)), [channelId]);
	const currentUser = UserStore.getCurrentUser();
	const typingUsers = typingUsersIds.filter(id => id !== currentUser?.id).map(UserStore.getUser);
	return { typingUsers, mentionCount, unreadCount, hasUnread };
}

function createContextMenuItem(type, id = "", action = nop, label = "Unknown", icon = null, color = "", children) {
	const res = {
		className: `channeltab-${id}-menuitem`,
		type,
		id,
		action,
		items: children,
		label: (
			React.createElement(MenuLabel, {
				label: label,
				icon: icon,
			})
		)
	};
	if (color) res.color = color;
	return res;
}

// common\DiscordModules\zustand.js
const { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});
const subscribeWithSelector = getModule(Filters.byStrings("equalityFn", "fireImmediately"), { searchExports: true });
const zustand$1 = zustand;

// common\Utils\Settings.js
const SettingsStoreSelectors = {};
const persistMiddleware = config => (set, get, api) => config(args => (set(args), Data.save("settings", get().getRawState())), get, api);
const SettingsStore = Object.assign(
	zustand$1(
		persistMiddleware(subscribeWithSelector((set, get) => {
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
		}))
	), {
		useSetting: function(key) {
			return this(state => [state[key], state[`set${key}`]]);
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
const Settings = SettingsStore;

// src\Tabbys\Store\tabsStore.js
const initialState = {
	tabs: [],
	selectedId: null,
	lastSelectedIdAfterNewTab: null
};
const tabsList = new List();
const store = (set, get) => ({
	...initialState,
	clearTabs() {
		tabsList.clear();
		set({ ...initialState });
	},
	setLastSelectedIdAfterNewTab(id) {
		set({ lastSelectedIdAfterNewTab: id });
	},
	setTabs(list = [], selectedId) {
		if (list.length === 0) return;
		tabsList.setList(list);
		set({ tabs: tabsList.list, selectedId: selectedId || tabsList.list[0].id });
	},
	addTab(tab) {
		tabsList.addItem(tab);
		set({ tabs: tabsList.list });
	},
	addTabToLeft(id, tab) {
		const tabIndex = tabsList.getItemIndex(id);
		tabsList.addItemAtIndex(tab, tabIndex);
		set({ tabs: tabsList.list, selectedId: tab.id });
	},
	addTabToRight(id, tab) {
		const tabIndex = tabsList.getItemIndex(id);
		tabsList.addItemAtIndex(tab, tabIndex + 1);
		set({ tabs: tabsList.list, selectedId: tab.id });
	},
	duplicateTab(id) {
		const { getTab, addTabToRight } = get();
		addTabToRight(id, buildTab(getTab(id)));
	},
	newTab(tab) {
		if (!tab.id) return;
		const state = get();
		tabsList.addItem(tab);
		if (!Settings.state.focusNewTab) {
			return set({ tabs: tabsList.list });
		}
		set({ tabs: tabsList.list, selectedId: tab.id, lastSelectedIdAfterNewTab: state.selectedId });
	},
	removeTab(id) {
		const { selectedId, lastSelectedIdAfterNewTab } = get();
		if (tabsList.length === 1) return;
		const { nextItem: nextTab, previousItem: previousTab } = tabsList.getItemMeta(id);
		tabsList.removeItemByIdentifier(id);
		const isSelected = selectedId === id;
		const newSelected = !isSelected ? selectedId : lastSelectedIdAfterNewTab ? lastSelectedIdAfterNewTab : nextTab ? nextTab.id : previousTab.id;
		set({ tabs: tabsList.list, selectedId: newSelected, lastSelectedIdAfterNewTab: null });
	},
	removeOtherTabs(id) {
		const { getTab, setTabs } = get();
		const tab = getTab(id);
		setTabs([tab]);
	},
	removeTabsToRight(id) {
		const { selectedId } = get();
		const tabMeta = tabsList.getItemMeta(id);
		if (tabMeta.isLast || tabMeta.isSingle) return;
		const selectedTabIndex = tabsList.getItemIndex(selectedId);
		const to = tabMeta.index + 1;
		const newList = tabsList.getListSlice(0, to);
		const newSelected = selectedTabIndex < to ? selectedId : newList[0].id;
		tabsList.setList(newList);
		set({ tabs: tabsList.list, selectedId: newSelected });
	},
	removeTabsToLeft(id) {
		const { selectedId } = get();
		const tabMeta = tabsList.getItemMeta(id);
		if (tabMeta.isFirst || tabMeta.isSingle) return;
		const selectedTabIndex = tabsList.getItemIndex(selectedId);
		const newList = tabsList.getListSlice(tabMeta.index, tabsList.length);
		const newSelected = selectedTabIndex > tabMeta.index ? selectedId : newList[0].id;
		tabsList.setList(newList);
		set({ tabs: tabsList.list, selectedId: newSelected });
	},
	swapTab(fromId, toId) {
		tabsList.swapItemById(fromId, toId);
		set({ tabs: tabsList.list });
	},
	setSelectedId(id) {
		const { getTab } = get();
		const tabToBeSelected = getTab(id);
		if (!tabToBeSelected) return;
		set({ selectedId: id, lastSelectedIdAfterNewTab: null });
	},
	setTab(id, payload) {
		tabsList.setItemById(id, payload);
		set({ tabs: tabsList.list });
	},
	getTabsCount() {
		return tabsList.length;
	},
	getTab(id) {
		return tabsList.getItemById(id);
	},
	getTabIndex(id) {
		return tabsList.getItemIndex(id);
	},
	getCurrentlySelectedTab() {
		return tabsList.getItemById(get().selectedId);
	}
});
const selectors = {
	tabs: state => state.tabs,
	selectedId: state => state.selectedId,
	lastSelectedIdAfterNewTab: state => state.lastSelectedIdAfterNewTab
};
const tabsStore = {
	store,
	selectors
};

// src\Tabbys\Store\index.js
// 			path: paths[Math.floor(Math.random() * paths.length)]
const Store = Object.assign(
	zustand$1(
		subscribeWithSelector((setState, get) => {
			const set = args => {
				setState(args);
				const state = get();
				const user = UserStore.getCurrentUser();
				const data = Object.entries(state)
					.filter(([, val]) => typeof val !== "function")
					.reduce((acc, [key, val]) => {
						if (key === "user") return acc;
						acc[key] = val;
						return acc;
					}, {});
				Data.save(user.id, data);
			};
			return {
				user: null,
				setUser(user) {
					set({ user });
				},
				...tabsStore.store(set, get),
				...bookmarksStore.store(set, get)
			};
		})
	), {
		init() {
			hydrateStore();
			window.navigation.addEventListener("navigate", onLocationChange);
			Dispatcher.subscribe("CONNECTION_OPEN", hydrateStore);
		},
		dispose() {
			window.navigation.removeEventListener("navigate", onLocationChange);
			Dispatcher.unsubscribe("CONNECTION_OPEN", hydrateStore);
		},
		selectors: {
			...tabsStore.selectors,
			...bookmarksStore.selectors
		}
	}
);
Object.defineProperty(Store, "state", {
	configurable: false,
	get: () => Store.getState()
});
Store.subscribe(Store.selectors.selectedId, () => {
	const selectedTab = Store.state.getCurrentlySelectedTab();
	if (!selectedTab) return;
	transitionTo(selectedTab.path);
});

function hydrateStore() {
	const user = UserStore.getCurrentUser();
	if (Store.state.user?.id === user.id) return;
	const userData = Data.load(user.id) || {};
	Store.state.setUser(user);
	Store.state.setTabs(userData.tabs || [buildTab({ path: "/channels/@me" })], userData.selectedId);
	Store.state.setBookmarks(userData.bookmarks || []);
	Store.state.setLastSelectedIdAfterNewTab(userData.lastSelectedIdAfterNewTab);
}

function onLocationChange(e) {
	const pathname = getPathName(e.destination.url);
	if (!pathname) return;
	Store.state.setTab(Store.state.selectedId, { path: pathname });
}

// src\Tabbys\patches\patchChannelClick.js
const channelFilter = Filters.byStrings("href", "children", "onClick", "onKeyPress", "focusProps");
const channelComponent = getModule(a => a.render && channelFilter(a.render), { searchExports: true });
const patchChannelClick = () => {
	if (!channelComponent) return Logger.patchError("channelComponent");
	Patcher.after(channelComponent, "render", (_, [props], ret) => {
		const origClick = getNestedProp(ret, "props.children.props.onClick");
		const path = props.href;
		if (!path || !origClick) return ret;
		ret.props.children.props.onClick = e => {
			e.preventDefault();
			if (e.ctrlKey) Store.state.newTab(buildTab({ path }));
			else origClick?.(e);
		};
	});
};

// common\Components\ErrorBoundary\index.jsx
class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${config?.info?.name || "Unknown Plugin"}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}
	renderErrorBoundary() {
		return (
			React.createElement('div', { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" }, }, React.createElement('b', { style: { color: "#e0e1e5" }, }, "An error has occured while rendering ", React.createElement('span', { style: { color: "orange" }, }, this.props.id)))
		);
	}
	renderFallback() {
		if (React.isValidElement(this.props.fallback)) {
			if (this.props.passMetaProps)
				this.props.fallback.props = {
					id: this.props.id,
					plugin: config?.info?.name || "Unknown Plugin",
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return (
			React.createElement(this.props.fallback, {
				id: this.props.id,
				plugin: config?.info?.name || "Unknown Plugin",
			})
		);
	}
	render() {
		if (!this.state.hasError) return this.props.children;
		return this.props.fallback ? this.renderFallback() : this.renderErrorBoundary();
	}
}

// common\Components\Icon\index.jsx
/* eslint-disable react/jsx-key */
function svg(svgProps, ...paths) {
	return comProps => (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
			...svgProps,
			...comProps,
		}, paths.map(p => (typeof p === "string" ? path(null, p) : p)))
	);
}

function path(props, d) {
	return (
		React.createElement('path', {
			...props,
			d: d,
		})
	);
}
const BookmarkIconPath = "M17 4H7a1 1 0 0 0-1 1v13.74l3.99-3.61a3 3 0 0 1 4.02 0l3.99 3.6V5a1 1 0 0 0-1-1ZM7 2a3 3 0 0 0-3 3v16a1 1 0 0 0 1.67.74l5.66-5.13a1 1 0 0 1 1.34 0l5.66 5.13a1 1 0 0 0 1.67-.75V5a3 3 0 0 0-3-3H7Z";
const BookmarkOutlinedIcon = svg(null, path({ fillRule: "evenodd" }, BookmarkIconPath));
const ArrowIcon = svg(null, "M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z");
const CloseIcon = svg(null, "M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z");
const DuplicateIcon = svg(null, "M4 5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v.18a1 1 0 1 0 2 0V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h.18a1 1 0 1 0 0-2H5a1 1 0 0 1-1-1V5Z", "M8 11a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3v-8Zm2 0a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-8Z");
const LightiningIcon = svg(null, "M7.65 21.75a1 1 0 0 0 1.64.96l11.24-9.96a1 1 0 0 0-.66-1.75h-4.81a.5.5 0 0 1-.5-.6l1.79-8.15a1 1 0 0 0-1.64-.96L3.47 11.25A1 1 0 0 0 4.13 13h4.81c.32 0 .56.3.5.6l-1.79 8.15Z");
const PlusIcon = svg(null, "M13 5a1 1 0 1 0-2 0v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2h-6V5Z");
const VectorIcon = svg(null, "M20.7 12.7a1 1 0 0 0 0-1.4l-5-5a1 1 0 1 0-1.4 1.4l3.29 3.3H4a1 1 0 1 0 0 2h13.59l-3.3 3.3a1 1 0 0 0 1.42 1.4l5-5Z");
const DiscordIcon = svg(null, "M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a18.43 18.43 0 0 0 5.63 2.87c.46-.62.86-1.28 1.2-1.98-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.7 1.7 11.28 0l.46.37c-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.47-4.87-.78-9.09-3.3-12.83ZM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27Zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27Z");
const ServersIcon = svg(null, "M10.55 4.4c.13-.24.1-.54-.12-.71L8.6 2.24a1 1 0 0 0-1.24 0l-4 3.15a1 1 0 0 0-.38.79v4.03c0 .43.5.66.82.39l2.28-1.9a3 3 0 0 1 3.84 0c.03.02.08 0 .08-.04V6.42a4 4 0 0 1 .55-2.02ZM7.36 10.23a1 1 0 0 1 1.28 0l1.18.99 2.98 2.48 1.84 1.53a1 1 0 0 1-.67 1.77.1.1 0 0 0-.1.09l-.23 3.06a2 2 0 0 1-2 1.85H4.36a2 2 0 0 1-2-1.85l-.24-3.16a1 1 0 0 1-.76-1.76l6-5Z", "M12 10.2c0 .14.07.28.18.38l3.74 3.12a3 3 0 0 1 .03 4.58.55.55 0 0 0-.2.37l-.12 1.65a4 4 0 0 1-.17.9c-.12.38.13.8.52.8H20a2 2 0 0 0 2-2V3.61a1.5 1.5 0 0 0-2-1.41l-6.66 2.33A2 2 0 0 0 12 6.42");
const QuestsIcon = svg(null, "M7.5 21.7a8.95 8.95 0 0 1 9 0 1 1 0 0 0 1-1.73c-.6-.35-1.24-.64-1.9-.87.54-.3 1.05-.65 1.52-1.07a3.98 3.98 0 0 0 5.49-1.8.77.77 0 0 0-.24-.95 3.98 3.98 0 0 0-2.02-.76A4 4 0 0 0 23 10.47a.76.76 0 0 0-.71-.71 4.06 4.06 0 0 0-1.6.22 3.99 3.99 0 0 0 .54-5.35.77.77 0 0 0-.95-.24c-.75.36-1.37.95-1.77 1.67V6a4 4 0 0 0-4.9-3.9.77.77 0 0 0-.6.72 4 4 0 0 0 3.7 4.17c.89 1.3 1.3 2.95 1.3 4.51 0 3.66-2.75 6.5-6 6.5s-6-2.84-6-6.5c0-1.56.41-3.21 1.3-4.51A4 4 0 0 0 11 2.82a.77.77 0 0 0-.6-.72 4.01 4.01 0 0 0-4.9 3.96A4.02 4.02 0 0 0 3.73 4.4a.77.77 0 0 0-.95.24 3.98 3.98 0 0 0 .55 5.35 4 4 0 0 0-1.6-.22.76.76 0 0 0-.72.71l-.01.28a4 4 0 0 0 2.65 3.77c-.75.06-1.45.33-2.02.76-.3.22-.4.62-.24.95a4 4 0 0 0 5.49 1.8c.47.42.98.78 1.53 1.07-.67.23-1.3.52-1.91.87a1 1 0 1 0 1 1.73Z");
const AppsIcon = svg(null, path({ "fill-rule": "evenodd", "clip-rule": "evenodd" }, "M20.97 4.06c0 .18.08.35.24.43.55.28.9.82 1.04 1.42.3 1.24.75 3.7.75 7.09v4.91a3.09 3.09 0 0 1-5.85 1.38l-1.76-3.51a1.09 1.09 0 0 0-1.23-.55c-.57.13-1.36.27-2.16.27s-1.6-.14-2.16-.27c-.49-.11-1 .1-1.23.55l-1.76 3.51A3.09 3.09 0 0 1 1 17.91V13c0-3.38.46-5.85.75-7.1.15-.6.49-1.13 1.04-1.4a.47.47 0 0 0 .24-.44c0-.7.48-1.32 1.2-1.47l2.93-.62c.5-.1 1 .06 1.36.4.35.34.78.71 1.28.68a42.4 42.4 0 0 1 4.4 0c.5.03.93-.34 1.28-.69.35-.33.86-.5 1.36-.39l2.94.62c.7.15 1.19.78 1.19 1.47ZM20 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM5 7a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2H7v1a1 1 0 1 1-2 0v-1H4a1 1 0 1 1 0-2h1V7Z"));
const SettingIcon = svg(
	null,
	"M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
);

// src\Tabbys\contextmenus\BookmarkContextmenu.jsx
function deleteBookmark(id) {
	Store.state.removeBookmark(id);
}

function openInNewTab(id) {
	Store.state.newTab(buildTab(Store.state.getBookmark(id)));
}

function BookmarkContextmenu(id) {
	const Menu = ContextMenu.buildMenu([
		createContextMenuItem(null, "open-bookmark-in-new-tab", () => openInNewTab(id), "Open in new Tab", React.createElement(PlusIcon, null)),
		{ type: "separator" },
		createContextMenuItem(null, "remove-bookmark", () => deleteBookmark(id), "Remove Bookmark", React.createElement(CloseIcon, null), "danger"),
	]);
	return (props) => React.createElement(Menu, { ...props, className: "bookmark-contextmenu", });
}

// src\Tabbys\components\Bookmark\BaseBookmark.jsx
function DragThis$3(comp) {
	return DropTarget(
		"BOOKMARK", {
			drop(thisBookmark, monitor) {
				const droppedBookmark = monitor.getItem();
				if (thisBookmark.id === droppedBookmark.id) return;
				Store.state.swapBookmark(droppedBookmark.id, thisBookmark.id);
			}
		},
		(connect, monitor, props) => {
			return {
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
				dropRef: connect.dropTarget(),
				draggedIsMe: monitor.getItem()?.id === props.id
			};
		}
	)(
		DragSource(
			"BOOKMARK", {
				beginDrag(props) {
					return { ...props };
				}
			},
			(props, monitor) => {
				return {
					isDragging: !!monitor.isDragging(),
					dragRef: props.dragSource()
				};
			}
		)(comp)
	);
}

function BaseBookmark(props) {
	const { id, path, icon, title, className } = props;
	const { dragRef, dropRef, isOver, canDrop, draggedIsMe, isDragging } = props;
	const bookmarkRef = useRef(null);
	dropRef(dragRef(bookmarkRef));
	const clickHandler = e => {
		e.stopPropagation();
		if (!path) return Logger.log(id, "no path");
		if (e.ctrlKey)
			Store.state.newTab(buildTab({ path }));
		else
			transitionTo(path);
	};
	const contextmenuHandler = e => {
		ContextMenu.open(e, BookmarkContextmenu(id), {
			position: "bottom",
			align: "left"
		});
	};
	return (
		React.createElement('div', {
			ref: bookmarkRef,
			className: concateClassNames("bookmark flex-center", className && className, isDragging && "dragging", !draggedIsMe && canDrop && isOver && "candrop"),
			onContextMenu: contextmenuHandler,
			onClick: clickHandler,
		}, React.createElement('div', { className: "bookmark-icon flex-center round", }, icon), React.createElement('div', { className: "bookmark-title ellipsis", }, title || path))
	);
}
const BaseBookmark$1 = DragThis$3(BaseBookmark);

// src\Tabbys\components\Bookmark\index.jsx
function Bookmark({ id, channelId, path, className }) {
	const size = Settings(Settings.selectors.size) || 20;
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	const channelName = getChannelName(channel) || path.split("/")[2];
	const src = getChannelIcon(channel, size);
	let icon = null;
	if (src)
		icon = src && (
			React.createElement('img', {
				className: "parent-dim fill round",
				src: src,
				alt: channelName,
			})
		);
	else {
		icon = (
			React.createElement('div', { className: "discord-icon flex-center fill round", }, React.createElement(DiscordIcon, null))
		);
	}
	return (
		React.createElement(BaseBookmark$1, {
			id: id,
			className: className,
			path: path,
			icon: icon,
			title: channelName,
		})
	);
}
const Bookmark$1 = React.memo(({ id, className }) => {
	const { path } = Store(state => state.getBookmark(id), shallow) || {};
	if (!path) return Logger.error("unknown bookmark path", path, id);
	const [, , , channelId, , threadId] = path.split("/");
	return (
		React.createElement(Bookmark, {
			id: id,
			className: className,
			path: path,
			channelId: threadId || channelId,
		})
	);
});

// common\Utils\Hooks.js
const LengthStateEnum = {
	INCREASED: "INCREASED",
	UNCHANGED: "UNCHANGED",
	DECREASED: "DECREASED",
};

function useNumberWatcher(num) {
	const lastNum = useRef(num);
	const currentNum = num;
	let state = "";
	if (lastNum.current < num) state = LengthStateEnum.INCREASED;
	else if (lastNum.current > currentNum) state = LengthStateEnum.DECREASED;
	else state = LengthStateEnum.UNCHANGED;
	lastNum.current = currentNum;
	return state;
}

// src\Tabbys\components\BookmarkBar\index.jsx
function DragThis$2(comp) {
	return DropTarget(
		"TAB", {
			drop(thisComp, monitor) {
				const dropppedTab = monitor.getItem();
				const path = dropppedTab.path;
				if (!path) return;
				Store.state.addBookmark(buildTab({ path }));
			}
		},
		(connect, monitor) => {
			return {
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
				dropRef: connect.dropTarget(),
			};
		}
	)(comp);
}
// 	const overflowLimit = window.innerWidth * 0.95;
function isVisible(el) {
	const parentRect = el.parentElement.getBoundingClientRect();
	const childRect = el.getBoundingClientRect();
	return childRect.left >= parentRect.left && childRect.right <= parentRect.right;
}
const BookmarkBar = DragThis$2(function BookmarkBar({ isOver, canDrop, dropRef, leading, trailing }) {
	const bookmarks = Store(Store.selectors.bookmarks, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));
	const popoutRef = useRef();
	const bookmarksContainerRef = useRef();
	const [overflowIndex, setOverflowIndex] = useState(-1);
	const isOverflowing = overflowIndex > -1;
	const childrenLengthState = useNumberWatcher(bookmarks.length);
	const overflowBookmarks = isOverflowing ? bookmarks.slice(overflowIndex, bookmarks.length) : [];
	const bookmarkbarRef = useRef();
	dropRef(bookmarkbarRef);
	useEffect(() => {
		const bookmarksNode = bookmarksContainerRef.current;
		if (!bookmarksNode) return;
		const handleMutation = debounce(() => {
			if (childrenLengthState === LengthStateEnum.INCREASED && isOverflowing) return;
			if (childrenLengthState === LengthStateEnum.DECREASED && !isOverflowing) return;
			const childrenNodes = Array.from(bookmarksNode.children);
			const indexOfFirstNotFullyVisibleChild = childrenNodes.findIndex(a => !isVisible(a));
			setOverflowIndex(indexOfFirstNotFullyVisibleChild);
		});
		handleMutation();
		const resizeObserver = new ResizeObserver(handleMutation);
		resizeObserver.observe(bookmarksNode);
		return () => {
			resizeObserver.disconnect();
			handleMutation.clear();
		};
	}, [childrenLengthState]);
	return (
		React.createElement('div', { className: concateClassNames("bookmarkbar", canDrop && isOver && "candrop"), ref: bookmarkbarRef, }, leading && leading, React.createElement('div', {
			ref: bookmarksContainerRef,
			className: "bookmarks-container",
			onDoubleClick: e => e.stopPropagation(),
		}, bookmarks.map((a, index) => [
			React.createElement(Bookmark$1, {
				key: a.id,
				id: a.id,
				divider: index !== 0,
				className: concateClassNames(isOverflowing && index >= overflowIndex && "hidden-visually"),
			})
		])), isOverflowing && (
			React.createElement(DiscordPopout, {
				position: "bottom",
				align: "right",
				animation: "1",
				targetElementRef: popoutRef,
				renderPopout: e => {
					return (
						React.createElement('div', {
							onClick: e.closePopout,
							className: "bookmarks-overflow-popout Tabbys-vars",
						}, overflowBookmarks.map(a => [
							React.createElement(Bookmark$1, {
								key: a.id,
								id: a.id,
							})
						]))
					);
				},
				spacing: 8,
			}, e => (
				React.createElement('div', {
					ref: popoutRef,
					className: "bookmarks-overflow flex-center",
					onClick: e.onClick,
				}, React.createElement(ArrowIcon, { className: "parent-dim", }))
			))
		), trailing && trailing)
	);
});

// src\Tabbys\contextmenus\TabContextMenu.jsx
function newTabRight(id) {
	Store.state.addTabToRight(id, buildTab({ path: "/channels/@me" }));
}

function newTabLeft(id) {
	Store.state.addTabToLeft(id, buildTab({ path: "/channels/@me" }));
}

function duplicateTab(id) {
	Store.state.duplicateTab(id);
}

function bookmarkTab(id) {
	Store.state.addBookmark(buildTab(Store.state.getTab(id)));
}

function closeTab(id) {
	Store.state.removeTab(id);
}

function closeTabsToRight(id) {
	Store.state.removeTabsToRight(id);
}

function closeTabsToLeft(id) {
	Store.state.removeTabsToLeft(id);
}

function closeOtherTabs(id) {
	Store.state.removeOtherTabs(id);
}

function TabContextMenu(id) {
	const canClose = Store.state.getTabsCount() > 1;
	const Menu = ContextMenu.buildMenu(
		[
			createContextMenuItem(null, "new-tab-right", () => newTabRight(id), "New Tab to Right", React.createElement(VectorIcon, null)),
			createContextMenuItem(null, "new-tab-left", () => newTabLeft(id), "New Tab to Left", React.createElement(VectorIcon, { style: { rotate: "180deg" }, })),
			{ type: "separator" },
			createContextMenuItem(null, "duplicate-tab", () => duplicateTab(id), "Duplicate Tab", React.createElement(DuplicateIcon, null)),
			createContextMenuItem(null, "bookmark-tab", () => bookmarkTab(id), "Bookmark Tab", React.createElement(BookmarkOutlinedIcon, null)),
			canClose && { type: "separator" },
			canClose && createContextMenuItem("submenu", "close", () => closeTab(id), "Close", React.createElement(CloseIcon, null), "danger", [createContextMenuItem(null, "close-tabs-to-right", () => closeTabsToRight(id), "Close Tabs to Right", React.createElement(VectorIcon, null), "danger"), createContextMenuItem(null, "close-tabs-to-left", () => closeTabsToLeft(id), "Close Tabs to Left", React.createElement(VectorIcon, { style: { rotate: "180deg" }, }), "danger"), createContextMenuItem(null, "close-other-tabs", () => closeOtherTabs(id), "Close Other Tabs", React.createElement(LightiningIcon, null), "danger")])
		].filter(Boolean)
	);
	return props => (
		React.createElement(Menu, {
			...props,
			className: "tab-contextmenu",
		})
	);
}

// src\Tabbys\components\Badge\index.jsx
function m(e) {
	return e < 10 ? 13 : e < 100 ? 19 : 27;
}

function g(e) {
	return e < 1e3 ? "".concat(e) : "".concat(Math.min(Math.floor(e / 1e3), 9), "k+");
}
const Badge = ({ count, type }) => {
	return React.createElement('div', {
		style: { width: m(count) },
		className: concateClassNames("badge flex-center round", type),
	}, g(count));
};

// @Modules\Tooltip
const Tooltip$1 = getModule(Filters.byPrototypeKeys("renderTooltip"), { searchExports: true });

// common\Components\Tooltip\index.jsx
const Tooltip = ({ note, position, children }) => {
	return (
		React.createElement(Tooltip$1, {
			text: note,
			position: position || "top",
		}, props => {
			children.props = {
				...props,
				...children.props
			};
			return children;
		})
	);
};

// src\Tabbys\components\Tab\BaseTab.jsx
const filter = Filters.byStrings("dotRadius", "dotPosition");
const TypingDots = getModule(a => a?.type?.render && filter(a.type.render), { searchExports: true });

function DragThis$1(comp) {
	return DropTarget(
		"TAB", {
			drop(thisTab, monitor) {
				const droppedTab = monitor.getItem();
				if (thisTab.id === droppedTab.id) return;
				Store.state.swapTab(droppedTab.id, thisTab.id);
			}
		},
		(connect, monitor, props) => {
			return {
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
				dropRef: connect.dropTarget(),
				draggedIsMe: monitor.getItem()?.id === props.id
			};
		}
	)(
		DragSource(
			"TAB", {
				beginDrag(props) {
					return { ...props };
				}
			},
			(props, monitor) => {
				return {
					isDragging: !!monitor.isDragging(),
					dragRef: props.dragSource()
				};
			}
		)(comp)
	);
}
const BaseTab = DragThis$1(function BaseTab(props) {
	const { id, path, icon, title, isSingle } = props;
	const { isDM, mentionCount, typingUsers, unreadCount, hasUnread } = props;
	const { dragRef, dropRef, isOver, canDrop, draggedIsMe, isDragging } = props;
	const showUnreads = Settings(Settings.selectors.showUnreads);
	const showPings = Settings(Settings.selectors.showPings);
	const showDMNames = Settings(Settings.selectors.showDMNames);
	const showTyping = Settings(Settings.selectors.showTyping);
	const selected = Store(state => state.selectedId === id);
	const tabRef = useRef(null);
	const isTyping = !!typingUsers?.length;
	const typingUsersNames = typingUsers?.map(getUserName).join(", ");
	dragRef(dropRef(tabRef));
	const clickHandler = e => {
		e.stopPropagation();
		Store.state.setSelectedId(id);
	};
	const closeHandler = e => {
		e.stopPropagation();
		Store.state.removeTab(id);
	};
	const contextmenuHandler = e => {
		ContextMenu.open(e, TabContextMenu(id), {
			position: "bottom",
			align: "left"
		});
	};
	return (
		React.createElement('div', {
			onContextMenu: contextmenuHandler,
			ref: tabRef,
			className: concateClassNames("tab flex-center", selected && "selected-tab", isDragging && "dragging", !draggedIsMe && canDrop && isOver && "candrop"),
			onClick: !selected ? clickHandler : nop,
		}, React.createElement('div', { className: "tab-icon flex-center round", }, icon), !isDM && React.createElement('div', { className: "tab-title ellipsis", }, title || path), isDM && showDMNames && React.createElement('div', { className: "tab-title ellipsis", }, title || path), showPings && !!mentionCount && (
			React.createElement(Badge, {
				count: mentionCount,
				type: "ping",
			})
		), showUnreads && !isDM && hasUnread && (
			React.createElement(Badge, {
				count: unreadCount,
				type: "unread",
			})
		), showTyping && isTyping && (
			React.createElement(Tooltip, { note: isTyping ? typingUsersNames : null, }, React.createElement('div', { className: "typing-dots flex-center", }, React.createElement(TypingDots, { dotRadius: 2.5, })))
		), !isSingle && (
			React.createElement('div', {
				className: "tab-close flex-center round",
				onClick: closeHandler,
			}, React.createElement(CloseIcon, { className: "parent-dim", }))
		))
	);
});

// @Stores\PresenceStore
const PresenceStore = getStore("PresenceStore");

// src\Tabbys\components\UserAvatar\index.jsx
const UserAvatarFilter = Filters.byStrings("statusColor", "isTyping");
const UserAvatar = getModule(a => a?.type && UserAvatarFilter(a.type), { searchExports: true });
const UserAvatar$1 = UserAvatar &&
	(({ id, size, src }) => {
		const [status, isMobile] = useStateFromStores([PresenceStore], () => [PresenceStore.getStatus(id), PresenceStore.isMobileOnline(id)], [id]);
		return (
			React.createElement(UserAvatar, {
				status: status,
				isMobile: isMobile,
				size: size,
				src: src,
			})
		);
	});

// src\Tabbys\components\Tab\ChannelTab.jsx
const GroupDMAvatar = getModule(Filters.byStrings("recipients", "backSrc"));
const sizes$1 = {
	16: "SIZE_16",
	20: "SIZE_20",
	24: "SIZE_24",
	32: "SIZE_32",
	40: "SIZE_40",
	44: "SIZE_44",
	48: "SIZE_48",
	56: "SIZE_56",
	80: "SIZE_80"
};

function ChannelTab({ id, channelId, path, ...rest }) {
	const size = Settings(Settings.selectors.size);
	const channelUnreadState = useChannelState(channelId);
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	if (!channel) return;
	const channelName = getChannelName(channel);
	const isDM = channel.isDM();
	const isGroupDM = channel.isGroupDM();
	let icon = null;
	if (isGroupDM && GroupDMAvatar && !channel.icon) {
		icon = (
			React.createElement(GroupDMAvatar, {
				recipients: channel.recipients,
				size: sizes$1[size],
			})
		);
	} else {
		const src = getChannelIcon(channel, size);
		if (isDM && UserAvatar$1) {
			const userId = channel.recipients[0];
			icon = (
				React.createElement(UserAvatar$1, {
					id: userId,
					src: src,
					size: sizes$1[size],
				})
			);
		} else if (src)
			icon = (
				React.createElement('img', {
					className: "parent-dim fill round",
					src: src,
					alt: channelName,
				})
			);
	}
	icon = icon || (
		React.createElement('div', { className: "discord-icon flex-center fill round", }, React.createElement(DiscordIcon, null))
	);
	return (
		React.createElement(BaseTab, {
			id: id,
			path: path,
			icon: icon,
			title: channelName,
			isGroupDM: isGroupDM,
			isDM: isDM,
			...channelUnreadState,
			...rest,
		})
	);
}

// src\Tabbys\components\Tab\index.jsx
function getIcon(type) {
	let icon = null;
	switch (type) {
		case "servers":
			icon = React.createElement(ServersIcon, null);
			break;
		case "quests":
			icon = React.createElement(QuestsIcon, null);
			break;
		case "applications":
			icon = React.createElement(AppsIcon, null);
			break;
	}
	return icon ? (
		React.createElement('div', { className: "svg-icon", }, icon)
	) : (
		React.createElement('div', { className: "discord-icon flex-center fill round", }, React.createElement(DiscordIcon, null))
	);
}
const Tab = React.memo(({ id, ...rest }) => {
	const { path } = Store(state => state.getTab(id), shallow) || {};
	if (!path) return Logger.error("unknown tab path", path, id);
	const [, type, idk, channelId, , threadId] = path.split("/");
	if (type === "channels" && channelId)
		return (
			React.createElement(ChannelTab, {
				id: id,
				path: path,
				channelId: threadId || channelId,
				...rest,
			})
		);
	return (
		React.createElement(BaseTab, {
			id: id,
			path: path,
			icon: getIcon(idk),
			title: idk,
			...rest,
		})
	);
});

// src\Tabbys\components\TabsScroller\index.jsx
function getFirstAndLastChild(el) {
	const tabListChildren = Array.from(el.children);
	const length = tabListChildren.length;
	if (length < 1) return [];
	const firstTab = tabListChildren[0];
	const lastTab = tabListChildren[length - 1];
	return [firstTab, lastTab];
}

function TabsScroller({ children }) {
	const [leftScrollBtn, setLeftScrollBtn] = useState(false);
	const [rightScrollBtn, setRightScrollBtn] = useState(false);
	const displayStartScrollRef = useRef(null);
	const displayEndScrollRef = useRef(null);
	const tabsRef = useRef(null);
	const childrenLengthState = useNumberWatcher(Children.count(children));

	function getTabsMeta(tabIndex) {
		if (tabIndex == null) return {};
		const tabsNode = tabsRef.current;
		const res = {};
		if (tabsNode) {
			const rect = tabsNode.getBoundingClientRect().toJSON();
			res.tabsMeta = {
				...rect,
				clientWidth: tabsNode.clientWidth,
				scrollLeft: tabsNode.scrollLeft,
				scrollTop: tabsNode.scrollTop,
				scrollWidth: tabsNode.scrollWidth,
				top: rect.top,
				bottom: rect.bottom,
				left: rect.left,
				right: rect.right
			};
		}
		const tabsNodes = tabsNode.querySelectorAll(".tab");
		const targetTab = tabsNodes[tabIndex];
		const nextTab = tabsNodes[tabIndex + 1];
		const previousTab = tabsNodes[tabIndex - 1];
		res.targetTab = !targetTab ?
			{} :
			{
				...targetTab.getBoundingClientRect().toJSON(),
				isFirst: targetTab === tabsNodes[0],
				isLast: targetTab === tabsNodes[tabsNodes.length - 1]
			};
		res.nextTab = !nextTab ? {} : { ...nextTab.getBoundingClientRect().toJSON() };
		res.previousTab = !previousTab ? {} : { ...previousTab.getBoundingClientRect().toJSON() };
		return res;
	}

	function scroll(scrollValue) {
		animate("scrollLeft", tabsRef.current, scrollValue);
	}

	function scrollSelectedIntoView() {
		const selectedTab = Store.state.getCurrentlySelectedTab();
		if (!selectedTab) return;
		const index = Store.state.getTabIndex(selectedTab.id);
		if (index == null) return;
		const { tabsMeta, targetTab, nextTab, previousTab } = getTabsMeta(index);
		if (!targetTab || !tabsMeta) return;
		if (targetTab.isFirst) return scroll(tabsRef.current.scrollWidth * -1);
		if (targetTab.isLast) return scroll(tabsRef.current.scrollWidth);
		tabsMeta.right -= displayEndScrollRef.current.clientWidth;
		tabsMeta.left += displayStartScrollRef.current.clientWidth;
		if (targetTab.left < tabsMeta.left) {
			const nextScrollStart = tabsMeta.scrollLeft + (previousTab.right - tabsMeta.left);
			scroll(nextScrollStart);
		} else if (targetTab.right > tabsMeta.right) {
			const nextScrollStart = tabsMeta.scrollLeft + (nextTab.left - tabsMeta.right);
			scroll(nextScrollStart);
		}
	}
	useEffect(() => {
		if (childrenLengthState !== LengthStateEnum.INCREASED) return;
		scrollSelectedIntoView();
	}, [children.length]);
	useEffect(() => {
		return Store.subscribe(Store.selectors.selectedId, scrollSelectedIntoView);
	}, []);
	useEffect(() => {
		const tabsNode = tabsRef.current;
		if (!tabsNode) return;
		const observerOptions = {
			root: tabsNode,
			threshold: 0.99
		};
		const handleLeftScrollButton = debounce(entries => setLeftScrollBtn(!entries.sort((a, b) => a.time - b.time).pop().isIntersecting));
		const leftObserver = new IntersectionObserver(handleLeftScrollButton, observerOptions);
		const handleRightScrollButton = debounce(entries => setRightScrollBtn(!entries.sort((a, b) => a.time - b.time).pop().isIntersecting));
		const rightObserver = new IntersectionObserver(handleRightScrollButton, observerOptions);

		function observeFirstAndLastChild() {
			leftObserver?.disconnect?.();
			rightObserver?.disconnect?.();
			const [firstTab, lastTab] = getFirstAndLastChild(tabsNode);
			if (!firstTab || !lastTab) return;
			leftObserver.observe(firstTab);
			rightObserver.observe(lastTab);
		}
		observeFirstAndLastChild();
		const handleMutation = debounce(() => observeFirstAndLastChild());
		const mutationObserver = new MutationObserver(handleMutation);
		mutationObserver.observe(tabsNode, { childList: true });
		return () => {
			mutationObserver?.disconnect?.();
			leftObserver?.disconnect?.();
			rightObserver?.disconnect?.();
			handleRightScrollButton.clear();
			handleLeftScrollButton.clear();
			handleMutation.clear();
		};
	}, []);
	const moveTabsScroll = delta => {
		let scrollValue = tabsRef.current.scrollLeft;
		scrollValue += delta;
		scroll(scrollValue);
	};
	const getScrollSize = () => {
		const tabsNode = tabsRef.current;
		if (!tabsNode) return;
		const containerSize = tabsNode.clientWidth;
		let totalSize = 0;
		const children = Array.from(tabsNode.children);
		for (let i = 0; i < children.length; i += 1) {
			const tab = children[i];
			if (totalSize + tab.clientWidth > containerSize) {
				if (i === 0) {
					totalSize = containerSize;
				}
				break;
			}
			totalSize += tab.clientWidth;
		}
		return totalSize;
	};
	const handleStartScrollClick = () => moveTabsScroll(-1 * getScrollSize());
	const handleEndScrollClick = () => moveTabsScroll(getScrollSize());
	return (
		React.createElement('div', { className: "tabs-scroller flex-center", }
			/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */
			, React.createElement('div', {
				ref: displayStartScrollRef,
				onClick: handleStartScrollClick,
				className: concateClassNames("scrollBtn flex-center left-arrow", !leftScrollBtn && "hidden-visually"),
			}, React.createElement(ArrowIcon, { className: "parent-dim flip", })), React.createElement('div', {
				className: "tabs-list",
				ref: tabsRef,
			}, children)
			/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */
			, React.createElement('div', {
				ref: displayEndScrollRef,
				onClick: handleEndScrollClick,
				className: concateClassNames("scrollBtn flex-center right-arrow", !rightScrollBtn && "hidden-visually"),
			}, React.createElement(ArrowIcon, { className: "parent-dim", }))
		)
	);
}

// src\Tabbys\components\TabBar\index.jsx
function DragThis(comp) {
	return DropTarget(
		"BOOKMARK", {
			drop(_, monitor) {
				const droppedBookmark = monitor.getItem();
				const path = droppedBookmark.path;
				if (!path) return;
				Store.state.newTab(buildTab({ path }));
			}
		},
		(connect, monitor) => {
			return {
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
				dropRef: connect.dropTarget()
			};
		}
	)(comp);
}
const TabBar = DragThis(function TabBar({ isOver, canDrop, dropRef, leading, trailing }) {
	const tabs = Store(Store.selectors.tabs, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));
	const showTabDivider = Settings(Settings.selectors.showTabDivider);
	const tabsContainerRef = useRef();
	dropRef(tabsContainerRef);
	const newTabHandler = e => {
		e.preventDefault();
		e.stopPropagation();
		Store.state.newTab(buildTab({ path: "/channels/@me" }));
	};
	return (
		React.createElement('div', { className: "tabbar flex", }, leading, React.createElement('div', {
				className: concateClassNames("tabs-container flex-center", canDrop && isOver && "candrop"),
				ref: tabsContainerRef,
				onDoubleClick: e => e.stopPropagation(),
			}, React.createElement(TabsScroller, null, tabs.map((a, index, list) => [
				showTabDivider && index !== 0 && React.createElement('div', { className: "tab-div", }),
				React.createElement(Tab, {
					isSingle: list.length === 1,
					key: a.id,
					id: a.id,
				})
			])), React.createElement('div', { className: "new-tab-div", })
			/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */
			, React.createElement('div', {
				className: "new-tab flex-center round",
				onClick: newTabHandler,
			}, React.createElement(PlusIcon, { className: "parent-dim", }))
		), trailing)
	);
});

// common\Components\Gap\index.jsx
function Gap({ direction, gap, className }) {
	const style = {
		VERTICAL: {
			width: gap,
			height: "100%"
		},
		HORIZONTAL: {
			height: gap,
			width: "100%"
		}
	} [direction];
	return React.createElement('div', { style: style, className: className, });
}
Gap.direction = {
	HORIZONTAL: "HORIZONTAL",
	VERTICAL: "VERTICAL",
};

// @Modules\Slider
const Slider = getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true });

// @Modules\Heading
const Heading = getModule(a => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

// common\Components\icons\ArrowIcon\index.jsx
function Arrow() {
	return (
		React.createElement('svg', {
			width: 24,
			height: 24,
			viewBox: "0 0 24 24",
			fill: "none",
			xmlns: "http://www.w3.org/2000/svg",
		}, React.createElement('path', {
			d: "M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z",
			fill: "#ccc",
		}))
	);
}

// common\Components\Collapsible\index.jsx
function Collapsible({ title, children }) {
	const [open, setOpen] = React.useState(false);
	return (
		React.createElement('div', { className: open ? "collapsible-container collapsible-open" : "collapsible-container", }, React.createElement('div', {
			className: "collapsible-header",
			onClick: () => setOpen(!open),
		}, React.createElement('div', { className: "collapsible-icon", }, React.createElement(Arrow, null)), React.createElement(Heading, {
			className: "collapsible-title",
			tag: "h5",
		}, title)), React.createElement('div', { className: "collapsible-body", }, children))
	);
}

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

// src\Tabbys\components\SettingComponent\index.jsx
/* eslint-disable react/jsx-key */
const Text = BdApi.Components.Text;

function SettingSlider({ settingKey, label, note, ...props }) {
	const [val, set] = Settings.useSetting(settingKey);
	return (
		React.createElement(React.Fragment, null, React.createElement(Text, {
			strong: true,
			size: Text.Sizes.SIZE_16,
			style: { marginBottom: 8 },
		}, label), note && (
			React.createElement(Text, {
				size: Text.Sizes.SIZE_14,
				style: { marginBottom: 8 },
			}, note)
		), React.createElement(Slider, {
			onValueRender: Math.round,
			...props,
			initialValue: val,
			onValueChange: a => set(Math.round(a)),
		}))
	);
}
const sizes = [16, 20, 24, 32, 40, 48, 56, 80];
const SettingComponent = () => {
	return [
		React.createElement(Collapsible, { title: "Show/Hide", }, [{
				settingKey: "showTabDivider",
				description: "Show dividers between tabs",
				hideBorder: true,
				style: { marginBottom: 2 }
			},
			{
				settingKey: "showSettingsButton",
				description: "Show a quick settings button next to tabs",
				hideBorder: true,
				style: { marginBottom: 2 }
			},
			{
				settingKey: "showTabbar",
				description: "Show/hide Tabs bar",
				hideBorder: true,
				style: { marginBottom: 2 }
			},
			{
				settingKey: "showBookmarkbar",
				description: "Show/hide Bookmarks bar",
				hideBorder: true,
				style: { marginBottom: 2 }
			},
			{
				settingKey: "showPings",
				description: "Show/hide pings indicator",
				hideBorder: true,
				style: { marginBottom: 2 }
			},
			{
				settingKey: "focusNewTab",
				description: "switch to newly created tabs",
				hideBorder: true,
				style: { marginBottom: 2 }
			},
			{
				settingKey: "showUnreads",
				description: "Show/hide unread messages indicator",
				hideBorder: true,
				style: { marginBottom: 2 }
			},
			{
				settingKey: "showTyping",
				description: "Show/hide typing users indicator",
				hideBorder: true,
				style: { marginBottom: 2 }
			},
			{
				settingKey: "showDMNames",
				description: "Show/hide DM names",
				hideBorder: true,
				style: { marginBottom: 2 }
			}
		].map(SettingSwtich)),
		React.createElement(Gap, {
			className: "divider-h",
			direction: Gap.direction.HORIZONTAL,
			gap: 40,
		}),
		React.createElement(SettingSlider, {
			settingKey: "tabDividerSize",
			label: "Tabs divider size",
			note: "Space between tabs, selected value is doubled",
			markers: [...Array(11)].map((_, i) => i),
			defaultValue: 5,
			minValue: 0,
			maxValue: 10,
			stickToMarkers: true,
			sortedMarkers: true,
			equidistant: true,
		}),
		React.createElement(Gap, {
			className: "divider-h",
			direction: Gap.direction.HORIZONTAL,
			gap: 40,
		}),
		React.createElement(SettingSlider, {
			settingKey: "size",
			label: "UI density",
			markers: sizes,
			defaultValue: 20,
			stickToMarkers: true,
			sortedMarkers: true,
			equidistant: true,
		})
	];
};

// src\Tabbys\components\App\SettingsDropdown.jsx
const SettingsDropdown = React.memo(function SettingsDropdown() {
	const ref = useRef();
	return (
		React.createElement(DiscordPopout, {
			position: "bottom",
			align: "right",
			targetElementRef: ref,
			animation: 1,
			spacing: 8,
			renderPopout: () => (
				React.createElement('div', { className: "settings-dropdown", }, React.createElement(SettingComponent, null))
			),
		}, e => {
			return (
				React.createElement('div', {
					ref: ref,
					onClick: e.onClick,
					className: "settings-dropdown-btn flex-center",
				}, React.createElement(SettingIcon, { className: "parent-dim", }))
			);
		})
	);
});

// src\Tabbys\components\App\index.jsx
function App({ leading, trailing }) {
	const showTabbar = Settings(Settings.selectors.showTabbar);
	const showBookmarkbar = Settings(Settings.selectors.showBookmarkbar);
	const showSettingsButton = Settings(Settings.selectors.showSettingsButton);
	if (showSettingsButton) {
		trailing = React.cloneElement(trailing, {
			children: [React.createElement(SettingsDropdown, null), ...trailing.props.children]
		});
	}
	return (
		React.createElement('div', { className: `${config.info.name}-container Tabbys-vars`, }, showTabbar && (
			React.createElement(TabBar, {
				leading: leading,
				trailing: trailing,
			})
		), showTabbar && showBookmarkbar && React.createElement('div', { className: `${config.info.name}-divider`, }), showBookmarkbar && (
			React.createElement(BookmarkBar, {
				leading: !showTabbar && leading,
				trailing: !showTabbar && trailing,
			})
		))
	);
}

// src\Tabbys\patches\patchTitleBar.jsx
const TitleBar = getModuleAndKey(Filters.byStrings("PlatformTypes", "windowKey", "title"), { searchExports: true });
const patchTitleBar = () => {
	const { module, key } = TitleBar;
	if (!module || !key) return Logger.patchError("patchTitleBar");
	Patcher.after(module, key, (_, [props], ret) => {
		if (props.windowKey?.startsWith("DISCORD_")) return ret;
		const [, leading, trailing] = ret?.props?.children || [];
		return (
			React.createElement(ErrorBoundary, null, React.createElement(App, {
				leading: leading,
				trailing: trailing,
			}))
		);
	});
};

// src\Tabbys\patches\patchDMClick.js
const DMChannelFilter = Filters.byStrings("navigate", "location", "href", "createHref");
const DMChannel = getModule(a => a.render && DMChannelFilter(a.render), { searchExports: true });
const patchDMClick = () => {
	if (!DMChannel) return Logger.patchError("DMChannel");
	Patcher.before(DMChannel, "render", (_, [props]) => {
		const path = props.to;
		if (!path) return;
		props.onClick = e => {
			if (e.ctrlKey) {
				e.preventDefault();
				Store.state.newTab(buildTab({ path }));
			}
		};
	});
};

// common\DiscordModules\Enums.js
const ChannelTypeEnum = getModule(Filters.byKeys("GUILD_TEXT", "DM"), { searchExports: true }) || {
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
	"10000": "UNKNOWN",
};

// src\Tabbys\patches\patchContextMenu.jsx
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

function menu(path) {
	return [
		ContextMenu.buildItem({ type: "separator" }),
		ContextMenu.buildItem({
			type: "submenu",
			id: `${config.info.name}-channel-options`,
			label: React.createElement(MenuLabel, { label: config.info.name, }),
			items: [{
					action: () => Store.state.newTab(buildTab({ path })),
					icon: PlusIcon,
					label: "Open in new Tab"
				},
				{
					action: () => Store.state.addBookmark(buildTab({ path })),
					icon: BookmarkOutlinedIcon,
					label: "Bookmark channel"
				}
			]
		})
	];
}
const patchContextMenu = () => {
	return [
		...["thread-context", "channel-context"].map(context =>
			ContextMenu.patch(context, (retVal, { channel, targetIsUser }) => {
				if (!channel || targetIsUser) return;
				const path = getPath(channel);
				if (!path) return;
				retVal.props.children.push(...menu(path));
			})
		),
		ContextMenu.patch("channel-mention-context", (retVal, { originalLink }) => {
			const path = getPathName(originalLink);
			if (!path) return;
			retVal.props.children.push(...menu(path));
		}),
		ContextMenu.patch("user-context", (retVal, { user }) => {
			if (user.email) return;
			const channel = ChannelStore.getDMChannelFromUserId(user.id);
			if (!channel) return;
			const path = getPath(channel);
			if (!path) return;
			retVal.props.children.push(...menu(path));
		})
	];
};

// src\Tabbys\index.jsx
function disableGoHomeAfterSwitching() {
	function interceptor(e) {
		if (e.type !== "LOGOUT") return;
		e.goHomeAfterSwitching = false;
	}
	Dispatcher.addInterceptor(interceptor);
	return () => {
		const index = Dispatcher._interceptors.indexOf(interceptor);
		Dispatcher._interceptors.splice(index, 1);
	};
}

function cssVarsListener() {
	return Settings.subscribe(
		a => a,
		() => updateCssVars(),
		shallow
	);
}

function updateCssVars() {
	const state = Settings.state;
	BdApi.DOM.removeStyle("Tabbys-vars");
	BdApi.DOM.addStyle(
		"Tabbys-vars",
		`
			.Tabbys-vars {
				--size:${state.size}px;
				--tab-divider-size:${state.tabDividerSize}px;
			}
		`
	);
}
class Tabbys {
	start() {
		try {
			DOM.addStyle(css);
			updateCssVars();
			Store.init();
			patchTitleBar();
			patchDMClick();
			patchChannelClick();
			reRender('div[data-windows="true"] > *');
			this.unCssVarsListener = cssVarsListener();
			this.unpatchContextMenu = patchContextMenu();
			this.removeDispatchInterceptor = disableGoHomeAfterSwitching();
		} catch (e) {
			Logger.error(e);
		}
	}
	stop() {
		Store.dispose();
		DOM.removeStyle();
		BdApi.DOM.removeStyle("Tabbys-vars");
		Patcher.unpatchAll();
		reRender('div[data-windows="true"] > *');
		this.unCssVarsListener?.();
		this.unCssVarsListener = null;
		this.removeDispatchInterceptor?.();
		this.removeDispatchInterceptor = null;
		this.unpatchContextMenu?.forEach?.(p => p());
		this.unpatchContextMenu = null;
	}
	getSettingsPanel() {
		return React.createElement(SettingComponent, null);
	}
}

module.exports = Tabbys;

const css = `.Tabbys-vars {
	--size: 20px;
	--tab-divider-size: 3px;

	--active-tab-bg: rgba(151, 151, 159, 0.15);
	--hover-tab-bg: rgba(151, 151, 159, 0.35);
	--selected-tab-bg: rgba(151, 151, 159, 0.25);

	--close-btn-hover-bg: #595959;
	--close-btn-active-bg: #262626;

	--ping: rgb(218, 62, 68);
	--unread: rgb(88, 101, 242);

	--radius-round: 2147483647px;

	/* overrides */
	--custom-app-top-bar-height: calc(var(--size) + 10px);
	--space-32: calc(var(--size) + 10px);
}

.divider-h {
	background: linear-gradient(rgba(151, 151, 159, 0.12) 0 0) center/100% 1px no-repeat;
}

.tab,
.bookmark {
	flex: 0 1 auto;
	gap: 5px;
	padding: 5px;
	height: 100%;
	color: white;
	border-radius: calc(5 * (var(--size) / 16));
	cursor: pointer;
	transform: translate(0);
}

.dragging {
	opacity: 0.5;
}

.candrop {
	background: green !important;
}

.candrop:after {
	content: "";
	border-radius: inherit;
	position: absolute;
	inset: 0;
	border: 1px solid lime;
}

.bookmark-icon,
.tab-icon {
	flex: 0 0 var(--size);
	width: var(--size);
	height: var(--size);
}

.discord-icon {
	color: white;
	background: #6361f8;
}

.discord-icon > svg {
	width: 65%;
	height: 65%;
}

.Tabbys-menu-label-icon svg {
	width: 18px;
	height: 18px;
}

/* Helpers  */
.flip {
	rotate: 180deg;
}

.ellipsis {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.hidden-visually {
	translate: 0 -9999px !important;
}

.parent-dim {
	max-width: 100%;
	max-height: 100%;
}

.round {
	border-radius: var(--radius-round);
}

.fill {
	width: 100%;
	height: 100%;
}

.flex {
	display: flex;
}

.flex-center {
	display: flex;
	align-items: center;
	justify-content: center;
}

.collapsible-container {
	border-radius: 5px;
	border: 1px solid rgb(30, 31, 34);
	gap: 0px 20px;
	display: grid;
	grid-template-rows: min-content 0fr;
	transition: grid-template-rows 200ms linear;
}

.collapsible-header {
	background: rgba(30, 31, 34, 0.3);
	padding: 10px 3px;
	gap: 8px;
	display: flex;
	align-items: center;
}

.collapsible-icon {
	display: flex;
	flex-grow: 0;
	rotate: 0deg;
	transition: rotate 150ms linear;
}

.collapsible-title {
	text-transform: capitalize;
}

.collapsible-body {
	margin: 0 10px;
	transition: margin 0ms 200ms;
	overflow: hidden;
}

.collapsible-container.collapsible-open .collapsible-body{
	margin: 10px;
	transition: none;
}

.collapsible-container.collapsible-open {
	grid-template-rows: min-content 1fr;
}

.collapsible-container.collapsible-open .collapsible-header {
	border-bottom: 1px solid rgb(30, 31, 34);
}

.collapsible-container.collapsible-open .collapsible-icon {
	rotate: 90deg;
}
div:has(> .Tabbys-container):not(#a) {
	grid-template-rows: [top] auto [titleBarEnd] min-content [noticeEnd] 1fr [end];
}

.Tabbys-container * {
	box-sizing: border-box;
}

.Tabbys-container {
	grid-column: 1/-1;
	user-select: none;
	line-height: 1.4;
	margin-bottom: 2px;
	display: flex;
	flex-direction: column;
	-webkit-app-region: drag;
}

.Tabbys-divider {
	height: 5px;
	background:
		linear-gradient(to right, #0000 0, #ccc3 25%) left center/50% 1px no-repeat,
		linear-gradient(to left, #0000 0, #ccc3 25%) right center/50% 1px no-repeat;
	-webkit-app-region: no-drag;
}

.settings-dropdown {
	background-color: oklab(0.262384 0.00252247 -0.00889932);
	border-radius: 8px;
	gap: 5px;
	padding: 15px;
	overflow: auto;
	width: 40vw;
	max-height: 80vh;
}

.settings-dropdown::-webkit-scrollbar {
	height: 8px;
	width: 8px;
}

.settings-dropdown::-webkit-scrollbar-track {
	background-color: var(--scrollbar-thin-track);
	border-color: var(--scrollbar-thin-track);
}

.settings-dropdown::-webkit-scrollbar-thumb {
	background-clip: padding-box;
	background-color: var(--scrollbar-thin-thumb);
	border: 2px solid transparent;
	border-radius: 4px;
	min-height: 40px;
}

.settings-dropdown::-webkit-scrollbar-corner {
	background-color: transparent;
}

.settings-dropdown-btn {
	color: white;
	flex: 0 0 auto;
	color: var(--interactive-normal);
	cursor: pointer;
	-webkit-app-region: no-drag;
	height: var(--space-32);
	width: var(--space-32);
}

.settings-dropdown-btn:hover {
	color: var(--interactive-hover);
}

.settings-dropdown-btn > svg {
	height: var(--chat-input-icon-size);
	width: var(--chat-input-icon-size);
}

.tabs-container {
	min-width:0;
	gap:2px;
	position:relative;
	margin-right:auto;
	height:100%;
	-webkit-app-region: no-drag;
}

.new-tab{
	flex:0 0 auto;
	color: var(--interactive-normal);
	cursor: pointer;
	height: var(--space-32);
	width: var(--space-32);
}

.new-tab:hover {
	color: var(--interactive-hover);
}

.new-tab > svg{
	height: var(--chat-input-icon-size);
	width: var(--chat-input-icon-size);
}

.new-tab-div,
.tab-div{
	height:calc(var(--size) * .8);
	border: 1px solid #ccc5;	
}

.tab-div{
	margin: auto var(--tab-divider-size);
}


.bookmarkbar {
	-webkit-app-region: no-drag;
	display: flex;
	flex: 0 0 auto;
	overflow: hidden;
	transform: translate(0);
}

.bookmarks-container {
	flex: 1 0 0;
	min-width: 0;
	overflow: hidden;
	display: flex;
	gap: 2px;
	-webkit-app-region: no-drag;
}

.bookmarks-overflow {
	flex: 0 0 auto;
	padding: 2px;
	color: white;
	color: var(--interactive-normal);
	aspect-ratio: 1;
	margin: 0 6px;
	z-index: 988;
	-webkit-app-region: no-drag;
}

.bookmarks-overflow > svg {
	height: var(--chat-input-icon-size);
	width: var(--chat-input-icon-size);
}

.bookmarks-overflow:hover {
	color: var(--interactive-hover);
}

.bookmarks-overflow-popout {
	display: flex;
	flex-direction: column;
	background-color: var(--background-tertiary);
	border-radius: 8px;
	gap: 5px;
	padding: 5px;
	overflow: auto;
	max-height: 50vh;
}

.bookmarks-overflow-popout::-webkit-scrollbar {
	height: 8px;
	width: 8px;
}

.bookmarks-overflow-popout::-webkit-scrollbar-track {
	background-color: var(--scrollbar-thin-track);
	border-color: var(--scrollbar-thin-track);
}

.bookmarks-overflow-popout::-webkit-scrollbar-thumb {
	background-clip: padding-box;
	background-color: var(--scrollbar-thin-thumb);
	border: 2px solid transparent;
	border-radius: 4px;
	min-height: 40px;
}

.bookmarks-overflow-popout::-webkit-scrollbar-corner {
	background-color: transparent;
}

.tab {
	min-width:	min-content;
	max-width: calc(200 * (var(--size) / 16));
}

.selected-tab {
	background: var(--selected-tab-bg);
}

.tab:not(.selected-tab):hover {
	background: var(--hover-tab-bg);
}

.tab:not(.selected-tab):active:has(.tab-close:not(:active)) {
	background: var(--active-tab-bg);
}

.tab-title {
	flex: 1 1 0;
	min-width: 0;
	font-size:calc(var(--size) * .7);
}

.tab-close {
	flex: 0 0 calc(var(--size) * .8);
	width: calc(var(--size) * .8);
	height: calc(var(--size)* .8);
}

.tab-close  svg{
	width: 65%;
	height: 65%;
}

.tab-close:hover {
	background: var(--close-btn-hover-bg);
}

.tab-close:active {
	background: var(--close-btn-active-bg);
}

.typing-dots{
	flex:0 0 auto;
}
.tabs-scroller {
	display: flex;
	min-width: 0;
	position: relative;
}

.tabs-list {
	display: flex;
	overflow: auto hidden;
	scrollbar-width: none;
}

.scrollBtn {
	background-color: #27272b;
	z-index: 99;
	position: absolute;
	top: 50%;
	translate: 0 -50%;
	color: var(--interactive-normal);
	cursor: pointer;
	height: var(--space-32);
	width: var(--space-32);
}

.scrollBtn:hover {
	color: var(--interactive-hover);
}

.scrollBtn > svg {
	height: var(--chat-input-icon-size);
	width: var(--chat-input-icon-size);
}

.left-arrow {
	left: 0;
}

.right-arrow {
	right: 0;
}

.bookmark{
	justify-content:flex-start;
}

.bookmark:hover{
	background:#353333;
}

.bookmark:active{
	background:#353333;
}

.bookmark > .bookmark-title {
	color:#a7a7a7;
	font-size:calc(var(--size) * .6);
}



.badge {
	width: 16px;
	height: 16px;
	min-height: 16px;
	min-width: 16px;
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.02em;
	line-height: 1.4;
	text-transform: uppercase;
}

.badge.ping {
	background-color: var(--ping);
}

.badge.unread {
	background-color: var(--unread);
}
`;
