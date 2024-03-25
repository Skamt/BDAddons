import webpackRequire from "./webpackRequire";
import { Source } from "./Types";

function getWebpackSources() {
	return webpackRequire.m;
}

function sourceById(id) {
	return new Source({ id, source: webpackRequire.m[id] });
}

function getSourceBySourceFilter(...args) {
	const sum = [];
	const strArr = args;
	const invert = typeof args[args.length - 1] === "boolean" ? args.pop() : false;

	for (const [id, source] of Object.entries(getWebpackSources())) {
		const sourceCode = source.toString();
		const result = strArr.every(str => sourceCode.includes(str));
		if (invert ^ result) sum.push(new Source({ id, source }));
	}
	return sum;
}

export const Sources = { sourceById, getWebpackSources, getSourceBySourceFilter };