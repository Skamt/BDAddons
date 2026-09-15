const target = new EventTarget();

export default {
	onLoad: (...args) => target.addEventListener("load", ...args),
	onStart: (...args) => target.addEventListener("start", ...args),
	onStop: (...args) => target.addEventListener("stop", ...args),
	start() {
		target.dispatchEvent(new CustomEvent("load"));
		target.dispatchEvent(new CustomEvent("start"));
	},
	stop() {
		target.dispatchEvent(new CustomEvent("stop"));
	},
};
