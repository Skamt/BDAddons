import { modules, Filters, getModule } from "@Api";

export const getZustand = (() => {
	let zustand = null;

	return function getZustand() {
		if (zustand !== null) return zustand;

		const filter = Filters.byStrings("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe");
		let moduleId = null;
		for (const [id, loader] of Object.entries(modules)) {
			if (filter(loader.toString())) {
				moduleId = id;
				break;
			}
		}

		return (zustand = Object.values(getModule((_, __, id) => id === moduleId) || {})[0]);
	};
})();


