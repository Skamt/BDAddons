export default class {
	constructor() {
		this.listeners = {};
	}

	isInValid(event, handler) {
		return typeof event !== "string" || typeof handler !== "function";
	}

	on(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = new Set();
		this.listeners[event].add(handler);
		return () => this.off(event, handler);
	}

	off(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) return;
		this.listeners[event].delete(handler);

		if (this.listeners[event].size !== 0) return;
		delete this.listeners[event];
	}

	emit(event, payload) {
		if (!this.listeners[event]) return;

		for (const listener of this.listeners[event]) {
			try {
				listener(payload);
			} catch (err) {
				console.error(`Could not run listener for ${event}`, err);
			}
		}
	}
}
