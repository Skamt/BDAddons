import { getModule, getModuleAndKey } from "@Webpack";
import Dispatcher from "@Modules/Dispatcher";

export default () => {
	const chunkName = Object.keys(window).find(key => key.startsWith("webpackChunk"));
	const chunk = window[chunkName];
	const webpackRequire = chunk.push([
		[Symbol()], {},
		r => r
	]);
	chunk.pop();

	let graph = [];

	const modules = webpackRequire.c;
	const sources = webpackRequire.m;

	// Returns module
	const moduleById = id => modules[id];
	// Returns source
	const sourceById = id => sources[id];

	// Returns an array of module IDs imported in target module
	const modulesImportedInModule = id => {
		const rawSource = sourceById(id).toString();

		const args = rawSource.match(/\((.+?)\)/i)?.[1];
		if (args?.length > 5 || !args) return [];

		const req = args.split(",")[2];
		const re = new RegExp(`(?:\\s|\\(|,|=)${req}\\((\\d+)\\)`, "g");
		const imports = Array.from(rawSource.matchAll(re));

		return imports.map(id => id[1]);
	};

	// Returns an array of module IDs importing target module
	const modulesImportingModule = id => Object.keys(sources).filter(sourceId => modulesImportedInModule(sourceId).includes("" + id));

	// returns source based on filter,
	const getSourceByExport = (filter, first = true) => {
		const result = getRawModuleByExportFilter(filter, { first });

		if (first) return modules.m[result.id];
		else return result.map(a => sources[a.id]);
	};

	// returns all directly exported strings
	const getAllAssets = () => Object.values(modules).filter(a => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/));

	// get store by store name
	const getStore = (storeName, first = true) => {
		return getModule(m => m && m._dispatchToken && m.getName().toLowerCase().includes(storeName.toLowerCase()), { first });
	};

	// returns module using BD getModule
	const getRawModuleByExportFilter = (filter, options) => {
		let module;
		getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
		return module;
	};

	const getModuleAndSourceByFilter = (filter, options) => {
		const module = getModule(filter, options);
		if (!module) return {}
		const moduleId = module.id;
		return getModuleAndSourceById(moduleId);
	}

	const getModuleAndSourceById = (moduleId) => {
		return {
			source: sourceById(moduleId),
			module: moduleById(moduleId)
		}
	}

	// returns all information abut module By filter
	const getAllByFilter = (filter, options) => {
		const module = getModule(filter, options);
		if (!module) return {}
		const moduleId = module.id;
		return getAllById(moduleId);
	};

	// returns all information abut module By module Id
	const getAllById = moduleId => {
		return {
			target: {
				id: moduleId,
				source: sourceById(moduleId),
				module: moduleById(moduleId)
			},
			modulesImportedInTarget: modulesImportedInModule(moduleId).map(id => ({ id, source: sourceById(id), module: moduleById(id) })),
			modulesImportingTarget: modulesImportingModule(moduleId).map(id => ({ id, source: sourceById(id), module: moduleById(id) }))
		};
	}

	// checks props on the exports, helpfull for getting class names
	const byPropValue = (val, first = true) => {
		return getModule(m => {
			try { return Object.values(m).some(v => v === val) } catch { return false; }
		}, { first });
	}

	const generateGraph = () => {
		graph = Object.keys(webpackRequire.c).map(a => ({ id: a, modules: modulesImportedInModule(a) }));
	}

	const getGraph = () => graph;

	const getEventListeners = (eventName) => {
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const subs = Dispatcher._subscriptions;
		return {
			stores: Object.values(nodes).map((a) => a.actionHandler[eventName] && a).filter(Boolean),
			subs: subs[eventName]
		};
	}

	const getStoreListeners = StoreName => {
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const StoreHandlers = Object.values(nodes).filter(({name})=> name === StoreName);
		return StoreHandlers;
	}

	window.S = {
		r: webpackRequire,
		getStoreListeners,
		getEventListeners,
		getGraph,
		generateGraph,
		getModuleAndKey,
		modules,
		sources,
		getModuleAndSourceById,
		getModuleAndSourceByFilter,
		moduleById,
		sourceById,
		getRawModuleByExportFilter,
		modulesImportedInModule,
		modulesImportingModule,
		getModule,
		getAllByFilter,
		getAllById,
		byPropValue,
		getStore,
		getSourceByExport,
		getAllAssets
	};

	["Filters", "getModule"].forEach(a => window[a] = BdApi.Webpack[a]);
};