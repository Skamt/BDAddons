/**
 * @name Tabbys
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Tabbys
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Tabbys/Tabbys.plugin.js
 */

const config = {
	"info": {
		"name": "Tabbys",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/Tabbys/Tabbys.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/Tabbys",
		"authors": [{
			"name": "Skamt"
		}]
	}
}

// common\Api.js
const Api = new BdApi(config.info.name);
const DOM = Api.DOM;
const React = Api.React;
const Patcher = Api.Patcher;
const Logger = Api.Logger;
const Webpack = Api.Webpack;
/* annoying */
const getOwnerInstance = Api.ReactUtils.getOwnerInstance.bind(Api.ReactUtils);

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

function reRender(selector) {
	const target = document.querySelector(selector)?.parentElement;
	if (!target) return;
	const instance = getOwnerInstance(target);
	const unpatch = Patcher.instead(instance, "render", () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}
const nop = () => {};

function isSnowflake(id) {
	try {
		return BigInt(id).toString() === id;
	} catch {
		return false;
	}
}

// common\Utils\Logger.js
Logger.patchError = patchId => {
	console.error(`%c[${config.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
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
const Dispatcher = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: false });
const transitionTo = getModule(Filters.byStrings(`"transitionTo - Transitioning to "`), { searchExports: true });

// common\DiscordModules\zustand.js
const { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});
const subscribeWithSelector = getModule(Filters.byStrings("equalityFn", "fireImmediately"), { searchExports: true });
const zustand$1 = zustand;

// @Stores\ChannelStore
const ChannelStore = getStore("ChannelStore");

// @Stores\GuildStore
const GuildStore = getStore("GuildStore");

// src\Tabbys\Store.js
function removeItemFromArray(arr, index) {
	const tempArray = [...arr];
	tempArray.splice(index, 1);
	return tempArray;
}

function replaceItemInArray(arr, item, index) {
	const tempArr = [...arr];
	tempArr.splice(index, 1, item);
	return tempArr;
}
const initialState = {
	tabs: [],
	selectedId: null,
	lastSelectedIdAfterNewTab: null
};

function buildTab(d) {
	const id = crypto.randomUUID();
	return { ...d, id };
}

function merge(arr, item) {
	return [...arr, item];
}
const Store = Object.assign(
	zustand$1(
		subscribeWithSelector((set, get) => {
			return {
				...initialState,
				reset() {
					set({ ...initialState });
				},
				setTabs(list) {
					if (!list) return;
					if (!list.length) return;
					set({ tabs: list, selectedId: list[0].id });
				},
				createTab(tabInfoObj) {
					const state = get();
					const newTab = buildTab(tabInfoObj);
					set({ tabs: merge(state.tabs, newTab) });
				},
				newTab() {
					const state = get();
					const newTab = buildTab({
						path: "/channels/@me"
					});
					set({ tabs: merge(state.tabs, newTab), selectedId: newTab.id, lastSelectedIdAfterNewTab: state.selectedId });
				},
				removeTab(id) {
					const { tabs, getTabMeta, selectedId, lastSelectedIdAfterNewTab } = get();
					if (tabs.length === 1) return;
					const { tab, index, nextTab, previousTab } = getTabMeta(id);
					if (!tab || index === undefined || index < 0) return;
					const isSelected = selectedId === id;
					const newSelected = !isSelected ? selectedId : lastSelectedIdAfterNewTab ? lastSelectedIdAfterNewTab : nextTab ? nextTab.id : previousTab.id;
					const newTabs = removeItemFromArray(tabs, index);
					set({ tabs: newTabs, selectedId: newSelected, lastSelectedIdAfterNewTab: null });
				},
				moveTab(fromTabId, toTabId) {
					const state = get();
					const fromIndex = state.tabs.findIndex(a => a.id === fromTabId);
					const dragItem = state.tabs[fromIndex];
					if (!dragItem) return;
					const toIndex = state.tabs.findIndex(a => a.id === toTabId);
					const newTabs = [...state.tabs];
					const prevItem = newTabs.splice(toIndex, 1, dragItem);
					newTabs.splice(fromIndex, 1, prevItem[0]);
					set({ tabs: newTabs });
				},
				setSelectedId(id) {
					const state = get();
					const tabToBeSelected = state.getTab(id);
					if (!tabToBeSelected) return;
					set({ selectedId: id, lastSelectedIdAfterNewTab: null });
				},
				updateSelectedTab(newTabData) {
					const state = get();
					state.setTab(state.selectedId, newTabData);
				},
				setTab(id, payload) {
					const state = get();
					const { tab, index } = state.getTabMeta(id);
					const newTab = { ...tab, ...payload };
					set({ tabs: replaceItemInArray(state.tabs, newTab, index) });
				},
				getTabMeta(id) {
					const state = get();
					const index = state.tabs.findIndex(tab => tab.id === id);
					const nextTab = state.tabs[index + 1];
					const previousTab = state.tabs[index - 1];
					const tab = state.tabs[index];
					return { tab, index, nextTab, previousTab };
				},
				getTab(id) {
					const state = get();
					return state.tabs.find(tab => tab.id === id);
				},
				getCurrentlySelectedTab() {
					const state = get();
					return state.tabs.find(tab => tab.id === state.selectedId);
				}
			};
		})
	), {
		init() {
			Store.state.setTabs([
				buildTab({
					path: "/channels/@me"
				})
			]);
			window.navigation.addEventListener("navigate", onLocationChange);
			Dispatcher.subscribe("LOGOUT", onUserLogout);
		},
		dispose() {
			Store.state.reset();
			window.navigation.removeEventListener("navigate", onLocationChange);
			Dispatcher.unsubscribe("LOGOUT", onUserLogout);
		},
		selectors: {
			tabs: state => state.tabs,
			selectedId: state => state.selectedId
		}
	}
);
Store.subscribe(Store.selectors.selectedId, () => {
	const selectedTab = Store.state.getCurrentlySelectedTab();
	if (!selectedTab) return;
	transitionTo(selectedTab.path);
});
Object.defineProperty(Store, "state", {
	writeable: false,
	configurable: false,
	get: () => Store.getState()
});

function onLocationChange(e) {
	const pathname = getPathName(e.destination.url);
	if (!pathname) return;
	Store.state.updateSelectedTab({ path: pathname });
}
// }, 5 * 1000);
function onUserLogout() {
	Store.state.setTabs([
		buildTab({
			path: "/channels/@me"
		})
	]);
}

// common\React.js
const useState = React.useState;
const useEffect = React.useEffect;
const useRef = React.useRef;

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

// common\Components\icons\PlusIcon\index.jsx
function Plus() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
		}, React.createElement('path', { d: "M13 5a1 1 0 1 0-2 0v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2h-6V5Z", }))
	);
}

// common\Components\icons\CloseIcon\index.jsx
function Close() {
	return (
		React.createElement('svg', {
			width: "24",
			height: "24",
			fill: "currentColor",
			viewBox: "0 0 24 24",
		}, React.createElement('path', { d: "M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z", }))
	);
}

// common\Components\icons\DiscordIcon\index.jsx
function Discord() {
	return (
		React.createElement('svg', {
			width: "20",
			height: "20",
			fill: "currentColor",
			viewBox: "0 0 24 24",
		}, React.createElement('path', { d: "M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a18.43 18.43 0 0 0 5.63 2.87c.46-.62.86-1.28 1.2-1.98-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.7 1.7 11.28 0l.46.37c-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.47-4.87-.78-9.09-3.3-12.83ZM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27Zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27Z", }))
	);
}

// src\Tabbys\components\Tab\BaseTab.jsx
const DragSource = BdApi.Webpack.getByStrings("drag-source", "collect", { searchExports: true });
const DropTarget = BdApi.Webpack.getByStrings("drop-target", "collect", { searchExports: true });

function DragThis(comp) {
	return DropTarget(
		"TAB", {
			drop(thisTab, monitor) {
				const droppedTab = monitor.getItem();
				if (thisTab.id === droppedTab.id) return;
				Store.state.moveTab(droppedTab.id, thisTab.id);
			}
		},
		function(connect, monitor, props) {
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
					return { id: props.id };
				}
			},
			(props, monitor) => ({
				isDragging: !!monitor.isDragging(),
				dragRef: props.dragSource()
			})
		)(comp)
	);
}

function BaseTab({ id, path, selected, icon, title, dragRef, dropRef, isOver, canDrop, draggedIsMe, isDragging }) {
	const tabRef = useRef(null);
	const isSingleTab = Store(state => state.tabs.length === 1);
	const clickHandler = e => {
		e.stopPropagation();
		Store.state.setSelectedId(id);
		return console.log(id, "clickHandler");
	};
	const closeHandler = e => {
		e.stopPropagation();
		Store.state.removeTab(id);
		return console.log(id, "closeHandler");
	};
	dragRef(dropRef(tabRef));
	return (
		React.createElement('div', {
			ref: tabRef,
			className: concateClassNames("tab", selected && "selected-tab", isDragging && "dragging", !draggedIsMe && canDrop && isOver && "candrop"),
			onClick: !selected ? clickHandler : nop,
		}, React.createElement('div', { className: concateClassNames("tab-icon", !icon && "discord-icon"), }, icon || React.createElement(Discord, null)), React.createElement('div', { className: "tab-title ellipsis", }, title || path), !isSingleTab && (
			React.createElement('div', {
				className: "tab-close",
				onClick: closeHandler,
			}, React.createElement(Close, null))
		))
	);
}
const BaseTab$1 = DragThis(BaseTab);

// src\Tabbys\components\Tab\GenericTab.jsx
function GenericTab({ tabId, path }) {
	const selected = Store(state => state.selectedId === tabId);
	return (
		React.createElement(BaseTab$1, {
			id: tabId,
			path: path,
			selected: selected,
		})
	);
}

// @Modules\useStateFromStores
const useStateFromStores = getModule(Filters.byStrings("getStateFromStores"), { searchExports: true });

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

// @Stores\UserStore
const UserStore = getStore("UserStore");

// common\Utils\User.js
function getUserAvatar({ id, guildId, size }) {
	return UserStore.getUser(id).getAvatarURL(guildId, size);
}

// src\Tabbys\components\Tab\DMTab.jsx
const ICON_SIZE = 80;
const b = getModule(a => a.getChannelIconURL);

function getDmAvatar(channel, size) {
	const recipientId = channel.rawRecipients[0].id;
	return getUserAvatar({ id: recipientId, size });
}

function DMTab({ tabId, channelId, path }) {
	const selected = Store(state => state.selectedId === tabId);
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	if (!channel) return;
	const channelName = channel ? channel.rawRecipients.map(getUserName).join(", ") : "Home";
	const channelIconSrc =
		channel.type === ChannelTypeEnum.DM ?
		getDmAvatar(channel, ICON_SIZE) :
		b.getChannelIconURL({
			id: channel.id,
			icon: channel.icon,
			applicationId: channel.getApplicationId(),
			size: ICON_SIZE
		});
	const icon = channelIconSrc && (
		React.createElement('img', {
			src: channelIconSrc,
			alt: channelName,
		})
	);
	return (
		React.createElement(BaseTab$1, {
			id: tabId,
			path: path,
			selected: selected,
			icon: icon,
			title: channelName,
		})
	);
}

// src\Tabbys\components\Tab\ChannelTab.jsx
function ChannelTab({ tabId, guildId, channelId, threadId, path }) {
	const selected = Store(state => state.selectedId === tabId);
	const id = threadId || channelId;
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(id), [id]);
	if (!channel) return;
	const guild = GuildStore.getGuild(guildId);
	if (!guild) return React.createElement(BaseTab$1, { path: path, });
	const guildIcon = guild.getIconURL(80);
	return (
		React.createElement(BaseTab$1, {
			id: tabId,
			path: path,
			selected: selected,
			icon: guildIcon && (
				React.createElement('img', {
					src: guildIcon,
					alt: guild.name,
				})
			),
			title: channel.name,
		})
	);
}

// src\Tabbys\components\Tab\index.jsx
const Tab = React.memo(function TabSwitch({ id }) {
	const item = Store(state => state.tabs.find(tab => tab.id === id), shallow);
	if (!item?.path) return;
	const [, type, guildId, channelId, , threadId] = item.path.split("/");
	let res = null;
	if (type !== "channels")
		res = (
			React.createElement(GenericTab, {
				tabId: id,
				path: item.path,
			})
		);
	else if (guildId === "@me" && channelId)
		res = (
			React.createElement(DMTab, {
				tabId: id,
				path: item.path,
				channelId: channelId,
			})
		);
	else if (isSnowflake(guildId))
		res = (
			React.createElement(ChannelTab, {
				tabId: id,
				path: item.path,
				guildId: guildId,
				channelId: channelId,
				threadId: threadId,
			})
		);
	else
		res = (
			React.createElement(GenericTab, {
				tabId: id,
				path: item.path,
			})
		);
	return res;
});

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

// src\Tabbys\components\TabsScroller\index.jsx
function useChildrenLengthStateChange(children) {
	const lastCount = useRef(React.Children.count(children));
	const currentCount = React.Children.count(children);
	let state = "";
	if (lastCount.current < currentCount) state = "INCREASED";
	else if (lastCount.current > currentCount) state = "DECREASED";
	lastCount.current = currentCount;
	return state;
}

function useForceUpdate() {
	return React.useReducer((num) => num + 1, 0);
}

function TabsScroller({ children }) {
	console.log("TabsScroller rendered");
	const [updateScrollObserver, setUpdateScrollObserver] = useForceUpdate();
	const [leftScrollBtn, setLeftScrollBtn] = useState(false);
	const [rightScrollBtn, setRightScrollBtn] = useState(false);
	const displayStartScrollRef = useRef(null);
	const displayEndScrollRef = useRef(null);
	const tabsRef = useRef(null);
	const childrenLengthState = useChildrenLengthStateChange(children);

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
		const { index } = Store.state.getTabMeta(selectedTab.id);
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
		if (childrenLengthState !== "INCREASED") return;
		scrollSelectedIntoView();
	}, [children.length]);
	useEffect(() => {
		return Store.subscribe(Store.selectors.selectedId, scrollSelectedIntoView);
	}, []);
	useEffect(() => {
		console.log("IntersectionObserver");
		const tabsNode = tabsRef.current;
		const tabListChildren = Array.from(tabsNode.children);
		const length = tabListChildren.length;
		if (length < 1) return;
		const firstTab = tabListChildren[0];
		const lastTab = tabListChildren[length - 1];
		console.log(firstTab, lastTab);
		const observerOptions = {
			root: tabsNode,
			threshold: 0.95
		};
		const handleLeftScrollButton = entries => setLeftScrollBtn(!entries[0].isIntersecting);
		const leftObserver = new IntersectionObserver(debounce(handleLeftScrollButton), observerOptions);
		leftObserver.observe(firstTab);
		const handleRightScrollButton = entries => setRightScrollBtn(!entries[0].isIntersecting);
		const rightObserver = new IntersectionObserver(debounce(handleRightScrollButton), observerOptions);
		rightObserver.observe(lastTab);
		return () => {
			leftObserver.disconnect();
			rightObserver.disconnect();
		};
	}, [updateScrollObserver]);
	useEffect(() => {
		const tabsNode = tabsRef.current;
		if (!tabsNode) return;

		function handleMutation() {
			console.log("mutation");
			setUpdateScrollObserver();
		}
		const mutationObserver = new MutationObserver(handleMutation);
		mutationObserver.observe(tabsNode, {
			childList: true
		});
		return () => {
			mutationObserver?.disconnect();
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
		React.createElement('div', { className: "tabs-scroller", }
			/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */
			, React.createElement('div', {
				ref: displayStartScrollRef,
				onClick: handleStartScrollClick,
				className: concateClassNames("scrollBtn left-arrow", !leftScrollBtn && "hidden"),
			}, React.createElement(Arrow, null)), React.createElement('div', {
				className: "tabs-list",
				ref: tabsRef,
			}, children)
			/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */
			, React.createElement('div', {
				ref: displayEndScrollRef,
				onClick: handleEndScrollClick,
				className: concateClassNames("scrollBtn right-arrow", !rightScrollBtn && "hidden"),
			}, React.createElement(Arrow, null))
		)
	);
}

// src\Tabbys\components\TabBar\index.jsx
/* eslint-disable react/jsx-key */
function TabBar({ leading, trailing }) {
	console.log("TabBar rendered");
	const tabs = Store(Store.selectors.tabs, (a, b) => a.length === b.length && !a.some((_, i) => a[i].id !== b[i].id));
	const newTabHandler = e => {
		e.preventDefault();
		e.stopPropagation();
		console.log(e);
		Store.state.newTab();
	};
	return (
		React.createElement('div', null, leading, React.createElement('div', {
				className: "tabs-container",
				onDoubleClick: e => e.stopPropagation(),
			}, React.createElement(TabsScroller, null, [...tabs].map((a, index) => [
				index !== 0 && React.createElement('div', { className: "tab-div", }),
				React.createElement(Tab, {
					key: a.id,
					id: a.id,
				})
			])), React.createElement('div', { className: "tab-div", })
			/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */
			, React.createElement('div', {
				className: "new-tab",
				onClick: newTabHandler,
			}, React.createElement(Plus, null))
		), trailing)
	);
}

// src\Tabbys\components\BookmarkBar\index.jsx
function BookmarkBar() {
	return React.createElement('div', { className: "bookmarks-container", });
}

// src\Tabbys\components\App\index.jsx
function App({ leading, trailing }) {
	return (
		React.createElement('div', { className: "channel-tabs-container", }, React.createElement(TabBar, { leading: leading, trailing: trailing, }), React.createElement(BookmarkBar, null))
	);
}

// src\Tabbys\patches\patchTitleBar.jsx
const TitleBar = getModuleAndKey(Filters.byStrings("windowKey", "title"), { searchExports: true });
const patchTitleBar = () => {
	const { module, key } = TitleBar;
	if (!module || !key) return Logger.patch("patchTitleBar");
	Patcher.after(module, key, (_, __, ret) => {
		const [, leading, trailing] = ret?.props?.children || [];
		return (
			React.createElement(ErrorBoundary, null, React.createElement(App, {
				leading: leading,
				trailing: trailing,
			}))
		);
	});
};

// src\Tabbys\index.jsx
class Tabbys {
	start() {
		try {
			DOM.addStyle(css);
			Store.init();
			patchTitleBar();
			reRender('div[data-windows="true"] > *');
		} catch (e) {
			Logger.error(e);
		}
	}
	stop() {
		Store.dispose();
		DOM.removeStyle();
		Patcher.unpatchAll();
		reRender('div[data-windows="true"] > *');
	}
}

module.exports = Tabbys;

const css = `
div:has(> .channel-tabs-container):not(#a) {
	grid-template-rows: [top] auto [titleBarEnd] min-content [noticeEnd] 1fr [end];
}

:root{
	--tab-height:20px;
	
	--active-tab-bg:#353333;
	--hover-tab-bg:#7b7b7b;
	--selected-tab-bg:#3b3b41;

	--close-btn-hover-bg:#595959;
	--close-btn-active-bg:#262626;
}

.channel-tabs-container{
	grid-column:1/-1;
	position:relative;
	line-height:1.3; /* unify line height across weird characters */
}

.channel-tabs-container > div{
	position:relative;
	display:flex;
	-webkit-app-region: drag;
}

.tabs-container {
	display: flex;
	align-items:center;
	display: flex;
	user-select: none;
	padding: 3px;
	display: flex;
	align-items: center;
	align-self:flex-start;
	min-width:0;
	position:relative;
	margin-right:auto;
	-webkit-app-region: no-drag;
}

.tabs-container svg,
.tabs-container img {
	max-width:100%;
	max-height:100%;
}

.tabs-scroller {
	display: flex;
	min-width:0;
	padding:5px;
	position:relative;
}

.tabs-list {
	display: flex;
	overflow:auto;
	scrollbar-width:none;
	gap:5px;
}

.new-tab{
	flex:0 0 auto;
	display:flex;
	padding:2px;
	width:20px;
	height:20px;
	color:white;
	margin:0 5px;
	border-radius:50%;
}

.new-tab:hover{
	background:var(--hover-tab-bg);
}

.new-tab:active{
	background:var(--active-tab-bg);
}

.scrollBtn{
	height:var(--tab-height);
	background:#7b7b7b;
	padding:5px;
	border-radius:8px;
	z-index:99;
	position:absolute;
	top:50%;
	translate:0 -50%;
    display: flex;
    align-items: center;
    justify-content: center;
	aspect-ratio:1;
	cursor: pointer;
}

.left-arrow{
	left:0;
	rotate:180deg;
}

.right-arrow{
	right:0;
}

.scrollBtn.hidden{
	translate:-999px -999px;
}

.tab{
	min-width:200px;
	display:flex;
	align-items:center;
	gap:5px;
	padding:5px 8px;
	height:var(--tab-height);
	color:white;
	border-radius:8px;
	cursor: pointer;
	transform: translate(0);
}

.dragging{
	opacity:.5;
}

.candrop{
	background:green;
}
.candrop:after{
	content:"";
	border-radius:inherit;
	position:absolute;
	inset:0;
	border:1px solid lime;
}


.tab-div{
	min-width:2px;
	background:#ccc5;
	height:calc(var(--tab-height) * .7);
	margin: auto 2px;
}

.selected-tab{
	background:var(--selected-tab-bg);
}

.tab:not(.selected-tab):hover{
	background:var(--hover-tab-bg);
}

.tab:not(.selected-tab):active:has(.tab-close:not(:active)){
	background:var(--active-tab-bg);
}

.tab-icon{
	flex:0 0 auto;
	display:flex;
	--d:calc(var(--tab-height) * .7);
	width:var(--d);
	height:var(--d);
	align-items:center;
	justify-content:center;
	border-radius:50%;
}

.tab-icon > svg,
.tab-icon > img{
	flex:1 0 0;
	border-radius:50%;
}

.tab-icon.discord-icon{
	color:white;
	background: #6361f8;
}

.tab-icon.discord-icon > svg{
	width: 80%;
	height: 80%;
}

.tab-title{
	flex:1 0 0;
	min-width:0;
	mask:linear-gradient(to right, #000 80%, #0000 98%, #0000) no-repeat;
}

.tab-close{
	flex:0 0 auto;
	display:flex;
	padding:3px;
	--d:calc(var(--tab-height) * .6);
	width:var(--d);
	height:var(--d);
	border-radius:50%;
}

.tab-close:hover{
	background:var(--close-btn-hover-bg);
}

.tab-close:active{
	background:var(--close-btn-active-bg);
}

.ellipsis{
	white-space:nowrap;
	overflow:hidden;
	text-overflow:ellipsis;
}



`;
