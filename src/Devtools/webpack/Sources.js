import webpackRequire from "./webpackRequire";
import { Modules } from "./Modules";
import { saveFile } from "@Utils/fs";

class Source {
	constructor(id, loader) {
		this.id = id;
		this.loader = loader.__early_patched__ ? loader.__raw_module__() : loader;;
	}

	get module() {
		return Modules.moduleById(this.id);
	}

	get code() {
		return this.loader.toString();
	}

	get saveSourceToDesktop() {
		try {
			const path = `${process.env.USERPROFILE}\\Desktop\\${this.id}.js`;
			saveFile(path, this.code);

			return `Saved to: ${path}`;
		} catch (e) {
			return e;
		}
	}
}

function sourceById(id) {
	return new Source(id, webpackRequire.m[id]);
}

function* sourceLookup(...args) {
	const filters = args.map(arg=>{
		if(arg instanceof RegExp)
			return str => str.match(arg) !== null
		if(typeof arg === "string")
			return str => str.includes(arg)	
		return ()=>false;
	});
	for (const [id, source] of Object.entries(webpackRequire.m)) {
		const sourceCode = source.toString().replace(/^\d+/, "function");
		const result = filters.every(filter => filter(sourceCode));
		if (!result) continue;
		yield new Source(id, source);
	}
}

function getSources(...args) {
	return [...sourceLookup(...args)];
}

function getSource(...args) {
	const b = sourceLookup(...args);
	const res = b.next().value;
	b.return();
	return res;
}

function getSourceByFunc(func) {
	return getSources(String(func));
}

export const Sources = {
	getWebpackSources: () => webpackRequire.m,
	sourceById,
	getSource,
	getSources,
	getSourceByFunc
};
