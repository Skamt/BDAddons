import { Dispatcher } from "@Discord/Modules";
import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { getPathName } from "@Utils";
import ChannelStore from "@Stores/ChannelStore";
import GuildStore from "@Stores/GuildStore";
import { transitionTo } from "@Discord/Modules";
// s.getStore("GuildStore").store.getGuildIds()
// .map(s.getStore("ChannelStore").store.getChannelIds)

function generateTabs() {
	const guildIds = GuildStore.getGuildIds();
	const paths = guildIds.map(guildId => ChannelStore.getChannelIds(guildId).map(channelId => `/channels/${guildId}/${channelId}`)).flat();

	let b = 5;
	const res = [];
	while (b--)
		res.push({
			id: crypto.randomUUID(),
			path: paths[Math.floor(Math.random() * paths.length)]
		});
	return res;
}

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
	selectedId: null
};

function buildTab(d) {
	const id = crypto.randomUUID();

	return { ...d, id };
}

function merge(arr, item) {
	return [...arr, item];
}
export const Store = Object.assign(
	zustand(
		subscribeWithSelector((set, get) => {
			// const set = args => {
			// 	console.log("applying", args);
			// 	const oldState = get();
			// 	setState(args);
			// 	const newState = get();
			// 	console.log("old state", oldState);
			// 	console.log("new state", newState);
			// 	console.log("diff", diff(oldState, newState));
			// };

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
					set({ tabs: merge(state.tabs, newTab), selectedId: newTab.id });
				},

				removeTab(id) {
					const state = get();
					if (state.tabs.length === 1) return;
					const { tab, index, nextTab, previousTab } = state.getTabMeta(id);

					if (!tab || index === undefined || index < 0) return;

					const isSelected = state.selectedId === id;
					const newSelected = !isSelected ? state.selectedId : nextTab ? nextTab.id : previousTab.id;

					const newTabs = removeItemFromArray(state.tabs, index);
					set({ tabs: newTabs, selectedId: newSelected });
				},

				setSelectedId(id) {
					const state = get();
					const tabToBeSelected = state.getTab(id);
					if (!tabToBeSelected) return;
					set({ selectedId: id });
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
	),
	{
		init() {
			Store.state.setTabs([
				buildTab({
					path: "/channels/@me"
				})
			]);
			window.navigation.addEventListener("navigate", onLocationChange);
			// Dispatcher.subscribe("LOGIN", onUserLogin);
			Dispatcher.subscribe("LOGOUT", onUserLogout);
		},
		dispose() {
			Store.state.reset();
			window.navigation.removeEventListener("navigate", onLocationChange);
			// Dispatcher.unsubscribe("LOGIN", onUserLogin);
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

// function parseDiscordUrlPath(pathname) {
// 	const [, page, ...rest] = pathname.split("/");
// 	console.log("parseDiscordUrlPath", pathname);
// 	switch (page) {
// 		case "channels": {
// 			const [type, channelId] = rest;
// 			return {
// 				type: "channel",
// 				channelId,
// 				path: pathname,
// 				DM: type === "@me" ? true : false,
// 				guildId: type === "@me" ? "" : type
// 			};
// 		}
// 		case "discovery":
// 			return { type: "discovery", path: pathname };

// 		default:
// 			throw pathname;
// 	}
// }

function onLocationChange(e) {
	const pathname = getPathName(e.destination.url);
	if (!pathname) return;

	Store.state.updateSelectedTab({ path: pathname });
}

// function onUserLogin() {
	// setTimeout(() => {
	// 	Store.state.setTabs(generateTabs());
	// }, 5 * 1000);
// }

function onUserLogout() {
	Store.state.setTabs([
		buildTab({
			path: "/channels/@me"
		})
	]);
}
