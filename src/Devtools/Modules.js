import webpackRequire from "./webpackRequire";
import { Sources } from "./Sources";
import { Module } from "./Types";

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

export const Modules = {
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