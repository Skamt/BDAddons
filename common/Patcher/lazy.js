import { Logger } from "@Api";
import { patch } from "./shared";
import { promiseHandler, getObjectKey } from "@Utils";
import { waitForModule } from "@Webpack";
import Plugin from "@common/Plugin";

let abortController = /*@__PURE__*/ (() => {
	Plugin.onStart(() => (abortController = new AbortController()));
	Plugin.onStop(() => abortController.abort());
	return new AbortController();
})();

async function lazy(type, callback, { once, sourceFilter, exportsFilter, decFilter, ...rest } = {}) {
	if (!callback || !type || !sourceFilter || !(exportsFilter || decFilter)) {
		return Logger.error("lazyPatch has missing Arguments", arguments);
	}

	const promisedModule = waitForModule(sourceFilter, {
		...rest,
		raw: true,
		signal: abortController.signal
	});

	const [err, res] = await promiseHandler(promisedModule);
	if (err || !res) {
		DEV: Logger.error("lazyPatch resolved with undefined", arguments);
		return;
	}

	const object = exportsFilter ? res.exports : res.declarations;
	const key = getObjectKey(object, exportsFilter || decFilter);

	patch(type, object, key, callback, once);
}

export const after = (opts, callback) => lazy("after", callback, opts);
export const before = (opts, callback) => lazy("before", callback, opts);
export const instead = (opts, callback) => lazy("instead", callback, opts);
