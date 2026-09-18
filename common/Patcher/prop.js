import Plugin from "@common/Plugin";
import { add } from "@Utils/Array";

const cache = new Map();

export default /*@__PURE__*/ (() => {
	let propertyDescriptor;
	let unpatches = [];
	Plugin.onStop(() => {
		unpatches.filter(Boolean).forEach((a) => a())
		unpatches = [];
	});

	// biome-ignore lint/complexity/useArrowFunction: <explanation>
	return function (object, key, value) {
		if (!object || !key || !(key in object))
			return Logger.error("Could not perform a patch, missing arguments", arguments);

		const cacheEntry = cache.get(object) || new Set();
		if (cacheEntry.has(key)) return Logger.error("already patched", arguments);

		propertyDescriptor = Object.getOwnPropertyDescriptor(object, key);
		if (!propertyDescriptor.configurable)
			return Logger.error("Property not configurable", arguments);

		Object.defineProperty(object, key, {
			enumerable: propertyDescriptor.enumerable,
			configurable: true,
			get: () => (typeof value === "function" ? value() : value),
		});

		cacheEntry.add(key);
		cache.set(object, cacheEntry);

		unpatches.push(() => {
			Object.defineProperty(object, key, propertyDescriptor);
			propertyDescriptor = null;
			cacheEntry.delete(key);
			if (!cacheEntry.length) cache.delete(object);
		});
	};
})();
