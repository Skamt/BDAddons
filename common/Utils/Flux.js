import Dispatcher from "@Modules/Dispatcher";

export default new (class {
	init(map) {
		this.setupHandlers(map);
	}

	dispose() {
		this.handlers?.forEach?.((h) => h());
		this.handlers = null;
	}

	setupHandlers(map) {
		this.handlers = Object.entries(map).reduce((acc, item) => {
			Dispatcher.subscribe(item[0], item[1]);
			acc.push(() => Dispatcher.unsubscribe(item[0], item[1]));
			return acc;
		}, []);
	}
})();
