import { waitForModule, Filters, getModule } from "@Api";

export { getModule };
export { Filters };
export { waitForModule };

export function getRawModule(filter, options) {
	let module;
	getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	return module;
}

export function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return {};
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return {};
	return { module, key };
}

export function filterModuleAndExport(moduleFilter, exportFilter, options) {
	const module = getRawModule(moduleFilter, options);
	if (!module) return;
	const { exports } = module;
	const key = Object.keys(exports).find(k => exportFilter(exports[k]));
	if (!key) return {};
	return { module:exports, key, target: exports[key] };
}

export function mapExports(moduleFilter, exportsMap, options) {
	const module = getRawModule(moduleFilter, options);
	if (!module) return {};
	const { exports } = module;
	const res = { module: exports, mangledKeys:{} };
	for (const [mapKey, filter] of Object.entries(exportsMap)) {
		for (const [exportKey, val] of Object.entries(exports)) {
			if (!filter(val)) continue;
			res[mapKey] = val;
			res.mangledKeys[mapKey] = exportKey;
			break;
		}
	}
	return res;
}
