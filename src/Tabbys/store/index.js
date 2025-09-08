import zustand, { subscribeWithSelector } from "@Discord/zustand";
import TabSlice from "./tabs";
import BookmarkSlice from "./bookmarks";
import UserSlice from "./bookmarks";
import Plugin, { Events } from "@Utils/Plugin";
import { Data } from "@Api";
import { getPathName, debounce } from "@Utils";
import UserStore from "@Stores/UserStore";
import { transitionTo } from "@Discord/Modules";

const stateFn = () => ({
	...TabSlice.state,
	...BookmarkSlice.state,
	...UserSlice.state
});

const Store = zustand(subscribeWithSelector(stateFn));

Object.defineProperty(Store, "state", {
	configurable: false,
	get: () => Store.getState()
});

Object.defineProperty(Store, "selectors", { value: {} });

Object.assign(Store, TabSlice.actions, BookmarkSlice.actions, UserSlice.actions);
Object.assign(Store.selectors, TabSlice.selectors, BookmarkSlice.selectors);

import { addedDiff, deletedDiff, detailedDiff, diff, updatedDiff } from "deep-object-diff";

Store.subscribe(
	state => state,
	(p, n) => {
		console.log(detailedDiff(n, p));
	}
);

Store.subscribe(Store.selectors.selectedId, () => {
	const selectedTab = Store.getSelectedTab();
	if (!selectedTab) return;
	transitionTo(selectedTab.path);
});

const onLocationChange = debounce(e => {
	const pathname = getPathName(e.destination.url);
	if (!pathname) return;
	Store.setSelectedTab(pathname);
}, 50);

function hydrateStore() {
	const user = UserStore.getCurrentUser();
	if (Store.state.user?.id === user.id) return;
	const userData = Data.load(user.id) || {};
	Store.setState({ ...userData });
}

Plugin.on(Events.START, () => {
	window.navigation.addEventListener("navigate", onLocationChange);
	hydrateStore();
});

Plugin.on(Events.STOP, () => {
	window.navigation.removeEventListener("navigate", onLocationChange);
});

DEV: {
	window.TabbysStore = Store;
}

export default Store;
