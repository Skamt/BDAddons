import Dispatcher from "@Modules/Dispatcher";
import Plugin from "@common/Plugin";

const handlers = new Set();

export function on(event, fn) {
	Dispatcher.subscribe(event, fn);
	const undo = () => {
		handlers.delete(undo);
		Dispatcher.unsubscribe(event, fn);
	};
	handlers.add(undo);
	return undo;
}

export function map(map) {
	Object.entries(map).forEach(entries => on(...entries));
}

export function intercept(event, fn) {
	const interceptor = (...args) => args[0].type === event ? fn.apply(null, args) : null
	

	Dispatcher.addInterceptor(interceptor);
	const undo = () => {
		handlers.delete(undo);
		const index = Dispatcher._interceptors.indexOf(interceptor);
		Dispatcher._interceptors.splice(index, 1);
	};
	handlers.add(undo);
	return undo;
}

export function unsubscribeAll() {
	handlers?.forEach?.(Reflect.apply);
	handlers.length = 0;
}

export const blockEvent = e => intercept(e, () => true);

Plugin.onStop(unsubscribeAll);
