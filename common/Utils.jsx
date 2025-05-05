import { Patcher, getOwnerInstance, ReactDOM, React } from "@Api";

export function isValidString(string) {
	return string && string.length > 0;
}

export function getUserName(userObject = {}) {
	const { global_name, globalName, username } = userObject;
	if (isValidString(global_name)) return global_name;
	if (isValidString(globalName)) return globalName;
	if (isValidString(username)) return username;
	return "???";
}

export function getAcronym(string) {
	if (!isValidString(string)) return "";

	return string
		.replace(/'s /g, " ")
		.replace(/\w+/g, e => e[0])
		.replace(/\s/g, "");
}

export function concateClassNames(...args) {
	return args.filter(Boolean).join(" ");
}

export function getPathName(url) {
	try {
		return new URL(url).pathname;
	} catch {}
}

// stolen ehm.. borrowed from Material-UI
function easeInOutSin(time) {
	return (1 + Math.sin(Math.PI * time - Math.PI / 2)) / 2;
}
// stolen ehm.. borrowed from Material-UI
export function animate(property, element, to, options = {}, cb = () => {}) {
	const {
		ease = easeInOutSin,
		duration = 300 // standard
	} = options;

	let start = null;
	const from = element[property];
	let cancelled = false;

	const cancel = () => {
		cancelled = true;
	};

	const step = timestamp => {
		if (cancelled) {
			cb(new Error("Animation cancelled"));
			return;
		}

		if (start === null) {
			start = timestamp;
		}
		const time = Math.min(1, (timestamp - start) / duration);

		element[property] = ease(time) * (to - from) + from;

		if (time >= 1) {
			requestAnimationFrame(() => {
				cb(null);
			});
			return;
		}

		requestAnimationFrame(step);
	};

	if (from === to) {
		cb(new Error("Element already at target position"));
		return cancel;
	}

	requestAnimationFrame(step);
	return cancel;
}

// stolen ehm.. borrowed from Material-UI
export function debounce(func, wait = 166) {
	let timeout;
	function debounced(...args) {
		const later = () => {
			// @ts-ignore
			func.apply(this, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	}
	debounced.clear = () => {
		clearTimeout(timeout);
	};
	return debounced;
}

export function shallow(objA, objB) {
	if (Object.is(objA, objB)) return true;

	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;

	var keysA = Object.keys(objA);

	if (keysA.length !== Object.keys(objB).length) return false;

	for (var i = 0; i < keysA.length; i++) if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;

	return true;
}

export const promiseHandler = promise => promise.then(data => [undefined, data]).catch(err => [err]);

export function copy(data) {
	DiscordNative.clipboard.copy(data);
}

export function getNestedProp(obj, path) {
	return path.split(".").reduce((ob, prop) => ob?.[prop], obj);
}

export class BrokenAddon {
	stop() {}
	start() {
		BdApi.alert(config.info.name, "Plugin is broken, Notify the dev.");
	}
}

export class Disposable {
	constructor() {
		this.patches = [];
	}

	Dispose() {
		this.patches?.forEach(p => p?.());
		this.patches = [];
	}
}

export function reRender(selector) {
	const target = document.querySelector(selector)?.parentElement;
	if (!target) return;
	const instance = getOwnerInstance(target);
	const unpatch = Patcher.instead(instance, "render", () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}

export const nop = () => {};

export function sleep(delay) {
	return new Promise(done => setTimeout(() => done(), delay * 1000));
}

export function prettyfiyBytes(bytes, si = false, dp = 1) {
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return `${bytes} B`;
	}

	const units = si ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	let u = -1;
	const r = 10 ** dp;

	do {
		bytes /= thresh;
		++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

	return `${bytes.toFixed(dp)} ${units[u]}`;
}

export function parseSnowflake(snowflake) {
	return snowflake / 4194304 + 1420070400000;
}

export function isSnowflake(id) {
	try {
		return BigInt(id).toString() === id;
	} catch {
		return false;
	}
}

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

export function getImageDimensions(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () =>
			resolve({
				width: img.width,
				height: img.height
			});
		img.onerror = reject;
		img.src = url;
	});
}

export function hook(hook, ...args) {
	let v;
	const b = document.createElement("div");
	ReactDOM.render(
		React.createElement(() => ((v = hook(...args)), null)),
		b
	);
	ReactDOM.unmountComponentAtNode(b);
	return v;
}
