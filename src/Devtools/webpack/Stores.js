import { Modules } from "./Modules";
import { Decs } from "./Decs";
import { Sources } from "./Sources";
import Dispatcher from "@Modules/Dispatcher";

class Store {
	constructor(store) {
		this.store = store;
		this.module = Sources.getSourceByFunc(store.constructor)?.[0].module;
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

	get events() {
		return Stores.getStoreListeners(this.name);
	}
}

const FluxStore = Modules.getModule(a => a.Store, { searchExports: true })?.target.Store;
const stores = FluxStore.getAll();

export const Stores = {
	getStore(storeName) {
		const module = stores.find(a => a.getName() === storeName);
		if (!module) return undefined;
		return new Store(module);
	},
	getStoreFuzzy(str = "") {
		return stores.filter(a => a.getName().toLowerCase().includes(str)).map(store => new Store(store));
	},
	getStoreListeners(storeName) {
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const storeHandlers = Object.values(nodes).filter(({ name }) => name === storeName);
		return {
			get store(){ return Stores.getStore(storeName)},
			events: storeHandlers[0],
		};
	},
	getSortedStores: (() => {
		let stores = null;
		return function getSortedStores(force) {
			if (!stores || force) {
				stores = Modules.getModule(a => a?.Store, { searchExports: true })
					.target.Store.getAll()
					.map(store => [store.getName(), store])
					.sort((a, b) => a[0].localeCompare(b[0]))
					.map(([a, b]) => ({ [a]: b }));
			}
			return stores;
		};
	})(),
	getZustanStores() {
		const stores = Decs.getDecs(dec => dec && typeof dec === "function" && dec.getState && dec.setState && dec.getInitialState);

		return Object.values(stores).map(val => {
			const state = val.dec.getState();

			return Object.assign({}, state, {
				get _mod() {
					return val;
				}
			});
		});
	}
};
