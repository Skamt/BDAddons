import bookmarksStore from "./bookmarksStore";
import tabsStore from "./tabsStore";
import { Data } from "@Api";
import { buildTab } from "@/utils";
import { Dispatcher } from "@Discord/Modules";
import { transitionTo } from "@Discord/Modules";
import zustand, { subscribeWithSelector } from "@Discord/zustand";
import UserStore from "@Stores/UserStore";
import ChannelStore from "@Stores/ChannelStore";
import GuildStore from "@Stores/GuildStore";
import { getPathName } from "@Utils";

// function generateTabs(n = 5) {
// 	const guildIds = GuildStore.getGuildIds();
// 	// biome-ignore lint/complexity/useFlatMap: <explanation>
// 	const paths = guildIds
// 		.map(guildId =>
// 			ChannelStore.getChannelIds(guildId)
// 				.filter(id => ChannelStore.getChannel(id).type === 0)
// 				.map(channelId => `/channels/${guildId}/${channelId}`)
// 		)
// 		.flat();

// 	let b = n;
// 	const res = [];
// 	while (b--)
// 		res.push({
// 			id: crypto.randomUUID(),
// 			path: paths[Math.floor(Math.random() * paths.length)]
// 		});
// 	return res;
// }

// import { diff } from "deep-object-diff";

export const Store = Object.assign(
	zustand(
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
	),
	{
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
	writeable: false,
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
