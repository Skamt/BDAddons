import zustand, { subscribeWithSelector } from "@Discord/zustand";

export const Store = Object.assign(
	zustand(
		subscribeWithSelector((set, get) => {
			return {
				focused: null,
				windows: [],
				clear() {
					set({ windows: [], focused: null });
				},
				setFocused(id) {
					set({ focused: id });
				},
				getFocused() {
					return get().focused;
				},
				add(w) {
					const state = get();
					set({ windows: [...state.windows, w], focused: w.id });
				},
				remove(id) {
					const state = get();
					const index = state.windows.findIndex(a => a.id === id);
					set({ windows: state.windows.toSpliced(index, 1) });
				},
				get(id) {
					const state = get();
					return state.windows.find(a => a.id === id);
				}
			};
		})
	),
	{
		init() {},
		dispose() {
			Store.state.clear();
		},
		selectors: {
			windows: state => state.windows
		}
	}
);

Object.defineProperty(Store, "state", {
	// writable: false,
	configurable: false,
	get: () => Store.getState()
});
