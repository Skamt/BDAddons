import  { create, subscribeWithSelector } from "@Discord/zustand";
import TabSlice from "./tabs";
import { ensureTab } from "./methods";
import FolderSlice from "./folders";
import BookmarkSlice from "./bookmarks";
import Plugin, { Events } from "@Utils/Plugin";
import { Data } from "@Api";
import { getPathName, shallow, debounce } from "@Utils";
import UserStore from "@Stores/UserStore";
import { navigate } from "@/utils";
import { Dispatcher } from "@Discord/Modules";

const initialState = {
	...TabSlice.state,
	...FolderSlice.state,
	...BookmarkSlice.state
};

const Store = create(subscribeWithSelector(() => initialState));

Object.defineProperty(Store, "selectors", {
	value: Object.assign({}, FolderSlice.selectors, TabSlice.selectors, BookmarkSlice.selectors)
});

Object.assign(Store, TabSlice.actions, BookmarkSlice.actions, FolderSlice.actions);

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

const onLocationChange = debounce(e => {
	const pathname = getPathName(e.destination.url);
	if (!pathname) return;
	const selectedTab = Store.getSelectedTab();
	if (selectedTab?.path === pathname) return;
	Store.setTabPath(Store.state.selectedId, pathname);
}, 50);

function hydrateStore() {
	const user = UserStore.getCurrentUser();
	if (Store.state.user?.id === user.id) return;
	const userData = Data.load(user.id) || initialState;
	Store.setState({ ...userData });
	ensureTab();
}

Plugin.on(Events.START, () => {
	hydrateStore();

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
		(a, b) => console.log(diff(b, a)),
		shallow
	);

	window.TabbysStore = Store;
}

export default Store;
