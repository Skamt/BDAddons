const isObject = item => item && typeof item === "object" && !Array.isArray(item);

function mergeDeep(target, ...sources) {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key])
					Object.assign(target, {
						[key]: {}
					});
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, {
					[key]: source[key]
				});
			}
		}
	}
	return mergeDeep(target, ...sources);
}

const promiseHandler = promise => promise.then(data => [undefined, data]).catch(err => [err]);

function parseJSON(str) {
	try {
		return JSON.parse(str);
	} catch {
		return {};
	}
}

module.exports.parseJSON = parseJSON;
module.exports.promiseHandler = promiseHandler;
module.exports.mergeDeep = mergeDeep;
