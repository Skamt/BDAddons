import webpackRequire from "./webpackRequire";
import { Modules } from "./Modules";

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
			const fs = require("fs");
			const path = `${process.env.USERPROFILE}\\Desktop\\${this.id}.js`;
			fs.writeFileSync(path, this.code, "utf8");

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
	const sum = [];
	const strArr = args;
	const invert = typeof args[args.length - 1] === "boolean" ? args.pop() : false;

	for (const [id, source] of Object.entries(webpackRequire.m)) {
		const sourceCode = source.toString();
		const result = strArr.every(str => sourceCode.includes(str));
		if (invert ^ result) yield new Source(id, source);
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


export const Sources = {
	getWebpackSources() {
		return webpackRequire.m;
	},
	sourceById,
	getSource,
	getSources
};