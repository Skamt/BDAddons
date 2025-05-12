import bookmarksStore from "./bookmarksStore";
import tabsStore from "./tabsStore";
import { buildTab } from "@/utils";
import { Dispatcher } from "@Discord/Modules";
import { transitionTo } from "@Discord/Modules";
import zustand, { subscribeWithSelector } from "@Discord/zustand";
import ChannelStore from "@Stores/ChannelStore";
import GuildStore from "@Stores/GuildStore";
import { getPathName } from "@Utils";

function generateTabs(n=5) {
	const guildIds = GuildStore.getGuildIds();
	// biome-ignore lint/complexity/useFlatMap: <explanation>
	const paths = guildIds
		.map(guildId =>
			ChannelStore.getChannelIds(guildId)
				.filter(id => ChannelStore.getChannel(id).type === 0)
				.map(channelId => `/channels/${guildId}/${channelId}`)
		)
		.flat();

	let b = n;
	const res = [];
	while (b--)
		res.push({
			id: crypto.randomUUID(),
			path: paths[Math.floor(Math.random() * paths.length)]
		});
	return res;
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
				...tabsStore.store(set, get),
				...bookmarksStore.store(set, get)
			};
		})
	),
	{
		init() {
			Store.state.setTabs([{id: crypto.randomUUID(),path:'/channels/@me'},...generateTabs()]);
			Store.state.setBookmarks(generateTabs());
			// Store.state.setTabs([
			// 	buildTab({
			// 		path: "/channels/@me"
			// 	})
			// ]);
			window.navigation.addEventListener("navigate", onLocationChange);
			// Dispatcher.subscribe("LOGIN", onUserLogin);
			Dispatcher.subscribe("LOGOUT", onUserLogout);
		},
		dispose() {
			Store.state.clearTabs();
			Store.state.clearBookmarks();
			window.navigation.removeEventListener("navigate", onLocationChange);
			// Dispatcher.unsubscribe("LOGIN", onUserLogin);
			Dispatcher.unsubscribe("LOGOUT", onUserLogout);
		},
		selectors: {
			...tabsStore.selectors,
			...bookmarksStore.selectors,
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



function onLocationChange(e) {
	const pathname = getPathName(e.destination.url);
	if (!pathname) return;

	Store.state.setTab(Store.state.selectedId, { path: pathname });
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
	Store.state.setBookmarks([
		buildTab({
			path: "/channels/@me"
		})
	]);
}
