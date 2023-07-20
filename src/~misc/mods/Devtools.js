import { getModule, getModuleAndKey } from "@Webpack";

import Dispatcher from "@Modules/Dispatcher";

const chunkName = Object.keys(window).find(key => key.startsWith("webpackChunk"));
const chunk = window[chunkName];
const webpackRequire = chunk.push([
	[Symbol()], {},
	r => r
]);
chunk.pop();

function defineModuleGetter(obj, id) {
	return Object.defineProperty(obj, id, {
		enumerable: true,
		get() {
			return Modules.moduleById(id);
		}
	});
}

const Module = (() => {
	let rawModule = null;
	return class Module {
		constructor(module) {
			rawModule = module;
		}
		get rawModule() {
			return rawModule;
		}

		get id() {
			return rawModule.id;
		}

		get exports() {
			return rawModule.exports;
		}

		get modulesImported() {
			return Modules.modulesImportedInModuleById(rawModule.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
		}

		get modulesImportedIn() {
			return Modules.modulesImportingModuleById(rawModule.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
		}
	}
})()

const Source = (() => {
	let rawSource = null;
	return class Source {
		constructor(source) {
			rawSource = source;
		}

		get rawSource() {
			return source;
		}

		get source() {
			return rawSource.source;
		}

		get id() {
			return rawSource.id;
		}

		get module() {
			return Modules.moduleById(rawSource.id);
		}
	}
})()

const Store = (() => {
	let rawStore = null;
	return class Store {
		constructor(store) {
			rawStore = store;
			this.name = store.getName();
		}
		get store() {
			return rawStore;
		}
		get localVars() {
			return rawStore.__getLocalVars();
		}
		get events() {
			return Stores.getStoreListeners(this.name)
		}
	}
})()

const Sources = {
	_sources: webpackRequire.m,
	getSources() {
		return Sources._sources;
	},
	sourceById(id) {
		return new Source({ id, source: Sources._sources[id] });
	},
	getSourceByExportFilter(filter, options = {}) {
		const result = Modules.unsafe_getModule(filter, options)?.id;
		if (!result) return undefined;
		return Array.isArray(result) ? result.map(Sources.sourceById) : Sources.sourceById(result);
	},
	getSourceBySourceFilter(strArr, first = true) {
		const sum = [];
		for (const [id, source] of Object.entries(Sources._sources)) {
			const sourceCode = source.toString();
			const result = strArr.every(str => sourceCode.includes(str))
			if (result) {
				if (first) return new Source({ id, source });
				else sum.push(new Source({ id, source }));
			}
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
		return new Module(Modules._modules[id]);
	},
	modulesImportedInModuleById(id) {
		const rawSource = Sources.sourceById(id).source.toString();

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
	unsafe_getModule(filter, options = {}) {
		const { first = true, defaultExport = true, searchExports = false, rawModule = false } = options;
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
					if (rawModule && first) return module;
					if (first) return foundModule;
					rm.push(rawModule ? module : foundModule);
				}
			} else {
				let foundModule = null;
				if (exports.Z && wrappedFilter(exports.Z, module, index)) foundModule = defaultExport ? exports.Z : exports;
				if (exports.ZP && wrappedFilter(exports.ZP, module, index)) foundModule = defaultExport ? exports.ZP : exports;
				if (exports.__esModule && exports.default && wrappedFilter(exports.default, module, index)) foundModule = defaultExport ? exports.default : exports;
				if (wrappedFilter(exports, module, index)) foundModule = exports;
				if (!foundModule) continue;
				if (rawModule && first) return module;
				if (first) return foundModule;
				rm.push(rawModule ? module : foundModule);
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
			get target() {
				return Common.getModuleAndSourceById(moduleId)
			},
			get modulesImportedInTarget() {
				return Modules.modulesImportedInModuleById(moduleId).map(Common.getModuleAndSourceById)
			},
			get modulesImportingTarget() {
				return Modules.modulesImportingModuleById(moduleId).map(Common.getModuleAndSourceById)
			}
		};
	},
	getAllByFilter(filter, options = {}) {
		const result = Modules.unsafe_getModule(filter, options)?.id;
		if (!result) return undefined;
		if (Array.isArray(result)) return result.map(Common.getAllById);
		return Common.getAllById(result);
	},
	getModuleAndSourceByExportsFilter(filter, options = {}) {
		const result = Modules.unsafe_getModule(filter, options)?.id;
		if (!result) return undefined;
		if (Array.isArray(result)) return result.map(Common.getModuleAndSourceById);
		return Common.getModuleAndSourceById(result);
	}
};

const Stores = {
	getStore(storeName) {
		const store = Modules.unsafe_getModule(m => m && m._dispatchToken && m.getName() === storeName);
		if (!store) return undefined;
		return new Store(store);
	},
	getStoreFuzzy(str = "") {
		str = str.toLowerCase();
		return Modules.unsafe_getModule(m => m && m._dispatchToken && m.getName().toLowerCase().includes(str), { first: false })
			.map(store => new Store(store));
	},
	getStoreListeners(storeName) {
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const storeHandlers = Object.values(nodes).filter(({ name }) => name === storeName);
		return storeHandlers[0];
	},
	getSortedStores: (function() {
		let stores = null;
		return function getSortedStores(force) {
			if (!stores || force) {
				stores = Stores.getStoreFuzzy()
					.map(store => [store.getName(), new Store(store)])
					.sort((a, b) => a[0].localeCompare(b[0]));
			}
			return stores;
		};
	})(),
}

const Misc = {
	getAllAssets() {
		return Object.values(Modules.getModules())
			.filter(a => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/))
			.map(a => a.exports);
	},
	byPropValue(val, first = true) {
		return Modules.unsafe_getModule(
			m => {
				try {
					return Object.values(m).some(v => v === val);
				} catch {
					return false;
				}
			}, { first }
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
		...Stores,
		...Sources,
		...Modules,
		DiscordModules: {
			Dispatcher
		}
	};
};