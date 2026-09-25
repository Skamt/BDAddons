import React, { NoopComponent, LazyComponent } from "@React";
import Logger from "@Utils/Logger";
import { getObjectKey } from "@Utils";
import { MISSING_ARGUMENTS, UNDEFINED_OBJECT_OR_KEY, PATCH_ERROR, LAZY_DISCORD_COMPONENT_WRAPPER } from "@common/consts";
import Plugin from "@common/Plugin";

export const Webpack = /*@__PURE__*/ (() => BdApi.Webpack)();
export const getModule = /*@__PURE__*/ (() => Webpack.getModule)();
export const Filters = /*@__PURE__*/ (() => Webpack.Filters)();
export const waitForModule = /*@__PURE__*/ (() => Webpack.waitForModule)();
export const modules = /*@__PURE__*/ (() => Webpack.modules)();
export const getBySource = /*@__PURE__*/ (() => Webpack.getBySource)();
export const getByPrototypeKeys = /*@__PURE__*/ (() => Webpack.getByPrototypeKeys)();
export const getMangled = /*@__PURE__*/ (() => Webpack.getMangled)();
export const getById = /*@__PURE__*/ (() => Webpack.getById)();
export const getStore = /*@__PURE__*/ (() => Webpack.getStore)();
export const getByKeys = /*@__PURE__*/ (() => Webpack.getByKeys)();

let abortController = /*@__PURE__*/ (() => {
	Plugin.onStart(() => (abortController = new AbortController()));
	Plugin.onStop(() => abortController.abort());
	return new AbortController();
})();

export function lazy(filter, { decFilter, ...options } = {}) {
	if (!filter) return Logger.error(`[Webpack lazy] ${MISSING_ARGUMENTS}`);

	const { promise, resolve } = Promise.withResolvers();
	waitForModule(filter, {
		...options,
		raw: true,
		fatal: false,
		signal: abortController.signal
	})
		.then(module => {
			if (!module) throw "waitForModule resolved with undefined";

			const object = decFilter ? module.declarations : module.exports;
			const key = getObjectKey(object, decFilter || filter);
			if (!object || !key) throw UNDEFINED_OBJECT_OR_KEY;

			resolve([object, key]);
		})
		.catch(cause => Logger.warn(new Error(PATCH_ERROR, { cause })));

	return promise;
}

function Suspended({ promise, fallback, ...props }) {
	const comp = React.use(promise);
	if (comp) return React.createElement(comp, props);
	DEV: Logger.error("Promise resolved with undefined");
	return fallback;
}

export function waitForComponent(filter, options, Fallback = NoopComponent) {
	const promise = waitForModule(filter, options);

	const placeHolderComponent = props => (
		<React.Suspense fallback={<Fallback />}>
			<Suspended
				{...props}
				fallback={<Fallback />}
				promise={promise}
			/>
		</React.Suspense>
	);
	placeHolderComponent.displayName = LAZY_DISCORD_COMPONENT_WRAPPER;
	return placeHolderComponent;
}

export function _waitForComponent(filter, options) {
	let myValue = () => {};

	const lazyComponent = LazyComponent(() => myValue);

	waitForModule(filter, options).then(v => {
		myValue = v;
		Object.assign(lazyComponent, v);
	});

	return lazyComponent;
}

// export async function lazy(filter, options) {
// 	const { exportsFilter, declarationsFilter, ...rest } = options;
// 	const [err, res] = await promiseHandler(waitForModule(filter, { ...rest, raw: true }));
// 	if (err || !res) return;
// 	const module = exportsFilter ? res.exports : res.declarations;
// 	if (!module) return ;
// 	const key = getObjectKey(module, exportsFilter || declarationsFilter);
// 	if (!key) return;
// 	return { module, key, target: module[key] };
// }

export function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return target => target[type] && filter(target[type]);
}

export function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return;
	return [module, key];
}

export function getDeclarationAndKey(moduleFilter, declarationFilter, options = {}) {
	const module = getModule(moduleFilter, { ...options, raw: true });
	if (!module?.declarations) return;
	const key = getObjectKey(module.declarations, declarationFilter);
	return key ? [module.declarations, key] : undefined;
}

export function filterModuleAndExport(moduleFilter, exportFilter, options) {
	const module = getModule(moduleFilter, { ...options, raw: true });
	if (!module) return;
	const { exports } = module;
	const key = Object.keys(exports).find(k => exportFilter(exports[k]));
	if (!key) return {};
	return { module: exports, key, target: exports[key] };
}

export function mapExports(moduleFilter, exportsMap, options) {
	const module = getModule(moduleFilter, { ...options, raw: true });
	if (!module) return {};
	const { exports } = module;
	const res = { module: exports, mangledKeys: {} };
	for (const [mapKey, filter] of Object.entries(exportsMap)) {
		for (const [exportKey, val] of Object.entries(exports)) {
			if (!filter(val)) continue;
			res[mapKey] = val;
			res.mangledKeys[mapKey] = exportKey;
			break;
		}
	}
	return res;
}

export function _getBySource(filter) {
	let moduleId = null;
	for (const [id, loader] of Object.entries(modules)) {
		if (filter(loader.toString())) {
			moduleId = id;
			break;
		}
	}

	return getModule((_, __, id) => id === moduleId);
}
