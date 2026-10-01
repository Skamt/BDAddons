import webpackRequire from "./webpackRequire";
import { Modules } from "./Modules";
import { saveFile } from "@Utils/fs";

class Source {
	constructor(id, loader) {
		this.id = id;
		this.loader = loader;
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
	const strArr = args;
	for (const [id, source] of Object.entries(webpackRequire.m)) {
		const sourceCode = source.toString().replace(/^\d+/, "function");
		const result = strArr.every(str => sourceCode.includes(str));
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
