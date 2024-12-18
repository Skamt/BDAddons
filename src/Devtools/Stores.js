import { Modules } from "./Modules";
import { Sources } from "./Sources";
import Dispatcher from "@Modules/Dispatcher";

class Store {
	constructor(module) {
		this.module = module;
		this.name = this.store.getName();

		this.methods = {};
		const _this = this;
		// biome-ignore lint/complexity/noForEach: <explanation>
		Object.getOwnPropertyNames(this.store.__proto__).forEach(key => {
			if (key === "constructor") return;
			const func = this.store[key];
			if (typeof func !== "function") return;
			if (func.length === 0)
				return Object.defineProperty(this.methods, key, {
					get() {
						return _this.store[key]();
					}
				});
			this.methods[key] = func;
		});
	}


	get store() {
		
		for (const key of ["Z", "ZP", "default"]) if (key in this.module.exports) return this.module.exports[key];
	}

	// get localVars() {
	// 	return this.store.__getLocalVars();
	// }

	get events() {
		return Stores.getStoreListeners(this.name);
	}
}

const Zustand = Sources.getSource("/ServerSideRendering|^Deno\\//");

export const Stores = {
	getStore(storeName) {
		// const storeFilter = exp => exp?.default?._dispatchToken && exp?.default?.getName() === storeName;
		const storeFilter = exp => exp && ["Z", "ZP", "default"].some(k => exp[k]?._dispatchToken && exp[k]?.getName() ===  storeName);
		const module = Modules.getModule(storeFilter);
		if (!module) return undefined;
		return new Store(module);
	},
	getStoreFuzzy(str = "") {
		// const storeFilter = exp => exp?.default?._dispatchToken && exp?.default?.getName().toLowerCase().includes(str.toLowerCase());
		const storeFilter = exp => exp && ["Z", "ZP", "default"].some(k => exp[k]?._dispatchToken && exp[k]?.getName().toLowerCase().includes(str));
		return Modules.getModules(storeFilter).map(module => new Store(module));
	},
	getStoreListeners(storeName) {
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const storeHandlers = Object.values(nodes).filter(({ name }) => name === storeName);
		return storeHandlers[0];
	},
	getSortedStores: (() => {
		let stores = null;
		return function getSortedStores(force) {
			if (!stores || force) {
				stores = Modules.getModule(a => a?.Store,{searchExports:true}).target.Store.getAll()
					.map(store => [store.getName(), store])
					.sort((a, b) => a[0].localeCompare(b[0]))
					.map(([a,b]) => ({[a]:b}));
			}
			return stores;
		};
	})(),
	getZustanStores(){
		return Zustand.module.modulesUsingThisModule;
	}
};
