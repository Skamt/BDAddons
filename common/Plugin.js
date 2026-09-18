import Logger from "@Utils/Logger";

const target = new EventTarget();

function wrap(handler) {
	return (e) => {
		try {
			handler.apply(null, e);
		} catch (err) {
			Logger.error(`Could not run [${e.type}] handler`, { handler }, "\n", err);
		}
	};
}

export default {
	onLoad: (handler, props) => target.addEventListener("LOAD", wrap(handler), props),
	onStart: (handler, props) => target.addEventListener("START", wrap(handler), props),
	onStop: (handler, props) => target.addEventListener("STOP", wrap(handler), props),
	start() {
		target.dispatchEvent(new Event("LOAD"));
		target.dispatchEvent(new Event("START"));
	},
	stop() {
		target.dispatchEvent(new Event("STOP"));
	},
};
