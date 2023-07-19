const ControlKeys = {
	init() {
		this.subs = [
			["keydown", this.keydownHandler],
			["keyup", this.keyupHandler]
		].map(([event, handler]) => {
			const boundHandler = handler.bind(this);
			document.addEventListener(event, boundHandler);
			return () => document.removeEventListener(event, boundHandler);
		});
		this.ctrlKey = false;
		this.shiftKey = false;
		this.metaKey = false;
	},
	clean() {
		this.subs.forEach(unsub => unsub && typeof unsub === "function" && unsub());
	},
	keydownHandler(e) {
		this.ctrlKey = e.ctrlKey;
		this.shiftKey = e.shiftKey;
		this.metaKey = e.metaKey;
	},
	keyupHandler(e) {
		this.ctrlKey = e.ctrlKey;
		this.shiftKey = e.shiftKey;
		this.metaKey = e.metaKey;
	}
};

export default ControlKeys;