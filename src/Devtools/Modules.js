import webpackRequire from "./webpackRequire";
import { Sources } from "./Sources";
import { Module } from "./Types";

function getWebpackModules() {
	return webpackRequire.c;
}

function moduleById(id) {
	return new Module(webpackRequire.c[id]);
}

function modulesImportedInModuleById(id) {
	const rawSource = Sources.sourceById(id).string;
	const args = rawSource.match(/\((.+?)\)/i)?.[1];
	if (args?.length > 5 || !args) return [];

	const req = args.split(",")[2];
	const re = new RegExp(`(?:\\s|\\(|,|=)${req}\\("?(\\d+)"?\\)`, "g");
	const imports = Array.from(rawSource.matchAll(re));

	return imports.map(id => id[1]);
}

function modulesImportingModuleById(id) {
	return Object.keys(Sources.getWebpackSources()).filter(sourceId => modulesImportedInModuleById(sourceId).includes(`${id}`));
}

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

function* moduleLookup(filter, options = {}) {
	const { searchExports = false } = options;
	const gauntlet = searchExports ? doExports : noExports;

	const modules = Object.values(getWebpackModules());
	for (let index = modules.length - 1; index >= 0; index--) {
		const module = modules[index];
		const { exports } = module;
		if (sanitizeExports(exports)) continue;
		const match = gauntlet(filter, module, exports, index);
		if (match) yield match;
	}
}

function getModules(filter, options) {
	return [...moduleLookup(filter, options)];
}

function getModule(filter, options) {
	const b = moduleLookup(filter, options);
	const res = b.next().value;
	b.return();
	return res;
}

export const Modules = {
	moduleById,
	moduleLookup,
	getWebpackModules,
	modulesImportedInModuleById,
	modulesImportingModuleById,
	getModules,
	getModule
};