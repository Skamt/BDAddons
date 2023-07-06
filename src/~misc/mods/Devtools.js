import { getModule, getModuleAndKey } from "@Webpack";

import Dispatcher from "@Modules/Dispatcher";

const chunkName = Object.keys(window).find(key => key.startsWith("webpackChunk"));
const chunk = window[chunkName];
const webpackRequire = chunk.push([[Symbol()], {}, r => r]);
chunk.pop();


const Helper = {
	getStoreInfo(store){
		const storeName = store.getName();
		return {
			store,
			name: storeName,
			get localVars(){
				return store.__getLocalVars?.();
			},
			get events(){
				return Misc.getStoreListeners(storeName)?.actionHandler;
			}
		}
	}
}

const Sources = {
	_sources: webpackRequire.m,
	sourceById(id) {
		return Sources._sources[id];
	},
	getSources() {
		return Sources._sources;
	},
	getSourceByExportFilter(filter, options = {}) {
		const result = Modules.getModuleIdByExportFilter(filter, options);
		if (!result) return undefined;
		return Array.isArray(result) ? result.map(Sources.sourceById) : Sources.sourceById(result);
	},
	getSourceBySourceFilter(filter, first = true) {
		const sum = [];
		for (const [id, source] of Object.entries(Sources._sources)) {
			const result = filter(source);
			if (result && first) return { id, source };
			else if (result) sum.push({ id, source });
		}
		return sum;
	}
};

const Modules = {
	_modules: webpackRequire.c,
	getModules() {
		return Modules._modules;
	},
	moduleById(id) {
		return Modules._modules[id];
	},
	modulesImportedInModuleById(id) {
		const rawSource = Sources.sourceById(id).toString();

		const args = rawSource.match(/\((.+?)\)/i)?.[1];
		if (args?.length > 5 || !args) return [];

		const req = args.split(",")[2];
		const re = new RegExp(`(?:\\s|\\(|,|=)${req}\\((\\d+)\\)`, "g");
		const imports = Array.from(rawSource.matchAll(re));

		return imports.map(id => id[1]);
	},
	modulesImportingModuleById(id) {
		return Object.keys(Sources.getSources()).filter(sourceId => Modules.modulesImportedInModuleById(sourceId).includes("" + id));
	},
	getModuleIdByExportFilter(filter, options = {}) {
		const modules = [];
		Modules.unsafe_getModule((entry, m) => (filter(entry) ? modules.push(m) : false), options);
		return (options.first === undefined ? true : options.first) ? modules[0].id : modules.map(a => a.id);
	},
	rawModuleByExport(target){
		let module = null;
		Modules.unsafe_getModule((a,m) => a === target ? (module = m) : false);
		return module;
	},
	unsafe_getModule(filter, options = {}) {
		const { first = true, defaultExport = true, searchExports = false } = options;
		const wrappedFilter = filter;

		const modules = Modules.getModules();
		const rm = [];
		const indices = Object.keys(modules);
		for (let i = 0; i < indices.length; i++) {
			const index = indices[i];
			if (!modules.hasOwnProperty(index)) continue;

			let module = null;
			try {
				module = modules[index];
			} catch {
				continue;
			}

			const { exports } = module;
			if (!exports || exports === window || exports === document.documentElement || exports[Symbol.toStringTag] === "DOMTokenList") continue;

			if (typeof exports === "object" && searchExports && !exports.TypedArray) {
				for (const key in exports) {
					let foundModule = null;
					let wrappedExport = null;
					try {
						wrappedExport = exports[key];
					} catch {
						continue;
					}

					if (!wrappedExport) continue;
					if (wrappedFilter(wrappedExport, module, index)) foundModule = wrappedExport;
					if (!foundModule) continue;
					if (first) return foundModule;
					rm.push(foundModule);
				}
			} else {
				let foundModule = null;
				if (exports.Z && wrappedFilter(exports.Z, module, index)) foundModule = defaultExport ? exports.Z : exports;
				if (exports.ZP && wrappedFilter(exports.ZP, module, index)) foundModule = defaultExport ? exports.ZP : exports;
				if (exports.__esModule && exports.default && wrappedFilter(exports.default, module, index)) foundModule = defaultExport ? exports.default : exports;
				if (wrappedFilter(exports, module, index)) foundModule = exports;
				if (!foundModule) continue;
				if (first) return foundModule;
				rm.push(foundModule);
			}
		}

		return first || rm.length == 0 ? undefined : rm;
	}
};

