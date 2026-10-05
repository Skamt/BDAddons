import React, { NoopComponent, LazyComponent } from "@React";
import Logger from "@Utils/Logger";
import { getObjectKey } from "@Utils/Object";
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

export function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return target => target[type] && filter(target[type]);
}

export function findKey(obj, filter) {
	const key = getObjectKey(obj, filter);
	return key ? [obj, key] : [];
}

export function getModuleAndKey(filter, options) {
	const { exports } = getModule(filter, { ...options, raw: true }) || {};
	return findKey(exports, filter);
}

export function getDeclarationAndKey(moduleFilter, declarationFilter, options = {}) {
	const module = getModule(moduleFilter, { ...options, raw: true });
	return findKey(module.declarations, declarationFilter);
}

export function filterModuleAndExport(moduleFilter, exportFilter, options) {
	const module = getModule(moduleFilter, { ...options, raw: true });
	if (!module) return;
	const { exports } = module;
	const key = Object.keys(exports).find(k => exportFilter(exports[k]));
	if (!key) return {};
	return { module: exports, key, target: exports[key] };
}
