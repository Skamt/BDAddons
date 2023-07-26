import { Store } from "./Types";
import {Modules} from "./Modules";
import Dispatcher from "@Modules/Dispatcher";

export const Stores = {
	getStore(storeName) {
		const storeFilter = exp => exp && ["Z", "ZP", "default"].some(k => exp[k]?._dispatchToken && exp[k]?.getName() ===  storeName);
		const module = Modules.getModule(storeFilter);
		if (!module) return undefined;
		return new Store(module);
	},
	getStoreFuzzy(str = "") {
		str = str.toLowerCase();
		return Modules.getModule(m => m && m._dispatchToken && m.getName().toLowerCase().includes(str), { first: false }).map(store => new Store(store));
	},
	getStoreListeners(storeName) {
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const storeHandlers = Object.values(nodes).filter(({ name }) => name === storeName);
		return storeHandlers[0];
	},
	getSortedStores: (function () {
		let stores = null;
		return function getSortedStores(force) {
			if (!stores || force) {
				stores = Stores.getStoreFuzzy()
					.map(store => [store.getName(), new Store(store)])
					.sort((a, b) => a[0].localeCompare(b[0]));
			}
			return stores;
		};
	})()
};

