/**
 * @name Devtools
 * @description Helpful devtools for discord modules
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Devtools
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Devtools/Devtools.plugin.js
 */

const config = {
	"info": {
		"name": "Devtools",
		"version": "1.0.0",
		"description": "Helpful devtools for discord modules",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/Devtools/Devtools.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/Devtools",
		"authors": [{
			"name": "Skamt"
		}]
	}
}

const Logger = {
	error(...args) {
		this.p(console.error, ...args);
	},
	patch(patchId) {
		console.error(`%c[${config.info.name}] %c Error at %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
	},
	log(...args) {
		this.p(console.log, ...args);
	},
	p(target, ...args) {
		target(`%c[${config.info.name}]`, "color: #3a71c1;font-weight: bold;", ...args);
	}
};

const Api = new BdApi(config.info.name);

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return undefined;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return undefined;
	return { module, key };
}

const chunkName = Object.keys(window).find(key => key.startsWith("webpackChunk"));
const chunk = window[chunkName];
const webpackRequire = chunk.push([
	[Symbol()], {},
	r => r
]);
chunk.pop();

const Sources = {
	_sources: webpackRequire.m,
	getSources() {
		return Sources._sources;
	},
	sourceById(id) {
		return new Source({ id, source: Sources._sources[id] });
	},
	getSourceBySourceFilter(strArr, invert = false) {
		const sum = [];
		for (const [id, source] of Object.entries(Sources._sources)) {
			const sourceCode = source.toString();
			const result = strArr.every(str => sourceCode.includes(str));
			if (invert ^ result) sum.push(new Source({ id, source }));
		}
		return sum;
	}
};

function noExports(filter, module, exports) {
	if (filter(exports)) return new Module(module);
}

function doExports(filter, module, exports, index) {
	if (typeof exports !== "object") return;
	for (const entryKey in exports) {
		let target = null;
		try {
			target = exports[entryKey];
		} catch {
			continue;
		}
		if (!target) continue;
		if (filter(target, module, index)) return { target, entryKey, module: new Module(module) };
	}
}

function sanitizeExports(exports) {
	if (!exports) return;
	const exportsExceptions = [
		exports => typeof exports === "boolean",
		exports => exports === window,
		exports => exports.TypedArray,
		exports => exports === document.documentElement,
		exports => exports[Symbol.toStringTag] === "DOMTokenList"
	];
	for (let index = exportsExceptions.length - 1; index >= 0; index--) {
		if (exportsExceptions[index](exports)) return true;
	}
}

const Modules = {
	_modules: webpackRequire.c,
	getModules() {
		return Modules._modules;
	},
	moduleById(id) {
		return new Module(Modules._modules[id]);
	},
	modulesImportedInModuleById(id) {
		const rawSource = Sources.sourceById(id).loader.toString();
		const args = rawSource.match(/\((.+?)\)/i)?.[1];
		if (args?.length > 5 || !args) return [];

		const req = args.split(",")[2];
		const re = new RegExp(`(?:\\s|\\(|,|=)${req}\\("?(\\d+)"?\\)`, "g");
		const imports = Array.from(rawSource.matchAll(re));

		return imports.map(id => id[1]);
	},
	modulesImportingModuleById(id) {
		return Object.keys(Sources.getSources()).filter(sourceId => Modules.modulesImportedInModuleById(sourceId).includes("" + id));
	},
	getModule(filter, options = {}) {
		const { first = true, searchExports = false } = options;
		const f = searchExports ? doExports : noExports;

		const modules = Object.values(Modules.getModules());
		let results = [];
		for (let index = modules.length - 1; index >= 0; index--) {
			const module = modules[index];
			const { exports } = module;
			if (sanitizeExports(exports)) continue;

			const match = f(filter, module, exports, index);
			if (!match) continue;
			if (first) return match;
			results.push(match);
		}

		return first ? undefined : results;
	}
};

const Dispatcher = getModule(Filters.byProps("dispatch", "subscribe"), { searchExports: false });

const Stores = {
	getStore(storeName) {
		const storeFilter = exp => exp && ["Z", "ZP", "default"].some(k => exp[k]?._dispatchToken && exp[k]?.getName() === storeName);
		const module = Modules.getModule(storeFilter);
		if (!module) return undefined;
		return new Store(module);
	},
	getStoreFuzzy(str = "") {
		str = str.toLowerCase();
		const storeFilter = exp => exp && ["Z", "ZP", "default"].some(k => exp[k]?._dispatchToken && exp[k]?.getName().toLowerCase().includes(str));
		return Modules.getModule(storeFilter, { first: false }).map(module => new Store(module));
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
					.map(store => [store.name, store])
					.sort((a, b) => a[0].localeCompare(b[0]));
			}
			return stores;
		};
	})()
};

function defineModuleGetter(obj, id) {
	return Object.defineProperty(obj, id, {
		enumerable: true,
		get() {
			return Modules.moduleById(id);
		}
	});
}

function defineGetter(obj, id, val) {
	Object.defineProperty(obj, id, {
		get() {
			return val;
		}
	});
}

class Module {
	constructor(module) {
		defineGetter(this, "module", module);
	}

	get id() {
		return this.module.id;
	}

	get source() {
		return Sources.sourceById(this.module.id);
	}
	get exports() {
		return this.module.exports;
	}

	get modulesUsed() {
		return Modules.modulesImportedInModuleById(this.module.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}

	get modulesUsing() {
		return Modules.modulesImportingModuleById(this.module.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}
}

class Source {
	constructor(source) {
		defineGetter(this, "source", source);
	}

	get loader() {
		return this.source.source;
	}

	get id() {
		return this.source.id;
	}

	get module() {
		return Modules.moduleById(this.source.id);
	}

	get string() {
		return this.source.source.toString();
	}
}

class Store {
	constructor(module) {
		defineGetter(this, "module", module);
		this.name = this.store.getName();

		const methods = {};
		const _this = this;
		Object.getOwnPropertyNames(this.store.__proto__).forEach(key => {
			if (key === "constructor") return;
			const func = this.store[key];
			if (typeof func !== "function") return;
			if (func.length === 0)
				return Object.defineProperty(methods, key, {
					get() { return _this.store[key](); }
				});
			else methods[key] = func;
		});

		defineGetter(this, "methods", methods);
	}

	get store() {
		for (const key of ["Z", "ZP", "default"])
			if (key in this.module.exports) return this.module.exports[key];
	}

	get localVars() {
		return this.store.__getLocalVars();
	}

	get events() {
		return Stores.getStoreListeners(this.name);
	}
}

const TheBigBoyBundle = getModule(Filters.byProps("openModal", "FormSwitch", "Anchor"), { searchExports: false });

const Misc = {
	getAllAssets() {
		return Object.values(Modules.getModules())
			.filter(a => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/))
			.map(a => a.exports);
	},
	byPropValue(val, first = true) {
		return Modules.getModule(
			exports => {
				try {
					return Object.values(exports).some(v => v === val);
				} catch {}
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
			if (graph === null || refresh) graph = Object.keys(Modules.getModules()).map(a => ({ id: a, modules: Modules.modulesImportedInModuleById(a) }));
			return graph;
		};
	})()
};

function init() {
	["Filters", "getModule"].forEach(a => (window[a] = BdApi.Webpack[a]));
	window.getModuleAndKey = getModuleAndKey;
	window.s = {
		r: webpackRequire,
		...Misc,
		...Stores,
		...Sources,
		...Modules,
		DiscordModules: {
			Dispatcher,
			TheBigBoyBundle
		}
	};
}

class Devtools {
	start() {
		try {
			init();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		"s" in window && delete window.s;
	}
}

module.exports = Devtools;
