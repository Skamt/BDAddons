import React, { ReactDOM } from "@React";
import config from "@Config";

export function showNotification(title, content, options) {
	BdApi.UI.showNotification({
		id: `${config.info.name}-${Math.random().toString(36).slice(2)}`,
		title: title ? `[${config.info.name}] ${title}` : config.info.name,
		content: content,
		duration: Number.POSITIVE_INFINITY,
		...options
	});
}

export const showToast = (type, content, opts) => BdApi.UI.showToast(`[${config.info.name}] ${content}`, { timeout: 5000, ...opts, type });

export const openLink = link => link && window.open(link, "_blank");

export function fit({ width, height, gap = 0.8 }) {
	const ratio = Math.min(innerWidth / width, innerHeight / height);
	width = Math.round(width * ratio);
	height = Math.round(height * ratio);
	return {
		width,
		height,
		maxHeight: height * gap,
		maxWidth: width * gap
	};
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

export function debounce(func, wait = 0) {
	let timeout;
	function debounced(...args) {
		const later = () => {
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

	const keysA = Object.keys(objA);

	if (keysA.length !== Object.keys(objB).length) return false;

	for (let i = 0; i < keysA.length; i++) if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;

	return true;
}

export function copy(data) {
	DiscordNative.clipboard.copy(data);
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

export const nop = () => {};

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

export function hook(hook, ...args) {
	let v;
	const b = document.createElement("div");
	const root = ReactDOM.createRoot(b);
	root.render(React.createElement(() => ((v = hook(...args)), null)));
	root.unmount(b);
	return v;
}

export function exceptionWrapper(fn, exp, fin) {
	return () => {
		try {
			fn?.();
		} catch (e) {
			exp?.(e);
		} finally {
			fin?.();
		}
	};
}

export function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function preventDefault(handler = nop) {
	return e => {
		e.preventDefault();
		e.stopPropagation();
		handler.apply(null, [e]);
	};
}

export const argsToKey = (...args) => args.map(o => JSON.stringify(o)).join("");

export function memoize(func) {
	const cache = new Map();
	return (...args) => {
		const key = argsToKey(...args);
		if (!cache.has(key)) cache.set(key, func(...args));
		return cache.get(key);
	};
}


