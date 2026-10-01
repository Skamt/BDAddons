import webpackRequire from "./webpackRequire";

class Dec {
	constructor(mod, dec, key){
		this.mod = mod;
		this.id = mod.id;
		this.dec = dec;
		this.key = key;
		this.decs = mod.declarations;
	}
}

function* decLookup(decFilter, ...args) {
	const strArr = args;

	for (const [id, source] of Object.entries(webpackRequire.m)) {
		const sourceCode = source.toString().replace(/^\d+/, "function");
		const result = strArr.every(str => sourceCode.includes(str));
		if (!result) continue;
		const mod = webpackRequire.c[id];
		if(!mod || !mod.declarations) continue;
		const keys = Object.keys(mod.declarations);

		for (let i = keys.length - 1; i >= 0; i--) {
			const dec = mod.declarations[keys[i]];
			if (decFilter(dec)) yield new Dec(mod, dec, keys[i]);
		}
	}
}

function getDecs(...args) {
	return [...decLookup(...args)];
}

function getDec(...args) {
	const b = decLookup(...args);
	const res = b.next().value;
	b.return();
	return res;
}

export const Decs = {
	getDec,
	getDecs
};
