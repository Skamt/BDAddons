import { Filters, getBySource } from "@Webpack";

export const getZustand = (() => {
	let zustand = null;

	return function getZustand() {
		if (zustand !== null) return zustand;

		const module = getBySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe");

		return (zustand = Object.values(module || {})[0]);
	};
})();


