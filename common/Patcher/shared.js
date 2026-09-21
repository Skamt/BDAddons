import { Logger, Patcher } from "@Api";
import Plugin from "@common/Plugin";

export function isValid(object, key) {
	return object && key && key in object;
}

function once(type, object, key, callback) {
	const unpatch = Patcher[type](object, key, (...args) => {
		unpatch();
		callback.apply(null, args);
	});
}

export const patch = /*@__PURE__*/ (() => {
	Plugin.onStop(() => Patcher.unpatchAll());

	return function patch(type, object, key, callback, once) {
		if (!isValid(object, key)) return Logger.error("Could not perform a patch, missing arguments", arguments);

		DEV: Logger.log("[Patch]", arguments);
		
		const caller = {
			after: (context, args, ret) => callback({ context, args, ret }),
			before: (context, args) => callback({ context, args }),
			instead: (context, args, fn) => callback({ context, args, fn })
		}[type];

		return once ? once(type, object, key, caller) : Patcher[type](object, key, caller);
	};
})();
