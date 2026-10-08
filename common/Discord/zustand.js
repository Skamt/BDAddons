import { Filters, getModule, getMangled } from "@Webpack";

const zustand = /*@__PURE__*/ (() =>
	getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
		_: Filters.byStrings("subscribe"),
		zustand: () => true,
	})?.zustand)();

export default zustand;

export const subscribeWithSelector = /*@__PURE__*/ (() =>
	getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), {
		searchExports: true,
	}))();

export function create(initialState) {
	const Store = zustand(initialState);
	Object.defineProperty(Store, "state", {
		configurable: false,
		get: () => Store.getState(),
	});
	return Store;
}
