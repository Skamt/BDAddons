export default class Timer {
	static INTERVAL = "INTERVAL";
	static TIMEOUT = "TIMEOUT";

	constructor(fn, delay, type) {
		this.type = type;
		this.delay = delay;
		this.fn = fn;
		this.running = false;

		if (type === Timer.INTERVAL) {
			this.counter = setInterval;
			this.clear = clearInterval;
		} else if (type === Timer.TIMEOUT) {
			this.counter = setTimeout;
			this.clear = clearTimeout;
		}
	}

	start() {
		if (this.running) return;
		this.running = true;
		this.timerId = this.counter.call(window,() => {
			if (this.type === "TIMEOUT") this.running = false;

			try {
				this.fn.apply(null);
			} catch {}
		}, this.delay);
	}

	stop() {
		if (!this.running) return;
		this.clear.call(window,this.timerId);
		this.running = false;
	}
}
