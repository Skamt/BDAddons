import React from "@React";

export const createStore = createState => {
	let state;
	const listeners = new Set();
	const setState = partial => {
		const nextState = typeof partial === "function" ? partial(state) : partial;
		if (!Object.is(nextState, state)) {
			const previousState = state;
			state = Object.assign({}, state, nextState);
			listeners.forEach(listener => listener(state, previousState));
		}
	};
	const getState = () => state;
	const getInitialState = () => initialState;
	const subscribe = (listener, selector, equalityFn = Object.is) => {
		const listen = (curr, prev) => (!selector || !equalityFn(selector(prev), selector(curr))) && listener(curr, prev);
		listeners.add(listen);
		return () => listeners.delete(listen);
	};
	const api = {
		setState,
		getState,
		getInitialState,
		subscribe,
		get state() {
			return state;
		}
	};
	const initialState = (state = createState(setState, getState, api));
	return api;
};

export const create = createState => {
	const api = createStore(createState);

	return Object.defineProperties(
		selector =>
			React.useSyncExternalStore(
				api.subscribe,
				React.useCallback(() => selector(api.getState()), [selector])
			),
		Object.getOwnPropertyDescriptors(api)
	);
};
