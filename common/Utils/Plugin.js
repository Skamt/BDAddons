import EventEmitter from "@Utils/EventEmitter";

export const Events = {
	START: "START",
	STOP: "STOP",
};

export default new (class extends EventEmitter {
	stopped = true;
	start() {
		this.emit(Events.START);
		this.stopped = false;
	}
	stop() {
		this.emit(Events.STOP);
		this.stopped = true;
	}
})();