const Common = {
	getModuleAndSourceById(moduleId) {
		return {
			id: moduleId,
			source: Sources.sourceById(moduleId),
			module: Modules.moduleById(moduleId)
		};
	},
	getAllById(moduleId) {
		return {
			target: Common.getModuleAndSourceById(moduleId),
			modulesImportedInTarget: Modules.modulesImportedInModuleById(moduleId).map(Common.getModuleAndSourceById),
			modulesImportingTarget: Modules.modulesImportingModuleById(moduleId).map(Common.getModuleAndSourceById)
		};
	},
	getModuleAndSourceByExportsFilter(filter, options = {}) {
		const result = Modules.getModuleIdByExportFilter(filter, options);
		if (!result) return undefined;
		if (Array.isArray(result)) return result.map(Common.getModuleAndSourceById);
		return Common.getModuleAndSourceById(result);
	},
	getAllByFilter(filter, options = {}) {
		const result = Modules.getModuleIdByExportFilter(filter, options);
		if (!result) return undefined;
		if (Array.isArray(result)) return result.map(Common.getAllById);
		return Common.getAllById(result);
	}
};

const Misc = {
	getAllAssets() {
		return Object.values(Modules.getModules())
			.filter(a => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/))
			.map(a => a.exports);
	},
	getStore(storeName) {
		return Modules.unsafe_getModule(m => m && m._dispatchToken && m.getName() === storeName);
	},
	getStoreFuzzy(str = "") {
		str = str.toLowerCase();
		return Modules.unsafe_getModule(m => m && m._dispatchToken && m.getName().toLowerCase().includes(str), { first: false });
	},
	getSortedStores: (function () {
		let stores = null;
		return function getSortedStores(force) {
			if (!stores || force) {
				stores = {};
				Misc.getStoreFuzzy()
					.map(store => [store.getName(), store._dispatchToken, store])
					.sort((a, b) => a[0].localeCompare(b[0]))
					.forEach(a => {
						try {
							Object.defineProperty(stores, `${a[0]}`, {
								get() {
									return Helper.getStoreInfo(a[2]);
								}
							});
						} catch(e) {
							console.log(`${a[0]}~${a[1]}`)
							Object.defineProperty(stores, `__${a[0]}~${a[1]}`, {
								get() {
									return Helper.getStoreInfo(a[2]);
								}
							});
						}
					});
			}
			return stores;
		};
	})(),
	byPropValue(val, first = true) {
		return Modules.unsafe_getModule(
			m => {
				try {
					return Object.values(m).some(v => v === val);
				} catch {
					return false;
				}
			},
			{ first }
		);
	},
	getEventListeners(eventName) {
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const subs = Dispatcher._subscriptions;
		return {
			stores: Object.values(nodes)
				.map(a => a.actionHandler[eventName] && a)
				.filter(Boolean),
			subs: [eventName, subs[eventName]]
		};
	},
	getEventListenersFuzzy(str = "") {
		str = str.toLowerCase();
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const subs = Dispatcher._subscriptions;
		return {
			stores: Object.values(nodes).filter(a => Object.keys(a.actionHandler).some(key => key.toLowerCase().includes(str))),
			subs: Object.entries(subs)
				.filter(([key]) => key.toLowerCase().includes(str))
				.map(a => a)
		};
	},
	getStoreListeners(storeName) {
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const storeHandlers = Object.values(nodes).filter(({ name }) => name === storeName);
		return storeHandlers[0];
	},
	getGraph: (() => {
		let graph = null;
		return function getGraph(refresh = false) {
			if (graph === null || refresh) graph = Object.keys(Modules.getModules()).map(a => ({ id: a, modules: Modules.modulesImportedInModule(a) }));
			return graph;
		};
	})()
};

export default () => {
	["Filters", "getModule"].forEach(a => (window[a] = BdApi.Webpack[a]));
	window.getModuleAndKey = getModuleAndKey;
	window.s = {
		r: webpackRequire,
		...Misc,
		...Common,
		...Sources,
		...Modules,
		DiscordModules:{
			Dispatcher
		}
	};
};
