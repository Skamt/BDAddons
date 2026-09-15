import { waitForModule } from "@Webpack";
import Plugin from "@common/Plugin";
import { Logger, Patcher } from "@Api";
import { promiseHandler, nop, getObjectKey } from "@Utils";
import config from "@Config";
import Settings from "@Utils/Settings";

export default Patcher;

Plugin.onStop(() => Patcher.unpatchAll());

function isValid(object, key, cb) {
	if (object && key && key in object) return true;
	Logger.error("Could not perform patch, undefined module or key", arguments);
	return false;
}

let abortController = /*@__PURE__*/ (() => {
	Plugin.onStart(() => {
		abortController = new AbortController();
	});
	Plugin.onStop(() => abortController.abort());
	return new AbortController();
})();

// function patch(type, object, key, fn) {
// 	if (!isValid(object, key, fn.name)) return;
// 	DEV: Logger.log("[Patch]", fn.name, key, object);
// 	return Patcher[type](object, key, (context, args, $) => fn({ context, args, $ }));
// }

function patch(type, object, key, callback) {
	if (!isValid(object, key, callback)) return;
	DEV: Logger.log("[Patch]", arguments);

	const caller = {
		after: (context, args, ret) => callback({ context, args, ret }),
		before: (context, args) => callback({ context, args }),
		instead: (context, args, fn) => callback({ context, args, fn }),
	}[type];

	return Patcher[type](object, key, caller);
}

export async function lazy(type, callback, { sourceFilter, exportsFilter, decFilter, ...rest }) {
	if (!callback || !type || !sourceFilter || !(exportsFilter || decFilter))
		return Logger.error(`lazyPatch has missing Arguments`, arguments);

	const promisedModule = waitForModule(sourceFilter, {
		...rest,
		raw: true,
		signal: abortController.signal,
	});

	const [err, res] = await promiseHandler(promisedModule);
	if (err || !res) return Logger.error("lazyPatch resolved with undefined", callback);

	const object = exportsFilter ? res.exports : res.declarations;
	const key = getObjectKey(object, exportsFilter || decFilter);

	patch(type, object, key, callback);
}

export const lazyAfter = (opts, callback) => lazy("after", callback, opts);
export const lazyBefore = (opts, callback) => lazy("before", callback, opts);
export const lazyInstead = (opts, callback) => lazy("instead", callback, opts);

export const after = (object, key, callback) => patch("after", object, key, callback);
export const before = (object, key, callback) => patch("before", object, key, callback);
export const instead = (object, key, callback) => patch("instead", object, key, callback);

const getSettingsPatcher = /*@__PURE__*/ (type) => {
	let unpatch = nop;
	return (object, key, callback, settingsKey) => {
		function _patch() {
			if (!Settings.state[settingsKey]) unpatch();
			else unpatch = patch(type, object, key, callback);
		}

		_patch();
		const unsub = Settings.subscribe(Settings.selectors[settingsKey], _patch);
		Plugin.once(Events.STOP, unsub);
	};
};
export const afterWithSettings = /*@__PURE__*/ getSettingsPatcher("after");
export const beforeWithSettings = /*@__PURE__*/ getSettingsPatcher("before");
export const insteadWithSettings = /*@__PURE__*/ getSettingsPatcher("instead");
