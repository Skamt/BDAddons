export function genUrlParamsFromArray(params) {
	if (typeof params !== "object") throw new Error("params argument must be an object or array");
	if (typeof params === "object" && !Array.isArray(params)) {
		params = Object.entries(params);
	}
	return params.map(([key, val]) => `${key}=${val}`).join("&");
}

export function buildUrl(endpoint, path, params) {
	const uri = endpoint + path;
	if (params) {
		params = genUrlParamsFromArray(params);
		return `${uri}?${params}`;
	}
	return uri;
}

export const getPathName = url => {
	try {
		return new URL(url).pathname;
	} catch {}
};