import webpackRequire from "./webpackRequire";
import { Source } from "./Types";

const Sources = {
	_sources: webpackRequire.m,
	getSources() {
		return Sources._sources;
	},
	sourceById(id) {
		return new Source({ id, source: Sources._sources[id] });
	},
	getSourceByExportFilter(filter, options = {}) {
		const result = Modules.unsafe_getModule(filter, options)?.id;
		if (!result) return undefined;
		return Array.isArray(result) ? result.map(Sources.sourceById) : Sources.sourceById(result);
	},
	getSourceBySourceFilter(strArr, first = true) {
		const sum = [];
		for (const [id, source] of Object.entries(Sources._sources)) {
			const sourceCode = source.toString();
			const result = strArr.every(str => sourceCode.includes(str));
			if (result) {
				if (first) return new Source({ id, source });
				else sum.push(new Source({ id, source }));
			}
		}
		return sum;
	}
};

export default Sources;
