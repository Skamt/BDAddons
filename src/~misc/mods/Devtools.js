import { getModule } from "@Webpack";

export default () => {
	const chunkName = Object.keys(window).find(key => key.startsWith("webpackChunk"));
	const chunk = window[chunkName];
	const webpackRequire = chunk.push([
		[Symbol()], {},
		r => r
	]);
	chunk.pop();

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

	const getModuleByExport = (filter, first = true) => {
		const indices = Object.keys(modules);
		let matches = [];
		for (let i = 0; i < indices.length; i++) {
			const module = modules[indices[i]];
			if (!module || module.exports === DOMTokenList.prototype || module === window) continue;
			if (filter(module)) {
				if (first) return module;
				else matches.push(module);
			}
		}
		return matches;
	};
	const getSourceByExport = (filter, first = true) => {
		const result = getModuleByExport(filter, first);

		if (first) return modules.m[result.id];
		else return result.map(a => sources[a.id]);
	};

	const getAllAssets = () => Object.values(modules).filter(a => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/));

	const getStore = storeName => {
		return getModuleByExport(m => m?.exports?.Z?._dispatchToken && m?.exports?.Z?.getName() === storeName, true);
	};

	const getRawModule = (filter, options) => {
		let module;
		const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
		return module;
	};

	const getAll = (filter, options) => {
		const module = getRawModule(filter, options);
		if(!module) return {}
		const moduleId = module.id;
		const exp = module.exports;
		return {
			target: {
				id: moduleId,
				source: sourceById(moduleId),
				module
			},
			modulesImportedInTarget: modulesImportedInModule(moduleId).map(id => ({ id, source: sourceById(id), module: moduleById(id) })),
			modulesImportingTarget: modulesImportingModule(moduleId).map(id => ({ id, source: sourceById(id), module: moduleById(id) }))
		};
	};

	window.S = {
		r: webpackRequire,
		modules,
		sources,
		moduleById,
		sourceById,
		getRawModule,
		modulesImportedInModule,
		modulesImportingModule,
		getModuleByExport,
		getAll,
		getStore,
		getSourceByExport,
		getAllAssets
	};

	["Filters", "getModule"].forEach(a => window[a] = BdApi.Webpack[a]);
};