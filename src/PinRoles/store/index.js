import zustand, { subscribeWithSelector } from "@Discord/zustand";
import UserStore from "@Stores/UserStore";
import { Data } from "@Api";
import Plugin, { Events } from "@Utils/Plugin";
import RolesSlice from "./roles";
import { shallow } from "@Utils";

const initialState = { ...RolesSlice.state };

const Store = zustand(subscribeWithSelector(() => initialState));

Object.defineProperty(Store, "state", {
	configurable: false,
	get: () => Store.getState()
});

Store.subscribe(
	state => state,
	() => {
		const user = UserStore.getCurrentUser();
		Data.save(user.id, Store.state);
	},
	shallow
);

Object.defineProperty(Store, "selectors", { value: Object.assign({}, RolesSlice.selectors) });
Object.assign(Store, RolesSlice.actions);

function hydrateStore() {
	const user = UserStore.getCurrentUser();
	const userData = Data.load(user.id) || initialState;
	Store.setState({ ...userData });
}

Plugin.on(Events.START, () => {
	hydrateStore();
});

Plugin.on(Events.STOP, () => {});

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
