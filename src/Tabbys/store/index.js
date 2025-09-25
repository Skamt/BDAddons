import zustand, { subscribeWithSelector } from "@Discord/zustand";
import TabSlice from "./tabs";
import { ensureTab } from "./methods";
import FolderSlice from "./folders";
import BookmarkSlice from "./bookmarks";
import UserSlice from "./users";
import Plugin, { Events } from "@Utils/Plugin";
import { Data } from "@Api";
import { getPathName, shallow, debounce } from "@Utils";
import UserStore from "@Stores/UserStore";
import { transitionTo } from "@Discord/Modules";
import { Dispatcher } from "@Discord/Modules";

const stateFn = () => ({
	...TabSlice.state,
	...FolderSlice.state,
	...BookmarkSlice.state,
	...UserSlice.state
});

const Store = zustand(subscribeWithSelector(stateFn));

Object.defineProperty(Store, "state", {
	configurable: false,
	get: () => Store.getState()
});

Object.defineProperty(Store, "selectors", { value: {} });

Object.assign(Store, TabSlice.actions, BookmarkSlice.actions, UserSlice.actions, FolderSlice.actions);
Object.assign(Store.selectors, FolderSlice.selectors, TabSlice.selectors, BookmarkSlice.selectors);

Store.subscribe(
	state => state,
	() => {
		const user = UserStore.getCurrentUser();
		Data.save(user.id, Store.state);
	},
	shallow
);

Store.subscribe(Store.selectors.selectedId, () => {
	const selectedTab = Store.getSelectedTab();
	if (!selectedTab) return;
	transitionTo(selectedTab.path);
});

Store.subscribe(() => Store.getSelectedTab()?.path, transitionTo, shallow);

const onLocationChange = debounce(e => {
	const pathname = getPathName(e.destination.url);
	if (!pathname) return;
	Store.setTabPath(Store.state.selectedId, pathname);
}, 50);

function hydrateStore() {
	const user = UserStore.getCurrentUser();
	if (Store.state.user?.id === user.id) return;
	const userData = Data.load(user.id) || {};
	Store.setState({ ...userData });
}



Plugin.on(Events.START, () => {
	hydrateStore();
	ensureTab();
	window.navigation.addEventListener("navigate", onLocationChange);
	Dispatcher.subscribe("CONNECTION_OPEN", hydrateStore);
});

Plugin.on(Events.STOP, () => {
	window.navigation.removeEventListener("navigate", onLocationChange);
	Dispatcher.unsubscribe("CONNECTION_OPEN", hydrateStore);
});

import { diff, addedDiff, deletedDiff, updatedDiff, detailedDiff } from "deep-object-diff";
DEV: {
	Store.subscribe(
		state => state,
		(a, b) => console.log(detailedDiff(b, a)),
		shallow
	);

	window.TabbysStore = Store;
}

export default Store;
