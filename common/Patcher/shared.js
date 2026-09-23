import { Logger, Patcher } from "@Api";
import { hasOwn } from "@Utils";
import Plugin from "@common/Plugin";

Plugin.onStop(() => Patcher.unpatchAll());

function patchOnce(type, object, key, callback) {
	const unpatch = Patcher[type](object, key, (...args) => {
		unpatch();
		callback.apply(null, args);
	});
}

export function patch(type, object, key, callback, once) {
	if (!hasOwn(object, key))
		return Logger.error("Could not perform a patch, missing arguments", arguments);

	DEV: Logger.log("[Patch]", arguments);

	const caller = {
		after: (context, args, ret) => callback({ context, args, ret }),
		before: (context, args) => callback({ context, args }),
		instead: (context, args, fn) => callback({ context, args, fn }),
	}[type];

	return once ? patchOnce(type, object, key, caller) : Patcher[type](object, key, caller);
}
