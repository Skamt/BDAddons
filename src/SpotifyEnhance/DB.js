import config from "@Config";
import Logger from "@Utils/Logger";
import Plugin, { Events } from "@Utils/Plugin";

const DB = new (class {
	init() {
		const { promise, resolve } = Promise.withResolvers();

		const openReq = indexedDB.open(config.info.name, 1);
		openReq.onerror = () => {
			Logger.error(openReq.result.error);
			resolve();
		};

		openReq.onsuccess = () => {
			this.db = openReq.result;
			resolve();
		};

		openReq.onupgradeneeded = () => {
			const db = openReq.result;

			db.createObjectStore("track", { keyPath: "id" });
			db.createObjectStore("playlist", { keyPath: "id" });
			db.createObjectStore("album", { keyPath: "id" });
			db.createObjectStore("artist", { keyPath: "id" });
			db.createObjectStore("user", { keyPath: "id" });
			db.createObjectStore("show", { keyPath: "id" });
			db.createObjectStore("episode", { keyPath: "id" });
		};

		return promise;
	}

	dispose() {
		this.db?.close?.();
	}

	get(storeName, key) {
		if (!storeName || !key || !this.db) return Promise.resolve();
		const { promise, resolve } = Promise.withResolvers();

		const transaction = this.db.transaction(storeName);
		const objectStore = transaction.objectStore(storeName);
		const getReq = objectStore.get(key);

		transaction.onerror = () => {
			Logger.error(getReq.error);
			resolve();
		};

		transaction.oncomplete = () => {
			resolve(getReq.result);
		};

		return promise;
	}

	set(storeName, data) {
		if (!storeName || !data || !this.db) return Promise.resolve();
		const { promise, resolve } = Promise.withResolvers();
		const transaction = this.db.transaction(storeName, "readwrite");
		const objectStore = transaction.objectStore(storeName);
		const putReq = objectStore.put(data);

		transaction.onerror = () => {
			Logger.error(putReq.error);
			resolve();
		};

		transaction.oncomplete = () => {
			resolve(putReq.result);
		};

		return promise;
	}
})();

Plugin.on(Events.START, () => {
	DB.init();
});

Plugin.on(Events.STOP, () => {
	DB.dispose();
});

export default DB;
