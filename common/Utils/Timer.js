export default class Timer {
	constructor(fn, delay) {
		this.delay = delay;
		this.fn = fn;
		this.running = false;
	}

	start() {
		if (this.running) return;
		this.running = true;
		this.timerId = setTimeout(() => {
			this.stop()
			try {
				this.fn.apply(null);
			} catch {}
		}, this.delay);
	}

	stop() {
		if (!this.running) return;
		clearTimeout(this.timerId);
		this.running = false;
	}
}