import webpackRequire from "./webpackRequire";
import { Module } from "./Types";

const exportsExceptions = [exports => !exports, exports => exports && typeof exports === "boolean", exports => exports && exports === window, exports => exports && exports.TypedArray, exports => exports && exports === document.documentElement, exports => exports && exports[Symbol.toStringTag] === "DOMTokenList"];

function firstAndExports(filter) {
	const modules = Object.values(Modules.getModules());
	let moduleIndex = modules.length;
	while (moduleIndex--) {
		const module = modules[moduleIndex];
		const { exports } = module;
		if (exportsExceptions.some(exception => exception(exports))) continue;
		for (const entryKey in exports) {
			const target = exports[entryKey];
			if (exportsExceptions.some(exception => exception(target))) continue;
			if (filter(target, module, moduleIndex)) {
				return { target, entryKey, module: new Module(module) };
			}
		}
	}
}

function allAndExports(filter) {
	const modules = Object.values(Modules.getModules());
	let moduleIndex = modules.length;
	let results = [];
	while (moduleIndex--) {
		const module = modules[moduleIndex];
		const { exports } = module;
		if (exportsExceptions.some(exception => exception(exports))) continue;
		for (const entryKey in exports) {
			const target = exports[entryKey];
			if (exportsExceptions.some(exception => exception(target))) continue;
			if (filter(target, module, moduleIndex)) {
				results.push({ target, entryKey, module: new Module(module) });
			}
		}
	}
	return results;
}

function firstAndNoExports(filter) {
	const modules = Object.values(Modules.getModules());
	let index = modules.length;
	while (index--) {
		const module = modules[index];
		const { exports } = module;
		if (exportsExceptions.some(exception => exception(exports))) continue;
		if (filter(exports)) return new Module(module);
	}
}

function allAndNoExports(filter) {
	const modules = Object.values(Modules.getModules());
	let index = modules.length;
	let results = [];
	while (index--) {
		const module = modules[index];
		const { exports } = module;
		if (exportsExceptions.some(exception => exception(exports))) continue;
		if (filter(exports)) results.push(new Module(module));
	}
	return results;
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
		const { first = true, searchExports = false } = options;
		if (first && searchExports) return firstAndExports(filter);
		if (!first && searchExports) return allAndExports(filter);
		if (first && !searchExports) return firstAndNoExports(filter);
		if (!first && !searchExports) return allAndNoExports(filter);
	}
};

export default Modules;
