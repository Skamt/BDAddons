import webpackRequire from "./webpackRequire";
import { Source } from "./Types";

export const Sources = {
	_sources: webpackRequire.m,
	getSources() {
		return Sources._sources;
	},
	sourceById(id) {
		return new Source({ id, source: Sources._sources[id] });
	},
	getSourceBySourceFilter(strArr, invert = false) {
		const sum = [];
		for (const [id, source] of Object.entries(Sources._sources)) {
			const sourceCode = source.toString();
			const result = strArr.every(str => sourceCode.includes(str));
			if (invert ^ result) sum.push(new Source({ id, source }));
		}
		return sum;
	}
};
