import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { Dispatcher } from "@Discord/Modules";
import Plugin, { Events } from "@Utils/Plugin";

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
		init() {
			Dispatcher.subscribe("LOGOUT", Store.state.clear);
		},
		dispose() {
			Store.state.clear();
			Dispatcher.unsubscribe("LOGOUT", Store.state.clear);
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

Plugin.on(Events.START, () => {
	Store.init();
});

Plugin.on(Events.STOP, () => {
	Store.dispose();
});