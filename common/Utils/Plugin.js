import EventEmitter from "@Utils/EventEmitter";

export const Events = {
	START: "START",
	STOP: "STOP"
};

export default new (class extends EventEmitter {
	start() {
		this.emit(Events.START);
	}
	stop() {
		this.emit(Events.STOP);
	}
})();
