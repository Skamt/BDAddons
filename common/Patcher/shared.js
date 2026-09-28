import { Logger, Patcher } from "@Api";
import { hasOwn } from "@Utils";
import Plugin from "@common/Plugin";

Plugin.onStop(() => Patcher.unpatchAll());

export function patch(type, object, key, callback) {
	if (!hasOwn(object, key))
		return Logger.error("Could not perform a patch, missing arguments", arguments);

	DEV: Logger.warn("[Patch]", arguments);

	const caller = {
		after: (context, args, ret) => callback({ context, args, ret }),
		before: (context, args) => callback({ context, args }),
		instead: (context, args, fn) => callback({ context, args, fn }),
	}[type];

	return Patcher[type](object, key, caller);
}
