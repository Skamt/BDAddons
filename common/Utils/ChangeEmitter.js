export default class {
	constructor() {
		this.listeners = new Set();
	}

	isInValid(handler) {
		return !handler || typeof handler !== "function";
	}

	on(handler) {
		if (this.isInValid(handler)) return;
		this.listeners.add(handler);
		return () => this.off(handler);
	}

	off(handler) {
		if (this.isInValid(handler)) return;
		this.listeners.delete(handler);
	}

	emit(...payload) {
		for (const listener of this.listeners) {
			try {
				listener.apply(null, payload);
			} catch (err) {
				console.error(`Could not run listener`, err);
			}
		}
	}
}
