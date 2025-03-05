import webpackRequire from "./webpackRequire";
import { Sources } from "./Sources";

const defineModuleGetter = (obj, id) =>
	Object.defineProperty(obj, id, {
		enumerable: true,
		get() {
			return Modules.moduleById(id);
		}
	});

class Module {
	constructor(id, module) {
		module = module || webpackRequire(id);
		this.id = id;
		this.rawModule = module;
		this.exports = module.exports;
		const source = Sources.sourceById(id);
		this.loader = source.loader;
	}

	get code() {
		return this.loader.toString();
	}

	get imports() {
		return Modules.modulesImportedInModuleById(this.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}

	get modulesUsingThisModule() {
		return Modules.modulesImportingModuleById(this.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}

	get saveSourceToDesktop() {
		try {
			const fs = require("fs");
			const path = `${process.env.USERPROFILE}\\Desktop\\${this.id}.js`;
			fs.writeFileSync(path, this.code, "utf8");

			return `Saved to: ${path}`;
		} catch (e) {
			return e;
		}
	}
	get saveAllToDesktop() {
		try {
			const fs = require("fs");
			const path = `${process.env.USERPROFILE}\\Desktop\\${this.id}`;
			if (!fs.existsSync(path)) fs.mkdirSync(path);
			fs.writeFileSync(`${path}\\__MAIN-${this.id}.js`, this.code, "utf8");
			fs.mkdirSync(`${path}\\modulesUsingThisModule`);
			fs.mkdirSync(`${path}\\imports`);
			{
				const modules = Object.entries(this.modulesUsingThisModule);
				for (let i = modules.length - 1; i >= 0; i--) {
					const [id, module] = modules[i];
					const code = module.code;
					fs.writeFileSync(`${path}\\modulesUsingThisModule\\${id}.js`, code, "utf8");
				}
			}

			{
				const modules = Object.entries(this.imports);
				for (let i = modules.length - 1; i >= 0; i--) {
					const [id, module] = modules[i];
					const code = module.code;
					fs.writeFileSync(`${path}\\imports\\${id}.js`, code, "utf8");
				}
			}
			return `Saved to: ${path}`;
		} catch (e) {
			return e;
		}
	}
}

function getWebpackModules() {
	return webpackRequire.c;
}

function moduleById(id) {
	return new Module(id, webpackRequire.c[id]);
}

function modulesImportedInModuleById(id) {
	const { code } = Sources.sourceById(id);
	const args = code.match(/\((.+?)\)/i)?.[1];
	if (args?.length > 5 || !args) return [];

	const req = args.split(",")[2];
	const re = new RegExp(`(?:\\s|\\(|,|=)${req}\\("?(\\d+)"?\\)`, "g");
	const imports = Array.from(code.matchAll(re));

	return imports.map(id => id[1]);
}

function modulesImportingModuleById(id) {
	return Object.keys(Sources.getWebpackSources()).filter(sourceId => modulesImportedInModuleById(sourceId).includes(`${id}`));
}

function noExports(filter, module, exports) {
	if (filter(exports, module, module.id)) return new Module(module.id, module);
}

function doExports(filter, module, exports) {
	if (typeof exports !== "object" && typeof exports !== "function") return;
	for (const entryKey in exports) {
		let target = null;
		try {
			target = exports[entryKey];
		} catch {
			continue;
		}
		if (sanitizeExports(target)) continue;
		if (filter(target, module, module.id)) return { target, entryKey, module: new Module(module.id, module) };
	}
}

function sanitizeExports(exports) {
    if (!exports) return true;
    if (exports === Symbol) return true;
    if (exports.TypedArray) return true;
    if (exports === window) return true;
    if (exports instanceof Window) return true;
    if (exports === document.documentElement) return true;
    if (exports[Symbol.toStringTag] === "DOMTokenList") return true;
	return false;
}


function* moduleLookup(filter, options = {}) {
	const {searchExports = false} = options;
	const gauntlet = searchExports ? doExports : noExports;

	const keys = Object.keys(webpackRequire.c);
	for (let index = keys.length - 1; index >= 0; index--) {
		const module = webpackRequire.c[keys[index]];
		const { exports } = module;
		if (sanitizeExports(exports)) continue;

		const match = gauntlet(filter, module, exports);
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
