import { Webpack } from "@Api";

export const getModule = /*@__PURE__*/ (() => Webpack.getModule)();
export const Filters = /*@__PURE__*/ (() => Webpack.Filters)();
export const waitForModule = /*@__PURE__*/ (() => Webpack.waitForModule)();
export const modules = /*@__PURE__*/ (() => Webpack.modules)();
export const getBySource = /*@__PURE__*/ (() => Webpack.getBySource)();
export const getMangled = /*@__PURE__*/ (() => Webpack.getMangled)();
export const getStore = /*@__PURE__*/ (() => Webpack.getStore)();

export function reactRefMemoFilter(type, ...args){
	const filter = Filters.byStrings(...args);
	return target => target[type] && filter(target[type])
}

export function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return;
	return { module, key };
}

export function filterModuleAndExport(moduleFilter, exportFilter, options) {
	const module = getModule(moduleFilter, { ...options, raw: true });
	if (!module) return;
	const { exports } = module;
	const key = Object.keys(exports).find(k => exportFilter(exports[k]));
	if (!key) return {};
	return { module: exports, key, target: exports[key] };
}

export function mapExports(moduleFilter, exportsMap, options) {
	const module = getModule(moduleFilter, { ...options, raw: true });
	if (!module) return {};
	const { exports } = module;
	const res = { module: exports, mangledKeys: {} };
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

export function _getBySource(filter) {
	let moduleId = null;
	for (const [id, loader] of Object.entries(modules)) {
		if (filter(loader.toString())) {
			moduleId = id;
			break;
		}
	}

	return getModule((_, __, id) => id === moduleId);
}
