/**
 * @name SpotifyEnhance
 * @description All in one better spotify-discord experience.
 * @version 1.1.2
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/SpotifyEnhance
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/SpotifyEnhance/SpotifyEnhance.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "SpotifyEnhance",
		"version": "1.1.2",
		"description": "All in one better spotify-discord experience.",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/SpotifyEnhance/SpotifyEnhance.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/SpotifyEnhance",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"spotifyEmbed": "REPLACE",
		"spotifyPlayerPlace": "USERAREA",
		"activityIndicator": true,
		"enableListenAlong": true,
		"playerBannerBackground": true,
		"embedBannerBackground": true,
		"playerCompactMode": true,
		"activity": true,
		"player": true,
		"Share": true,
		"Shuffle": true,
		"Previous": true,
		"Play": true,
		"Next": true,
		"Repeat": true,
		"Volume": true
	}
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var UI = /* @__PURE__ */ (() => Api.UI)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var Data = /* @__PURE__ */ (() => Api.Data)();
var React = /* @__PURE__ */ (() => Api.React)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var Webpack = /* @__PURE__ */ (() => Api.Webpack)();
var findInTree = /* @__PURE__ */ (() => Api.Utils.findInTree)();
var getInternalInstance = /* @__PURE__ */ (() => Api.ReactUtils.getInternalInstance.bind(Api.ReactUtils))();

// common/Utils/Logger.js
Logger.patchError = (patchId) => {
	console.error(`%c[${Config_default.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};
var Logger_default = Logger;

// common/Utils/EventEmitter.js
var EventEmitter_default = class {
	constructor() {
		this.listeners = {};
	}
	isInValid(event, handler) {
		return typeof event !== "string" || typeof handler !== "function";
	}
	once(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		const wrapper = () => {
			handler();
			this.off(event, wrapper);
		};
		this.listeners[event].add(wrapper);
	}
	on(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		this.listeners[event].add(handler);
		return () => this.off(event, handler);
	}
	off(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) return;
		this.listeners[event].delete(handler);
		if (this.listeners[event].size !== 0) return;
		delete this.listeners[event];
	}
	emit(event, ...payload) {
		if (!this.listeners[event]) return;
		for (const listener of this.listeners[event]) {
			try {
				listener.apply(null, payload);
			} catch (err) {
				Logger_default.error(`Could not run listener for ${event}`, err);
			}
		}
	}
};

// common/Utils/Plugin.js
var Events = {
	START: "START",
	STOP: "STOP"
};
var Plugin_default = new class extends EventEmitter_default {
	start() {
		this.emit(Events.START);
	}
	stop() {
		this.emit(Events.STOP);
	}
}();

// common/Utils/StylesLoader.js
var styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};
Plugin_default.on(Events.START, () => {
	DOM.addStyle(styleLoader._styles.join("\n"));
});
Plugin_default.on(Events.STOP, () => {
	DOM.removeStyle();
});
var StylesLoader_default = styleLoader;

// src/SpotifyEnhance/styles.css
StylesLoader_default.push(`:root {
	--SpotifyEnhance-spotify-green: #1ed760;
	--SpotifyEnhance-text-sub: #a7a7a7;
	--SpotifyEnhance-radius: 8px;
	--SpotifyEnhance-gutter: 10px;
	--SpotifyEnhance-font: gg sans, Helvetica Neue, helvetica, arial, Hiragino Kaku Gothic Pro, Meiryo, MS Gothic;
}

.flexCenterCenter {
	display: flex;
	align-items: center;
	justify-content: center;
}

.ellipsis {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.spotify-menuitem svg {
	width: 16px;
	height: 16px;
}

/* Spotify Indicator */
.spotifyActivityIndicatorIcon {
	color: var(--SpotifyEnhance-spotify-green);
	vertical-align: text-bottom;
	margin: 0 0 0 0.5rem;
}

[class^="repliedMessage"] .spotifyActivityIndicatorIcon {
	margin: 0 0.25rem 0 0;
}

[class^="threadMessageAccessory"] .spotifyActivityIndicatorIcon {
	margin: 0 0.25rem 0 0.25rem;
}



.pipContainer{
	position: fixed;
	inset:0;
	pointer-events:none;
	z-index:999;
}

.pipContainer .spotify-player-container {
	width: 240px;
	box-sizing: border-box;
}`);

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getBySource = /* @__PURE__ */ (() => Webpack.getBySource)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target) => target[type] && filter(target[type]);
}

function getModuleAndKey(filter, options) {
	let module2;
	const target = getModule((entry, m) => filter(entry) ? module2 = m : false, options);
	module2 = module2?.exports;
	if (!module2) return;
	const key = Object.keys(module2).find((k) => module2[k] === target);
	if (!key) return;
	return { module: module2, key };
}

// common/DiscordModules/zustand.js
var { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});
var subscribeWithSelector = getModule(Filters.byStrings("equalityFn", "fireImmediately"), { searchExports: true });
var zustand_default = zustand;

// MODULES-AUTO-LOADER:@Stores/ConnectedAccountsStore
var ConnectedAccountsStore_default = getStore("ConnectedAccountsStore");

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = getStore("SelectedChannelStore");

// MODULES-AUTO-LOADER:@Stores/SpotifyStore
var SpotifyStore_default = getStore("SpotifyStore");

// common/Utils/index.js
function fit({ width, height, gap = 0.8 }) {
	const ratio = Math.min(innerWidth / width, innerHeight / height);
	width = Math.round(width * ratio);
	height = Math.round(height * ratio);
	return {
		width,
		height,
		maxHeight: height * gap,
		maxWidth: width * gap
	};
}

function concateClassNames(...args) {
	return args.filter(Boolean).join(" ");
}

function shallow(objA, objB) {
	if (Object.is(objA, objB)) return true;
	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;
	const keysA = Object.keys(objA);
	if (keysA.length !== Object.keys(objB).length) return false;
	for (let i = 0; i < keysA.length; i++)
		if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;
	return true;
}
var promiseHandler = (promise) => promise.then((data) => [void 0, data]).catch((err) => [err]);

function copy(data) {
	DiscordNative.clipboard.copy(data);
}
var nop = () => {};

function genUrlParamsFromArray(params) {
	if (typeof params !== "object") throw new Error("params argument must be an object or array");
	if (typeof params === "object" && !Array.isArray(params)) {
		params = Object.entries(params);
	}
	return params.map(([key, val]) => `${key}=${val}`).join("&");
}

function buildUrl(endpoint, path, params) {
	const uri = endpoint + path;
	if (params) {
		params = genUrlParamsFromArray(params);
		return `${uri}?${params}`;
	}
	return uri;
}

// MODULES-AUTO-LOADER:@Modules/MessageActions
var MessageActions_default = getModule(Filters.byKeys("jumpToMessage", "_sendMessage"), { searchExports: false });

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: false });

// MODULES-AUTO-LOADER:@Stores/PendingReplyStore
var PendingReplyStore_default = getStore("PendingReplyStore");

// common/Utils/Messages.js
function getReply(channelId) {
	const reply = PendingReplyStore_default?.getPendingReply(channelId);
	if (!reply) return {};
	Dispatcher_default?.dispatch({ type: "DELETE_PENDING_REPLY", channelId });
	return {
		messageReference: {
			guild_id: reply.channel.guild_id,
			channel_id: reply.channel.id,
			message_id: reply.message.id
		},
		allowedMentions: reply.shouldMention ? void 0 : {
			parse: ["users", "roles", "everyone"],
			replied_user: false
		}
	};
}

function sendMessageDirectly(channel, content) {
	if (!MessageActions_default || !MessageActions_default.sendMessage || typeof MessageActions_default.sendMessage !== "function") throw new Error("Can't send message directly.");
	return MessageActions_default.sendMessage(
		channel.id, {
			validNonShortcutEmojis: [],
			content
		},
		void 0,
		getReply(channel.id)
	);
}
var insertText = /* @__PURE__ */ (() => {
	let ComponentDispatch;
	return (content) => {
		if (!ComponentDispatch) ComponentDispatch = getModule((m) => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length, { searchExports: true });
		if (!ComponentDispatch) return;
		setTimeout(
			() => ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
				plainText: content
			})
		);
	};
})();

// common/Utils/Timer.js
var Timer = class _Timer {
	static INTERVAL = "INTERVAL";
	static TIMEOUT = "TIMEOUT";
	constructor(fn, delay, type) {
		this.type = type;
		this.delay = delay;
		this.fn = fn;
		this.running = false;
		if (type === _Timer.INTERVAL) {
			this.counter = setInterval;
			this.clear = clearInterval;
		} else if (type === _Timer.TIMEOUT) {
			this.counter = setTimeout;
			this.clear = clearTimeout;
		}
	}
	start() {
		if (this.running) return;
		this.running = true;
		this.timerId = this.counter.call(window, () => {
			if (this.type === "TIMEOUT") this.running = false;
			try {
				this.fn.apply(null);
			} catch {}
		}, this.delay);
	}
	stop() {
		if (!this.running) return;
		this.clear.call(window, this.timerId);
		this.running = false;
	}
};

// common/Utils/Toast.js
function showToast(content, type) {
	UI.showToast(`[${Config_default.info.name}] ${content}`, { timeout: 5e3, type });
}
var Toast_default = {
	success(content) {
		showToast(content, "success");
	},
	info(content) {
		showToast(content, "info");
	},
	warning(content) {
		showToast(content, "warning");
	},
	error(content) {
		showToast(content, "error");
	}
};

// common/Utils/SpotifyAPI.js
var API_ENDPOINT = "https://api.spotify.com/v1";
async function wrappedFetch(url, options) {
	const [fetchError, response] = await promiseHandler(fetch(url, options));
	if (fetchError) {
		Logger_default.error("Fetch Error", fetchError);
		throw new Error(`[Network error] ${fetchError}`);
	}
	if (!response.ok) {
		const [, result] = await promiseHandler(response.json());
		throw result?.error || {
			message: "Unknown error",
			status: response.status
		};
	}
	if (response.status === 204) return true;
	const [, data] = await promiseHandler(response.json());
	return data;
}

function buildFetchRequestOptions(builderObj) {
	const options = {
		method: builderObj.method,
		headers: builderObj.headers
	};
	if (builderObj.body) options.body = JSON.stringify(builderObj.body);
	return options;
}
var FetchRequestBuilder = class {
	constructor(endpoint) {
		this.endpoint = endpoint;
	}
	setToken(token) {
		this.setHeaders({ Authorization: `Bearer ${token}` });
		return this;
	}
	setPath(path) {
		this.path = path;
		return this;
	}
	setMethod(method) {
		this.method = method;
		return this;
	}
	setParams(params) {
		this.params = params;
		return this;
	}
	setBody(body) {
		this.body = body;
		return this;
	}
	setHeaders(headers) {
		this.headers = Object.assign(this.headers || {}, headers);
		return this;
	}
	getURL() {
		return buildUrl(this.endpoint, this.path, this.params);
	}
	build() {
		this.url = this.getURL();
		this.options = buildFetchRequestOptions(this);
		return this;
	}
	run() {
		return wrappedFetch(this.url, this.options);
	}
};
var SpotifyClientAPI = class {
	constructor(credentials = {}) {
		this.credentials = credentials;
	}
	set token(value) {
		this.credentials.token = value;
	}
	get token() {
		return this.credentials.token || null;
	}
	set accountId(value) {
		this.credentials.accountId = value;
	}
	get accountId() {
		return this.credentials.accountId || null;
	}
	setAccount(accessToken, accountId) {
		this.token = accessToken;
		this.accountId = accountId;
	}
	getRequestBuilder() {
		return new FetchRequestBuilder(API_ENDPOINT).setToken(this.token);
	}
	next() {
		return this.getRequestBuilder().setPath("/me/player/next").setMethod("POST").build().run();
	}
	previous() {
		return this.getRequestBuilder().setPath("/me/player/previous").setMethod("POST").build().run();
	}
	play() {
		return this.getRequestBuilder().setPath("/me/player/play").setMethod("PUT").build().run();
	}
	pause() {
		return this.getRequestBuilder().setPath("/me/player/pause").setMethod("PUT").build().run();
	}
	seek(ms) {
		return this.getRequestBuilder().setPath("/me/player/seek").setMethod("PUT").setParams({ position_ms: ms }).build().run();
	}
	shuffle(state) {
		return this.getRequestBuilder().setPath("/me/player/shuffle").setMethod("PUT").setParams({ state }).build().run();
	}
	volume(volume_percent) {
		return this.getRequestBuilder().setPath("/me/player/volume").setMethod("PUT").setParams({ volume_percent }).build().run();
	}
	repeat(state) {
		return this.getRequestBuilder().setPath("/me/player/repeat").setMethod("PUT").setParams({ state }).build().run();
	}
	listen(type, id) {
		let body = {};
		if (type === "track" || type === "episode") body = { uris: [`spotify:${type}:${id}`] };
		else body = { context_uri: `spotify:${type}:${id}` };
		return this.getRequestBuilder().setPath("/me/player/play").setMethod("PUT").setBody(body).build().run();
	}
	queue(type, id) {
		return this.getRequestBuilder().setPath("/me/player/queue").setMethod("POST").setParams({ uri: `spotify:${type}:${id}` }).build().run();
	}
	getPlayerState() {
		return this.getRequestBuilder().setPath("/me/player").setMethod("GET").build().run();
	}
	getDevices() {
		return this.getRequestBuilder().setPath("/me/player/devices").setMethod("GET").build().run();
	}
	getRessource(type, id) {
		return this.getRequestBuilder().setPath(`/${type}s/${id}`).setMethod("GET").build().run();
	}
	//...
};
var SpotifyAPI_default = new SpotifyClientAPI();

// MODULES-AUTO-LOADER:@Modules/RefreshToken
var RefreshToken_default = getModule(Filters.byStrings("CONNECTION_ACCESS_TOKEN"), { searchExports: true });

// src/SpotifyEnhance/DB.js
var DB = new class {
	init() {
		const { promise, resolve } = Promise.withResolvers();
		const openReq = indexedDB.open(Config_default.info.name, 1);
		openReq.onerror = () => {
			Logger_default.error(openReq.result.error);
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
			Logger_default.error(getReq.error);
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
			Logger_default.error(putReq.error);
			resolve();
		};
		transaction.oncomplete = () => {
			resolve(putReq.result);
		};
		return promise;
	}
}();
Plugin_default.on(Events.START, () => {
	DB.init();
});
Plugin_default.on(Events.STOP, () => {
	DB.dispose();
});
var DB_default = DB;

// src/SpotifyEnhance/Utils.js
function getPathName(url) {
	try {
		return new URL(url).pathname;
	} catch {}
}

function parseSpotifyUrl(url) {
	const path = getPathName(url);
	if (typeof url !== "string" || !path) return void 0;
	const urlFrags = path.split("/");
	return [urlFrags.pop(), urlFrags.pop()];
}

function sanitizeSpotifyLink(link) {
	try {
		const url = new URL(link);
		return url.origin + url.pathname;
	} catch {
		return link;
	}
}

function isSpotifyUrl(url) {
	try {
		return new URL(url).host === "open.spotify.com";
	} catch {
		return false;
	}
}
var activityPanelClasses = getModule(Filters.byKeys("activityPanel", "panels"), { searchExports: false });
var getFluxContainer = /* @__PURE__ */ (() => {
	let userAreaFluxContainer = void 0;

	function tryGetFluxContainer() {
		const el = document.querySelector(`.${activityPanelClasses.panels}`);
		if (!el) return;
		const instance = getInternalInstance(el);
		if (!instance) return;
		const res = findInTree(instance, (a) => a?.type?.prototype?.hasParty, { walkable: ["child", "sibling"] });
		if (!res) return;
		return res;
	}
	return () => {
		if (userAreaFluxContainer) return Promise.resolve(userAreaFluxContainer);
		userAreaFluxContainer = tryGetFluxContainer();
		if (userAreaFluxContainer) Promise.resolve(userAreaFluxContainer);
		return new Promise((resolve) => {
			const interval = setInterval(() => {
				userAreaFluxContainer = tryGetFluxContainer();
				if (!userAreaFluxContainer) return;
				resolve(userAreaFluxContainer);
				clearInterval(interval);
			}, 500);
			setTimeout(() => {
				resolve(null);
				clearInterval(interval);
			}, 60 * 1e3);
		});
	};
})();
var parsers = {
	track(obj) {
		return {
			id: obj.id,
			thumbnail: obj.album.images,
			rawTitle: obj.name,
			rawDescription: `${obj.artists.map((a) => a.name).join(", ")} \xB7 ${obj.name} \xB7 ${new Date(obj.album.release_date).getFullYear()}`,
			url: obj.external_urls.spotify,
			preview_url: obj.preview_url,
			explicit: obj.explicit
		};
	},
	playlist(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.name,
			url: obj.external_urls.spotify,
			rawDescription: `${obj.name} \xB7 ${obj.tracks.total} songs \xB7 ${obj.followers.total} likes`,
			followers: obj.followers.total,
			total_tracks: obj.tracks.total,
			owner: {
				name: obj.owner.display_name,
				id: obj.owner.id
			}
		};
	},
	album(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.name,
			url: obj.external_urls.spotify,
			rawDescription: `${obj.artists.map((a) => a.name).join(", ")} \xB7 ${obj.name} \xB7 ${obj.total_tracks} songs \xB7 ${new Date(obj.release_date).getFullYear()}`,
			total_tracks: obj.total_tracks,
			popularity: obj.popularity
		};
	},
	artist(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.name,
			rawDescription: `${obj.name} \xB7 ${obj.followers.total} followers \xB7 ${obj.popularity} popularity`,
			url: obj.external_urls.spotify,
			popularity: obj.popularity
		};
	},
	user(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.display_name,
			rawDescription: `${obj.display_name} \xB7 ${obj.followers.total} followers`,
			url: obj.external_urls.spotify
		};
	},
	show(obj) {
		return {
			id: obj.id,
			thumbnail: obj.images,
			rawTitle: obj.name,
			rawDescription: obj.description,
			url: obj.external_urls.spotify,
			media_type: obj.media_type,
			publisher: obj.publisher,
			languages: obj.languages,
			is_externally_hosted: obj.is_externally_hosted,
			total_episodes: obj.total_episodes
		};
	},
	episode(obj) {
		return {
			id: obj.id,
			url: obj.external_urls.spotify,
			preview_url: obj.audio_preview_url,
			thumbnail: obj.images,
			rawTitle: obj.name,
			rawDescription: obj.description,
			language: obj.language,
			release_date: obj.release_date,
			explicit: obj.explicit,
			duration_ms: obj.duration_ms,
			is_externally_hosted: obj.is_externally_hosted
		};
	}
};

// src/SpotifyEnhance/SpotifyAPIWrapper.js
async function _requestHandler(action) {
	let repeat = 1;
	do {
		const [actionError, actionResponse] = await promiseHandler(action());
		if (!actionError) return actionResponse;
		if (actionError.status !== 401) throw new Error(actionError.message);
		if (!SpotifyAPI_default.accountId) throw new Error("Can't refresh expired access token Unknown account ID");
		const [tokenRefreshError, tokenRefreshResponse] = await promiseHandler(RefreshToken_default(SpotifyAPI_default.accountId));
		if (tokenRefreshError) {
			Logger_default.error(tokenRefreshError);
			throw "Could not refresh Spotify token";
		}
		SpotifyAPI_default.token = tokenRefreshResponse.body.access_token;
	} while (repeat--);
	throw new Error("Could not fulfill request");
}
var requestHandler = (() => {
	let awaiterPromise = Promise.resolve();
	return async (...args) => {
		const { promise, resolve } = Promise.withResolvers();
		const tempPromise = awaiterPromise;
		awaiterPromise = promise;
		await tempPromise;
		try {
			const res = await _requestHandler(...args);
			resolve();
			return res;
		} catch (e) {
			resolve();
			throw e;
		}
	};
})();

function ressourceActions(prop) {
	const { success, error } = {
		queue: {
			success: (type, name) => `Queued ${name}`,
			error: (type, name, reason) => `Could not queue ${name}
${reason}`
		},
		listen: {
			success: (type, name) => `Playing ${name}`,
			error: (type, name, reason) => `Could not play ${name}
${reason}`
		}
	} [prop];
	return (type, id, description) => requestHandler(() => SpotifyAPI_default[prop](type, id)).then(() => {
		Toast_default.success(success(type, description));
	}).catch((reason) => {
		Toast_default.error(error(type, description, reason));
	});
}
async function fetchRessource(type, id) {
	const [err, data] = await promiseHandler(requestHandler(() => SpotifyAPI_default.getRessource(type, id)));
	if (err) return Logger_default.error(`Could not fetch ${type} ${id}`);
	return data;
}
async function getRessourceWithCache(type, id) {
	if (!DB_default.db) return;
	const cachedData = await DB_default.get(type, id);
	if (cachedData) return cachedData;
	const fetchedData = await fetchRessource(type, id);
	if (!fetchedData) return;
	const parsedData = parsers[type](fetchedData);
	await DB_default.set(type, parsedData);
	return parsedData;
}
var SpotifyAPIWrapper_default = new Proxy({}, {
	get(_, prop) {
		switch (prop) {
			case "queue":
			case "listen":
				return ressourceActions(prop);
			case "play":
			case "pause":
			case "shuffle":
			case "repeat":
			case "seek":
			case "next":
			case "previous":
			case "volume":
				return (...args) => requestHandler(() => SpotifyAPI_default[prop].apply(SpotifyAPI_default, args)).catch((reason) => {
					Toast_default.error(`Could not execute ${prop} command
${reason}`);
				});
			case "getPlayerState":
			case "getDevices":
				return () => requestHandler(() => SpotifyAPI_default[prop]());
			case "setAccount":
				return (token, id) => SpotifyAPI_default.setAccount(token, id);
			case "getRessource":
				return getRessourceWithCache;
		}
	}
});

// src/SpotifyEnhance/Store.js
var Utils = {
	copy(str) {
		copy(str);
		Toast_default.success("copied!");
	},
	copySpotifyLink(link) {
		if (!link) return Toast_default.error("Could not resolve url");
		copy(sanitizeSpotifyLink(link));
		Toast_default.success("Link copied!");
	},
	openSpotifyLink(link) {
		if (!link) return Toast_default.error("Could not resolve url");
		window.open(sanitizeSpotifyLink(link), "_blank");
	},
	share(link) {
		if (!link) return Toast_default.error("Could not resolve url");
		const id = SelectedChannelStore_default.getCurrentlySelectedChannelId();
		if (!id) return Toast_default.info("There is no Selected Channel");
		link = sanitizeSpotifyLink(link);
		sendMessageDirectly({ id }, link).catch((a) => {
			Toast_default.error(a.message);
			insertText(link);
		});
	}
};
var Store = Object.assign(
	zustand_default(
		subscribeWithSelector((set, get) => {
			return {
				account: void 0,
				setAccount: (account) => {
					if (account === get().account) return;
					set({ account, isActive: !!account });
				},
				isActive: false,
				setDeviceState: (isActive) => set({ isActive }),
				async fetchPlayerState() {
					const [err, playerState] = await promiseHandler(SpotifyAPIWrapper_default.getPlayerState());
					if (err) return Logger_default.error("Could not fetch player state", err);
					get().setPlayerState(playerState);
				},
				media: {},
				mediaType: void 0,
				volume: void 0,
				progress: void 0,
				isPlaying: void 0,
				mediaId: void 0,
				repeat: void 0,
				shuffle: void 0,
				actions: void 0,
				setPlayerState: (playerState) => {
					if (!playerState || playerState.currently_playing_type === "ad") return set({ isPlaying: false });
					const state = get();
					const newId = playerState.item?.linked_from?.id || playerState.item?.id;
					const media = newId === state.media?.id ? state.media : playerState.item;
					set({
						isActive: !!playerState?.device?.is_active,
						volume: playerState?.device?.volume_percent,
						duration: playerState?.item?.duration_ms,
						progress: playerState?.progress_ms,
						position: playerState?.progress_ms,
						isPlaying: playerState?.is_playing,
						repeat: playerState?.repeat_state,
						shuffle: playerState?.shuffle_state,
						media,
						mediaId: media?.id,
						mediaType: playerState?.currently_playing_type,
						context: playerState?.context || {},
						actions: playerState?.actions?.disallows
					});
				},
				position: 0,
				incrementPosition: () => {
					const state = get();
					let sum = state.position + 1e3;
					if (sum > state.duration) sum = state.duration;
					set({ position: sum });
				},
				setPosition: (position) => set({ position }),
				getAlbum() {
					const media = get().media;
					return {
						...media.album,
						url: media.album.external_urls.spotify
					};
				},
				getFullSongName() {
					const state = get();
					if (!state.media) return "";
					const { artists, album } = state.media;
					return `Name: ${state.media.name}
Artist${artists.length > 1 ? "s" : ""}: ${artists.map((a) => a.name).join(" ,")}
Album: ${album.name}`;
				},
				getSongUrl() {
					return get().media?.external_urls?.spotify;
				},
				getSongBanners() {
					const media = get().media;
					return {
						bannerSm: media?.album?.images[2],
						bannerMd: media?.album?.images[1],
						bannerLg: media?.album?.images[0]
					};
				}
			};
		})
	), {
		init() {
			SpotifyStore_default.addChangeListener(onSpotifyStoreChange);
			ConnectedAccountsStore_default.addChangeListener(onAccountsChanged);
			this.idleTimer = new Timer(() => Store.state.setDeviceState(false), 5 * 60 * 1e3, Timer.TIMEOUT);
			this.positionInterval = new Timer(Store.state.incrementPosition, 1e3, Timer.INTERVAL);
			const account = ConnectedAccountsStore_default.getAccount(null, "spotify") || {};
			SpotifyAPIWrapper_default.setAccount(account.accessToken, account.id);
			const { socket } = SpotifyStore_default.getActiveSocketAndDevice() || {};
			if (!socket) return;
			Store.state.setAccount(socket);
			Store.state.fetchPlayerState();
		},
		dispose() {
			SpotifyStore_default.removeChangeListener(onSpotifyStoreChange);
			ConnectedAccountsStore_default.removeChangeListener(onAccountsChanged);
			Store.state.setAccount();
			Store.state.setPlayerState({});
			this.idleTimer.stop();
		},
		Utils,
		Api: SpotifyAPIWrapper_default,
		selectors: {
			isActive: (state) => state.isActive,
			account: (state) => state.account,
			media: (state) => state.media,
			mediaType: (state) => state.mediaType,
			volume: (state) => state.volume,
			progress: (state) => state.progress,
			mediaId: (state) => state.mediaId,
			context: (state) => state.context,
			isPlaying: (state) => state.isPlaying,
			duration: (state) => state.duration,
			repeat: (state) => state.repeat,
			shuffle: (state) => state.shuffle,
			position: (state) => state.position,
			actions: (state) => state.actions
		}
	}
);
Plugin_default.on(Events.START, () => {
	Store.init();
});
Plugin_default.on(Events.STOP, () => {
	Store.dispose();
});
Object.defineProperty(Store, "state", {
	configurable: false,
	get: () => Store.getState()
});
Store.subscribe(Store.selectors.account, (account = {}) => {
	SpotifyAPIWrapper_default.setAccount(account.accessToken, account.accountId);
});
Store.subscribe(Store.selectors.isPlaying, (isPlaying) => {
	if (isPlaying) {
		Store.idleTimer.stop();
		Store.positionInterval.start();
	} else {
		Store.positionInterval.stop();
		Store.idleTimer.start();
	}
});
Store.subscribe(Store.selectors.position, (position) => {
	const { duration, setPosition } = Store.state;
	if (position < duration) return;
	Store.positionInterval.stop();
	setPosition(duration || 0);
});
Store.subscribe(
	(state) => [state.isPlaying, state.progress],
	([isPlaying]) => {
		if (!isPlaying) Store.positionInterval.stop();
		else Store.positionInterval.start();
	}, { equalityFn: shallow }
);

function onSpotifyStoreChange() {
	try {
		if (Store.state.account?.accountId && Store.state.account?.accessToken) return;
		const { socket } = SpotifyStore_default.getActiveSocketAndDevice() || {};
		if (!socket) return;
		Store.state.setAccount(socket);
		Store.state.fetchPlayerState();
	} catch (e) {
		Logger_default.error(e);
	}
}

function onAccountsChanged() {
	try {
		if (!Store.state.account) return;
		const connectedAccounts = ConnectedAccountsStore_default.getAccounts().filter((account) => account.type === "spotify");
		if (connectedAccounts.some((a) => a.id === Store.state.account.accountId)) return;
		Store.state.setAccount(void 0);
	} catch (e) {
		Logger_default.error(e);
	}
}

// common/Components/Flex/index.jsx
var Flex_default = getModule((a) => a.defaultProps?.direction, { searchExports: true });

// common/Components/icons/ImageIcon/index.jsx
function ImageIcon(props) {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "-50 -50 484 484",
			...props
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z" })
	);
}

// common/Components/icons/ListenIcon/index.jsx
function ListenIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M22 16.53C22 18.3282 20.2485 19.7837 18.089 19.7837C15.9285 19.7837 14.5396 18.3277 14.5396 16.53C14.5396 14.7319 15.9286 13.2746 18.089 13.2746C18.7169 13.2746 19.3089 13.4013 19.8353 13.6205V5.814L9.46075 7.32352V18.7449C9.46075 20.5424 7.70957 22 5.54941 22C3.38871 22 2 20.5443 2 18.7456C2 16.9481 3.3892 15.4898 5.54941 15.4898C6.17823 15.4898 6.76966 15.6162 7.29604 15.836C7.29604 11.3608 7.29604 8.5366 7.29604 4.1395L21.9996 2L22 16.53Z" })
	);
}

// src/SpotifyEnhance/patches/patchChannelAttach.jsx
var { Item: MenuItem } = ContextMenu;
var ChannelAttachMenu = getModule(Filters.byStrings("Plus Button"), { defaultExport: false });

function MenuLabel({ label, icon }) {
	return /* @__PURE__ */ React.createElement(
		Flex_default, {
			direction: Flex_default.Direction.HORIZONTAL,
			align: Flex_default.Align.CENTER,
			style: { gap: 8 }
		},
		icon,
		/* @__PURE__ */
		React.createElement("div", null, label)
	);
}
Plugin_default.on(Events.START, () => {
	if (!ChannelAttachMenu) return Logger_default.patchError("patchChannelAttach");
	const unpatch = Patcher.after(ChannelAttachMenu, "Z", (_, args, ret) => {
		if (!Store.state.isActive) return;
		if (!Store.state.mediaId) return;
		if (!Array.isArray(ret?.props?.children)) return;
		ret.props.children.push(
			/* @__PURE__ */
			React.createElement(
				MenuItem, {
					id: "spotify-share-song-menuitem",
					label: /* @__PURE__ */ React.createElement(
						MenuLabel, {
							icon: /* @__PURE__ */ React.createElement(ListenIcon, null),
							label: "Share spotify song"
						}
					),
					action: () => {
						const songUrl = Store.state.getSongUrl();
						Store.Utils.share(songUrl);
					}
				}
			),
			/* @__PURE__ */
			React.createElement(
				MenuItem, {
					id: "spotify-share-banner-menuitem",
					label: /* @__PURE__ */ React.createElement(
						MenuLabel, {
							icon: /* @__PURE__ */ React.createElement(ImageIcon, null),
							label: "Share spotify song banner"
						}
					),
					action: () => {
						const {
							bannerLg: { url }
						} = Store.state.getSongBanners();
						Store.Utils.share(url);
					}
				}
			)
		);
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// src/SpotifyEnhance/components/SpotifyPlayer/styles.css
StylesLoader_default.push(`.spotify-player-container {
	background: hsl(228 8% 12%);
	border-bottom: 1px solid hsl(228deg 6% 33% / 48%);
	padding: 10px 10px;
	color: white;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.spotify-player-container.bannerBackground {
	transform: translate(0);
}

.spotify-player-container.bannerBackground:after {
	content: "";
	background:
		linear-gradient(#000000b0 0 0),
		var(--banner-lg) center/cover no-repeat;
	position: absolute;
	inset: 0;
	filter: blur(8px);
	z-index: -1;
}

.spotify-player-container.compact {
	flex-direction: row;
	padding: 0;
}

.spotify-player-container.compact .spotify-player-album,
.spotify-player-container.compact .spotify-player-controls-share,
.spotify-player-container.compact .spotify-player-controls-shuffle,
.spotify-player-container.compact .spotify-player-controls-repeat,
.spotify-player-container.compact .spotify-player-controls-volume,
.spotify-player-container.compact .spotify-player-timeline {
	display: none;
}

.spotify-player-container.compact .spotify-player-artist {
	font-size: 0.7rem;
	align-self: flex-start;
}

.spotify-player-container.compact .spotify-player-title {
	font-size: 0.9rem;
	align-self: flex-end;
}

.spotify-player-container.compact .spotify-player-media {
	margin-right: auto;
	grid-template-columns: 48px minmax(0, 1fr);
	grid-template-rows: repeat(2, auto);
	grid-template-areas:
		"banner title"
		"banner artist";
	justify-content: center;
	gap: 5px 10px;

}

.spotify-player-container.compact .spotify-player-banner {
	height: 48px;
	width: 48px;
	grid-row: 1 / -1;
	border-radius: 0;
}

.spotify-player-container.compact .spotify-player-controls {
	width: auto;
	justify-content: unset;
	align-items: center;
	margin-right: 5px;
	flex:0 0 auto;
}

.spotify-player-minmax{
	position:absolute;
	top:10px;
	left:10px;
	z-index:10;
	rotate:90deg;
	box-sizing:bordr-box;
	width:15px;
	height:15px;
	cursor:pointer;
	display:none;
	background:#000a;
	border-radius:50%;
}

.spotify-player-container:hover .spotify-player-minmax{
	display:flex;
}

.spotify-player-minmax svg{
	width:100%;
	height:100%;
}

.spotify-player-container.compact .spotify-player-minmax{
	top:0px;
	left:0px;
	rotate:-90deg;
}`);

// common/React.js
var useState = /* @__PURE__ */ (() => React.useState)();
var useEffect = /* @__PURE__ */ (() => React.useEffect)();
var useRef = /* @__PURE__ */ (() => React.useRef)();
var useCallback = /* @__PURE__ */ (() => React.useCallback)();
var useMemo = /* @__PURE__ */ (() => React.useMemo)();
var Children = /* @__PURE__ */ (() => React.Children)();
var React_default = /* @__PURE__ */ (() => React)();

// src/SpotifyEnhance/components/SpotifyPlayerControls/styles.css
StylesLoader_default.push(`.spotify-player-controls {
	display: flex;
	justify-content: space-between;
	width: 100%;
	overflow: hidden;
}

.spotify-player-controls svg {
	width: 16px;
	height: 16px;
}

.spotify-player-controls-btn {
	padding: 3px !important;
	color: #ccc;
	transition: all 100ms linear;
	border-radius: 5px;
}

.spotify-player-controls-btn:hover {
	background: #ccc3;
	color: fff;
	scale: 1.1;
}

.spotify-player-controls-btn.enabled {
	color: var(--SpotifyEnhance-spotify-green);
}

.spotify-player-controls-volume-slider-wrapper {
	height: 160px;
	width: 25px;
	background: oklab(0.278867 0.00249027 -0.00875303);
	padding: 5px 3px;
	border-radius: 99px;
	display: flex;
	flex-direction: column;
	box-sizing:border-box;
}

.spotify-player-controls-volume-slider {
	margin: 0;
	width: 100%;
	min-height: 0;
	accent-color: var(--SpotifyEnhance-spotify-green);
	flex: 1 0 0;
	appearance: slider-vertical;
}

.spotify-player-controls-volume-label {
	color:white;
	width:100%;
	border-top:1px solid rgba(78, 80, 88);
	font-size:.85rem;
	margin-top:5px;
	padding-top:5px;
	text-align:center;
}`);

// MODULES-AUTO-LOADER:@Modules/Button
var Button_default = getModule((a) => a && a.Link && a.Colors, { searchExports: true });

// common/Components/Button/index.jsx
var Button_default2 = Button_default || function ButtonComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("button", { ...props });
};

// common/DiscordModules/Modules.js
var DiscordPopout = /* @__PURE__ */ (() => getModule((a) => a?.prototype?.render && a.Animation, { searchExports: true }))();

// common/Components/Popout/index.jsx
var Popout_default = ({ children, targetElementRef, ...props }) => {
	const ref = useRef();
	return /* @__PURE__ */ React_default.createElement(
		DiscordPopout, {
			position: "top",
			align: "center",
			animation: DiscordPopout.Animation.FADE,
			spacing: 4,
			...props,
			targetElementRef: targetElementRef || ref
		},
		(p) => targetElementRef ? children(p) : React_default.cloneElement(children(p), { ref })
	);
};

// common/Utils/Hooks.js
function useTimer(fn, delay) {
	const hideTimeoutId = useRef(null);
	const clear = useCallback(() => {
		if (hideTimeoutId.current === null) return;
		clearTimeout(hideTimeoutId.current);
		hideTimeoutId.current = null;
	}, []);
	const start = useCallback(() => {
		hideTimeoutId.current = setTimeout(() => {
			clear();
			fn();
		}, delay);
	}, [fn, delay]);
	useEffect(() => clear, []);
	return [start, clear];
}

// common/Components/HoverPopout/index.jsx
function HoverPopout({ children, popout, delay = 150, popoutWrapperClassName, ...popoutProps }) {
	const [show, setShow] = useState(false);
	const [mouseLeaveHandler, clearLeave] = useTimer(() => setShow(false), delay);
	const [mouseEnterHandler, clearEnter] = useTimer(() => setShow(true), delay);
	useEffect(
		() => () => {
			clearLeave();
			clearEnter();
		},
		[]
	);
	const child = Children.only(children);
	const content = (e) => React_default.cloneElement(child, {
		onMouseEnter: (e2) => {
			clearLeave();
			child.props.onMouseenter?.(e2);
			mouseEnterHandler(e2);
		},
		onMouseLeave: (e2) => {
			clearEnter();
			child.props.onMouseLeave?.(e2);
			mouseLeaveHandler(e2);
		}
	});
	const popoutContent = (e) => /* @__PURE__ */ React_default.createElement(
		"div", {
			className: concateClassNames("popoutMouseEventsTrapper", popoutWrapperClassName),
			onMouseLeave: (e2) => {
				clearEnter(e2);
				mouseLeaveHandler(e2);
			},
			onMouseEnter: (e2) => {
				clearLeave();
				mouseEnterHandler(e2);
			}
		},
		popout(e)
	);
	return /* @__PURE__ */ React_default.createElement(
		Popout_default, {
			...popoutProps,
			onRequestClose: () => setShow(false),
			shouldShow: show,
			renderPopout: popoutContent
		},
		content
	);
}

// MODULES-AUTO-LOADER:@Modules/Tooltip
var Tooltip_default = getModule(Filters.byPrototypeKeys("renderTooltip"), { searchExports: true });

// common/Components/Tooltip/index.jsx
var Tooltip_default2 = ({ note, position, children }) => {
	return /* @__PURE__ */ React.createElement(
		Tooltip_default, {
			text: note,
			position: position || "top"
		},
		(props) => React.cloneElement(children, {
			...props,
			...children.props
		})
	);
};

// common/Components/icons/MuteVolumeIcon/index.jsx
function MuteVolumeIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z" }),
		/* @__PURE__ */
		React.createElement("path", { d: "M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z" }),
		" "
	);
}

// common/Components/icons/NextIcon/index.jsx
function NextIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			height: "24",
			width: "24",
			viewBox: "0 0 16 16"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z" })
	);
}

// common/Components/icons/PauseIcon/index.jsx
function PauseIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z" })
	);
}

// common/Components/icons/PlayIcon/index.jsx
function PlayIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z" }),
		"	"
	);
}

// common/Components/icons/PreviousIcon/index.jsx
function PlayIcon2() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			height: "24",
			width: "24",
			viewBox: "0 0 16 16"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z" })
	);
}

// common/Components/icons/RepeatIcon/index.jsx
function RepeatIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z" })
	);
}

// common/Components/icons/RepeatOneIcon/index.jsx
function RepeatOneIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5zM12.25 2.5h-.75V1h.75A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25z" }),
		/* @__PURE__ */
		React.createElement("path", { d: "M9.12 8V1H7.787c-.128.72-.76 1.293-1.787 1.313V3.36h1.57V8h1.55z" })
	);
}

// common/Components/icons/ShareIcon/index.jsx
var ShareIcon_default = () => {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z" })
	);
};

// common/Components/icons/ShuffleIcon/index.jsx
function ShuffleIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			height: "24",
			width: "24",
			viewBox: "0 0 16 16"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z" }),
		/* @__PURE__ */
		React.createElement("path", { d: "m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z" })
	);
}

// common/Components/icons/VolumeIcon/index.jsx
function VolumeIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z" }),
		/* @__PURE__ */
		React.createElement("path", { d: "M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z" })
	);
}

// common/Components/icons/AddToQueueIcon/index.jsx
function AddToQueueIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "-1 -1 18 18"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M16 15H2v-1.5h14V15zm0-4.5H2V9h14v1.5zm-8.034-6A5.484 5.484 0 0 1 7.187 6H13.5a2.5 2.5 0 0 0 0-5H7.966c.159.474.255.978.278 1.5H13.5a1 1 0 1 1 0 2H7.966zM2 2V0h1.5v2h2v1.5h-2v2H2v-2H0V2h2z" })
	);
}

// src/SpotifyEnhance/consts.js
var EmbedStyleEnum = {
	KEEP: "KEEP",
	REPLACE: "REPLACE",
	HIDE: "HIDE"
};
var PlayerButtonsEnum = {
	SHARE: "Share",
	SHUFFLE: "Shuffle",
	PREVIOUS: "Previous",
	PLAY: "Play",
	NEXT: "Next",
	REPEAT: "Repeat",
	VOLUME: "Volume"
};
var PlayerPlaceEnum = {
	PIP: "PIP",
	USERAREA: "USERAREA"
};
var ALLOWD_TYPES = ["track", "playlist", "album", "artist", "user", "show", "episode"];

// common/Utils/Settings.js
var SettingsStoreSelectors = {};
var persistMiddleware = (config) => (set, get, api) => config((args) => (set(args), Data.save("settings", get().getRawState())), get, api);
var SettingsStore = Object.assign(
	zustand_default(
		persistMiddleware(
			subscribeWithSelector((set, get) => {
				const settingsObj = /* @__PURE__ */ Object.create(null);
				for (const [key, value] of Object.entries({
						...Config_default.settings,
						...Data.load("settings")
					})) {
					settingsObj[key] = value;
					settingsObj[`set${key}`] = (newValue) => set({
						[key]: newValue });
					SettingsStoreSelectors[key] = (state) => state[key];
				}
				settingsObj.getRawState = () => {
					return Object.entries(get()).filter(([, val]) => typeof val !== "function").reduce((acc, [key, val]) => {
						acc[key] = val;
						return acc;
					}, {});
				};
				return settingsObj;
			})
		)
	), {
		useSetting: function(key) {
			return this((state) => [state[key], state[`set${key}`]]);
		},
		selectors: SettingsStoreSelectors
	}
);
Object.defineProperty(SettingsStore, "state", {
	configurable: false,
	get() {
		return this.getState();
	}
});

function renderListener(content, [selector, eqFn = Object.is], shouldShow, memo) {
	const wrappedComp = () => shouldShow(SettingsStore(selector, eqFn)) ? content : null;
	return React_default.createElement(memo ? React_default.memo(wrappedComp) : wrappedComp);
}
var Settings_default = SettingsStore;

// src/SpotifyEnhance/components/SpotifyPlayerControls/index.jsx
var pauseHandler = () => Store.Api.pause();
var playHandler = () => Store.Api.play();
var previousHandler = () => Store.Api.previous();
var nextHandler = () => Store.Api.next();
var playpause = {
	true: {
		playPauseTooltip: "Pause",
		playPauseClassName: "spotify-player-controls-pause",
		playPauseHandler: pauseHandler,
		playPauseIcon: /* @__PURE__ */ React_default.createElement(PauseIcon, null)
	},
	false: {
		playPauseTooltip: "Play",
		playPauseClassName: "spotify-player-controls-play",
		playPauseHandler: playHandler,
		playPauseIcon: /* @__PURE__ */ React_default.createElement(PlayIcon, null)
	}
};
var repeatObj = {
	off: {
		repeatTooltip: "Repeat",
		repeatArg: "context",
		repeatIcon: /* @__PURE__ */ React_default.createElement(RepeatIcon, null),
		repeatActive: false
	},
	context: {
		repeatTooltip: "Repeat track",
		repeatArg: "track",
		repeatIcon: /* @__PURE__ */ React_default.createElement(RepeatIcon, null),
		repeatActive: true
	},
	track: {
		repeatTooltip: "Repeat off",
		repeatArg: "off",
		repeatIcon: /* @__PURE__ */ React_default.createElement(RepeatOneIcon, null),
		repeatActive: true
	}
};
var SpotifyPlayerControls_default = () => {
	const playerButtons = Settings_default(Settings_default.selectors.playerButtons, shallow);
	const [isPlaying, shuffle, repeat, volume] = Store((_) => [_.isPlaying, _.shuffle, _.repeat, _.volume], shallow);
	const actions = Store(Store.selectors.actions, shallow);
	const context2 = Store(Store.selectors.context, (n, o) => n?.uri === o?.uri);
	const url = Store.state.getSongUrl();
	const { bannerLg } = Store.state.getSongBanners();
	const { toggling_shuffle, toggling_repeat_track, skipping_next, skipping_prev } = actions || {};
	const { repeatTooltip, repeatActive, repeatIcon, repeatArg } = repeatObj[repeat || "off"];
	const shuffleHandler = () => Store.Api.shuffle(!shuffle);
	const repeatHandler = () => Store.Api.repeat(repeatArg);
	const shareSongHandler = () => Store.Utils.share(url);
	const sharePosterHandler = () => Store.Utils.share(bannerLg.url);
	const sharePlaylistHandler = () => Store.Utils.share(context2?.external_urls?.spotify);
	const copySongHandler = () => Store.Utils.copySpotifyLink(url);
	const copyPosterHandler = () => Store.Utils.copySpotifyLink(bannerLg.url);
	const copyNameHandler = () => Store.Utils.copy(Store.state.getFullSongName());
	const { playPauseTooltip, playPauseHandler, playPauseIcon, playPauseClassName } = playpause[isPlaying];
	const shareMenu = [{
			className: "spotify-menuitem",
			id: "copy",
			label: "copy",
			type: "submenu",
			items: [{
					className: "spotify-menuitem",
					id: "copy-song-link",
					action: copySongHandler,
					icon: ListenIcon,
					label: "Copy song url"
				},
				{
					className: "spotify-menuitem",
					id: "copy-poster-link",
					action: copyPosterHandler,
					icon: ImageIcon,
					label: "Copy poster url"
				},
				{
					className: "spotify-menuitem",
					id: "copy-song-name",
					action: copyNameHandler,
					// icon: ImageIcon,
					label: "Copy name"
				}
			]
		},
		{
			className: "spotify-menuitem",
			id: "share",
			label: "share",
			type: "submenu",
			items: [{
					className: "spotify-menuitem",
					id: "share-song-link",
					action: shareSongHandler,
					icon: ListenIcon,
					label: "Share song in current channel"
				},
				{
					className: "spotify-menuitem",
					id: "share-poster-link",
					action: sharePosterHandler,
					icon: ImageIcon,
					label: "Share poster in current channel"
				},
				context2.type === "playlist" && {
					className: "spotify-menuitem",
					id: "share-playlist-link",
					action: sharePlaylistHandler,
					icon: AddToQueueIcon,
					label: "Share playlist in current channel"
				}
			].filter(Boolean)
		}
	];
	return /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-controls" }, playerButtons[PlayerButtonsEnum.SHARE] && /* @__PURE__ */ React_default.createElement(
		HoverPopout, {
			className: "spotify-player-controls-share",
			popout: (e) => /* @__PURE__ */ React_default.createElement(ContextMenu.Menu, { onClose: e.closePopout }, ContextMenu.buildMenuChildren(shareMenu))
		},
		/* @__PURE__ */
		React_default.createElement(SpotifyPlayerButton, { value: /* @__PURE__ */ React_default.createElement(ShareIcon_default, null) })
	), [playerButtons[PlayerButtonsEnum.SHUFFLE] && { name: "Shuffle", value: /* @__PURE__ */ React_default.createElement(ShuffleIcon, null), className: "spotify-player-controls-shuffle", disabled: toggling_shuffle, active: shuffle, onClick: shuffleHandler }, playerButtons[PlayerButtonsEnum.PREVIOUS] && { name: "Previous", value: /* @__PURE__ */ React_default.createElement(PlayIcon2, null), className: "spotify-player-controls-previous", disabled: skipping_prev, onClick: previousHandler }, { name: playPauseTooltip, value: playPauseIcon, className: playPauseClassName, disabled: false, onClick: playPauseHandler }, playerButtons[PlayerButtonsEnum.NEXT] && { name: "Next", value: /* @__PURE__ */ React_default.createElement(NextIcon, null), className: "spotify-player-controls-next", disabled: skipping_next, onClick: nextHandler }, playerButtons[PlayerButtonsEnum.REPEAT] && { name: repeatTooltip, value: repeatIcon, className: "spotify-player-controls-repeat", disabled: toggling_repeat_track, active: repeatActive, onClick: repeatHandler }].filter(Boolean).map(SpotifyPlayerButton), playerButtons[PlayerButtonsEnum.VOLUME] && /* @__PURE__ */ React_default.createElement(Volume, { volume }));
};

function SpotifyPlayerButton({ className, ref, active, name, value, ...rest }) {
	return /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: name }, /* @__PURE__ */ React_default.createElement(
		Button_default2, {
			buttonRef: ref,
			innerClassName: "flexCenterCenter",
			className: `spotify-player-controls-btn ${className} ${active ? "enabled" : ""}`,
			size: Button_default2.Sizes.NONE,
			color: Button_default2.Colors.PRIMARY,
			look: Button_default2.Looks.BLANK,
			...rest
		},
		value
	));
}

function Volume({ volume }) {
	const [val, setVal] = React_default.useState(volume);
	const [active, setActive] = React_default.useState(false);
	const volumeRef = React_default.useRef(volume || 25);
	React_default.useEffect(() => {
		if (volume) volumeRef.current = volume;
		if (!active) setVal(volume);
	}, [volume]);
	const volumeMuteHandler = () => {
		const target = val ? 0 : volumeRef.current;
		Store.Api.volume(target).then(() => {
			setVal(target);
		});
	};
	const volumeOnChange = (e) => setVal(Math.round(e.target.value));
	const volumeOnMouseDown = () => setActive(true);
	const volumeOnMouseUp = () => {
		setActive(false);
		Store.Api.volume(val).then(() => volumeRef.current = val);
	};
	return /* @__PURE__ */ React_default.createElement(
		HoverPopout, {
			popout: () => /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-controls-volume-slider-wrapper" }, /* @__PURE__ */ React_default.createElement(
				"input", {
					value: val,
					onChange: volumeOnChange,
					onMouseUp: volumeOnMouseUp,
					onMouseDown: volumeOnMouseDown,
					type: "range",
					step: "1",
					min: "0",
					max: "100",
					className: "spotify-player-controls-volume-slider"
				}
			), /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-controls-volume-label" }, val)),
			position: "top",
			align: "center",
			animation: "1",
			className: "spotify-player-controls-volume",
			spacing: 8
		},
		/* @__PURE__ */
		React_default.createElement(
			SpotifyPlayerButton, {
				onClick: volumeMuteHandler,
				value: val ? /* @__PURE__ */ React_default.createElement(VolumeIcon, null) : /* @__PURE__ */ React_default.createElement(MuteVolumeIcon, null)
			}
		)
	);
}

// src/SpotifyEnhance/components/TrackMediaDetails/styles.css
StylesLoader_default.push(`.spotify-player-media {
	color: white;
	font-size: 0.9rem;
	overflow: hidden;
	display: grid;
	column-gap: 10px;
	z-index: 5;
	grid-template-columns: 64px minmax(0, 1fr);
	grid-template-rows: repeat(3, 1fr);
	align-items: center;
	justify-items: flex-start;
	grid-template-areas:
		"banner title"
		"banner artist"
		"banner album";
}

.spotify-player-title {
	grid-area: title;
	font-weight: bold;
	color: #fff;
	font-size: 1.05rem;
	max-width: 100%;
}

.spotify-player-title:first-child {
	grid-column: 1/-1;
	grid-row: 1/-1;
	margin-bottom: 5px;
}


.spotify-player-artist {
	grid-area: artist;
	font-size: 0.8rem;
	max-width: 100%;
}

.spotify-player-album {
	grid-area: album;
	max-width: 100%;
}

.spotify-player-album > div,
.spotify-player-artist > div {
	display: flex;
	gap: 5px;
}

.spotify-player-album span,
.spotify-player-artist span {
	color: var(--SpotifyEnhance-text-sub);
}

.spotify-player-banner {
	grid-area: banner;
	cursor: pointer;
	width: 64px;
	height: 64px;
	background:
		var(--banner-lg) center/cover no-repeat,
		#b2b2b217;
	border-radius: 5px;
}
`);

// MODULES-AUTO-LOADER:@Modules/Anchor
var Anchor_default = getModule(Filters.byStrings("anchor", "noreferrer noopener"), { searchExports: true });

// common/Components/icons/ExternalLinkIcon/index.jsx
function ExternalLinkIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M1 2.75A.75.75 0 0 1 1.75 2H7v1.5H2.5v11h10.219V9h1.5v6.25a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75V2.75z" }),
		/* @__PURE__ */
		React.createElement("path", { d: "M15 1v4.993a.75.75 0 1 1-1.5 0V3.56L8.78 8.28a.75.75 0 0 1-1.06-1.06l4.72-4.72h-2.433a.75.75 0 0 1 0-1.5H15z" })
	);
}

// src/SpotifyEnhance/components/TrackMediaDetails/Artist.jsx
function Artist({ artists }) {
	const menu = artists.length === 1 ? getArtistContextMenu(artists[0]) : artists.map((artist) => ({
		type: "submenu",
		id: artist.id,
		label: artist.name,
		items: getArtistContextMenu(artist)
	}));
	return /* @__PURE__ */ React_default.createElement(HoverPopout, { popout: (e) => /* @__PURE__ */ React_default.createElement(ContextMenu.Menu, { onClose: e.closePopout }, ContextMenu.buildMenuChildren(menu)) }, /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-artist ellipsis" }, `on ${artists[0].name}`));
}

function getArtistContextMenu(artist) {
	return [{
			className: "spotify-menuitem",
			id: "open-link",
			action: () => Store.Utils.openSpotifyLink(`https://open.spotify.com/artist/${artist.id}`),
			icon: ExternalLinkIcon,
			label: "Open externally"
		},
		{
			className: "spotify-menuitem",
			id: "artist-play",
			action: () => Store.Api.listen("artist", artist.id, artist.name),
			icon: ListenIcon,
			label: "Play Artist"
		}
	];
}

// common/Utils/ImageModal/styles.css
StylesLoader_default.push(`.downloadLink {
	color: white !important;
	font-size: 14px;
	font-weight: 500;
	/*	line-height: 18px;*/
	text-decoration: none;
	transition: opacity.15s ease;
	opacity: 0.5;
}

.imageModalwrapper {
	display: flex;
	flex-direction: column;
}

.imageModalOptions {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 4px;
}
`);

// MODULES-AUTO-LOADER:@Stores/AccessibilityStore
var AccessibilityStore_default = getStore("AccessibilityStore");

// common/Utils/ImageModal/index.jsx
var RenderLinkComponent = getModule((m) => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });
var ImageModal = getModule(reactRefMemoFilter("type", "renderLinkComponent"), { searchExports: true });

function h(e, t) {
	let n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
	true === n || AccessibilityStore_default.useReducedMotion ? e.set(t) : e.start(t);
}
var useSomeScalingHook = getModule(Filters.byStrings("reducedMotion.enabled", "useSpring", "respect-motion-settings"), { searchExports: true });
var context = getModule((a) => a?._currentValue?.scale, { searchExports: true });
var ImageComponent = ({ url, ...rest }) => {
	const [x, P] = useState(false);
	const [M, w] = useSomeScalingHook(() => ({
		scale: AccessibilityStore_default.useReducedMotion ? 1 : 0.9,
		x: 0,
		y: 0,
		config: {
			friction: 30,
			tension: 300
		}
	}));
	const contextVal = useMemo(
		() => ({
			scale: M.scale,
			x: M.x,
			y: M.y,
			setScale(e, t) {
				h(M.scale, e, null == t ? void 0 : t.immediate);
			},
			setOffset(e, t, n) {
				h(M.x, e, null == n ? void 0 : n.immediate), h(M.y, t, null == n ? void 0 : n.immediate);
			},
			zoomed: x,
			setZoomed(e) {
				P(e), h(M.scale, e ? 2.5 : 1), e || (h(M.x, 0), h(M.y, 0));
			}
		}),
		[x, M]
	);
	return /* @__PURE__ */ React_default.createElement(context.Provider, { value: contextVal }, /* @__PURE__ */ React_default.createElement("div", { className: "imageModalwrapper" }, /* @__PURE__ */ React_default.createElement(
		ImageModal, {
			maxWidth: rest.maxWidth,
			maxHeight: rest.maxHeight,
			media: {
				...rest,
				type: "IMAGE",
				url,
				proxyUrl: url
			}
		}
	), !x && /* @__PURE__ */ React_default.createElement("div", { className: "imageModalOptions" }, /* @__PURE__ */ React_default.createElement(
		RenderLinkComponent, {
			className: "downloadLink",
			href: url
		},
		"Open in Browser"
	))));
};

// common/Utils/Modals/styles.css
StylesLoader_default.push(`.transparent-background.transparent-background{
	background: transparent;
	border:unset;
}`);

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary = class extends React.Component {
	state = { hasError: false, error: null, info: null };
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `
	${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${Config_default?.info?.name || "Unknown Plugin"}] %cthrew an exception at %c[${this.props.id}]
`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}
	renderErrorBoundary() {
		return /* @__PURE__ */ React.createElement("div", { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" } }, /* @__PURE__ */ React.createElement("b", { style: { color: "#e0e1e5" } }, "An error has occured while rendering ", /* @__PURE__ */ React.createElement("span", { style: { color: "orange" } }, this.props.id)));
	}
	renderFallback() {
		if (React.isValidElement(this.props.fallback)) {
			if (this.props.passMetaProps)
				this.props.fallback.props = {
					id: this.props.id,
					plugin: Config_default?.info?.name || "Unknown Plugin",
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return /* @__PURE__ */ React.createElement(
			this.props.fallback, {
				id: this.props.id,
				plugin: Config_default?.info?.name || "Unknown Plugin"
			}
		);
	}
	render() {
		if (!this.state.hasError) return this.props.children;
		return this.props.fallback ? this.renderFallback() : this.renderErrorBoundary();
	}
};

// MODULES-AUTO-LOADER:@Modules/ModalRoot
var ModalRoot_default = getModule(Filters.byStrings("rootWithShadow", "MODAL"), { searchExports: true });

// MODULES-AUTO-LOADER:@Modules/ModalSize
var ModalSize_default = getModule(Filters.byKeys("DYNAMIC", "SMALL", "LARGE"), { searchExports: true });

// common/Utils/Modals/index.jsx
var ModalActions = /* @__PURE__ */ getMangled("onCloseRequest:null!=", {
	openModal: /* @__PURE__ */ Filters.byStrings("onCloseRequest:null!="),
	closeModal: /* @__PURE__ */ Filters.byStrings(".setState", ".getState()[")
});
var openModal = (children, tag, { className, ...modalRootProps } = {}) => {
	const id = `${tag ? `${tag}-` : ""}modal`;
	return ModalActions.openModal((props) => {
		return /* @__PURE__ */ React.createElement(
			ErrorBoundary, {
				id,
				plugin: Config_default.info.name
			},
			/* @__PURE__ */
			React.createElement(
				ModalRoot_default, {
					onClick: props.onClose,
					transitionState: props.transitionState,
					className: concateClassNames("transparent-background", className),
					size: ModalSize_default.DYNAMIC,
					...modalRootProps
				},
				React.cloneElement(children, { ...props })
			)
		);
	});
};

// src/SpotifyEnhance/components/TrackMediaDetails/TrackBanner.jsx
function TrackBanner() {
	const { bannerLg: bannerObj } = Store.state.getSongBanners();
	const thumbnailClickHandler = () => {
		if (!bannerObj.url) return Toast_default.error("Could not open banner");
		const { url, ...rest } = bannerObj;
		openModal(
			/* @__PURE__ */
			React_default.createElement("div", { className: "spotify-banner-modal" }, /* @__PURE__ */ React_default.createElement(
				ImageComponent, {
					url,
					...fit(rest)
				}
			))
		);
	};
	return /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: "View" }, /* @__PURE__ */ React_default.createElement(
		"div", {
			onClick: thumbnailClickHandler,
			className: "spotify-player-banner"
		}
	));
}

// src/SpotifyEnhance/components/TrackMediaDetails/index.jsx
var TrackMediaDetails_default = ({ name, artists, mediaType }) => {
	if (mediaType !== "track") {
		return /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-media" }, /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-title" }, "Playing ", mediaType || "Unknown"));
	}
	const songUrl = Store.state.getSongUrl();
	const { name: albumName, url: albumUrl, id: albumeId } = Store.state.getAlbum();
	return /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-media" }, /* @__PURE__ */ React_default.createElement(TrackBanner, null), /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: name }, /* @__PURE__ */ React_default.createElement(
		Anchor_default, {
			href: songUrl,
			className: "spotify-player-title ellipsis"
		},
		name
	)), /* @__PURE__ */ React_default.createElement(Artist, { artists }), /* @__PURE__ */ React_default.createElement(
		HoverPopout, {
			popout: (e) => /* @__PURE__ */ React_default.createElement(ContextMenu.Menu, { onClose: e.closePopout }, ContextMenu.buildMenuChildren([{
					className: "spotify-menuitem",
					id: "open-link",
					action: () => Store.Utils.openSpotifyLink(albumUrl),
					icon: ExternalLinkIcon,
					label: "Open externally"
				},
				{
					className: "spotify-menuitem",
					id: "album-play",
					action: () => Store.Api.listen("album", albumeId, albumName),
					icon: ListenIcon,
					label: "Play Album"
				}
			]))
		},
		/* @__PURE__ */
		React_default.createElement("div", { className: "spotify-player-album ellipsis" }, `on ${albumName}`)
	));
};

// src/SpotifyEnhance/components/TrackTimeLine/styles.css
StylesLoader_default.push(`.spotify-player-timeline {
	user-select: none;
	margin-bottom: 2px;
	color:white;
	display: flex;
	flex-wrap: wrap;
	font-size: 0.8rem;
	flex: 1;
}

.spotify-player-timeline-progress {
	flex: 1;
}

.spotify-player-timeline-trackbar {
	cursor: pointer;
}

.spotify-player-timeline:hover .spotify-player-timeline-trackbar-grabber {
	opacity: 1;
}

.spotify-player-timeline .spotify-player-timeline-trackbar-grabber {
	opacity: 0;
	--grabber-size:12px;
	cursor: grab;
}

.spotify-player-timeline .spotify-player-timeline-trackbar-bar {
	background: hsl(0deg 0% 100% / 30%);
}

.spotify-player-timeline .spotify-player-timeline-trackbar-bar > div {
	background: #fff;
	border-radius: 4px;
	box-sizing:border-box;
}

.spotify-player-timeline:hover .spotify-player-timeline-trackbar-bar > div {
	background: var(--SpotifyEnhance-spotify-green);
}`);

// MODULES-AUTO-LOADER:@Modules/Slider
var Slider_default = getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true });

// src/SpotifyEnhance/components/TrackTimeLine/index.jsx
function formatMsToTime(ms) {
	const time = new Date(ms);
	return [time.getUTCHours(), String(time.getUTCMinutes()), String(time.getUTCSeconds()).padStart(2, "0")].filter(Boolean).join(":");
}
var TrackTimeLine_default = () => {
	const [position, duration] = Store((_) => [_.position, _.duration], shallow);
	const sliderRef = React_default.useRef();
	React_default.useEffect(() => {
		if (sliderRef.current?.state?.active) return;
		sliderRef.current?.setState({ value: position < 1e3 ? 0 : position });
	}, [position]);
	const rangeChangeHandler = BdApi.Utils.debounce((e) => {
		if (sliderRef.current?.state?.active) return;
		const pos = Math.floor(e);
		Store.positionInterval.stop();
		Store.state.setPosition(pos);
		Store.Api.seek(pos);
	}, 100);
	return /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-timeline" }, /* @__PURE__ */ React_default.createElement(
		Slider_default, {
			className: "spotify-player-timeline-trackbar",
			mini: true,
			minValue: 0,
			initialValue: position,
			maxValue: duration,
			onValueChange: rangeChangeHandler,
			onValueRender: formatMsToTime,
			ref: sliderRef,
			grabberClassName: "spotify-player-timeline-trackbar-grabber",
			barClassName: "spotify-player-timeline-trackbar-bar"
		}
	), /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-timeline-progress" }, formatMsToTime(position)), /* @__PURE__ */ React_default.createElement(
		Duration, {
			duration,
			position
		}
	));
};

function Duration({ duration, position }) {
	const [toggle, setToggle] = React_default.useState(false);
	const clickHandler = () => setToggle(!toggle);
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			onClick: clickHandler,
			className: "spotify-player-timeline-duration"
		},
		toggle ? `-${formatMsToTime(duration - position)}` : formatMsToTime(duration)
	);
}

// common/Components/icons/ArrowIcon/index.jsx
function Arrow() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			width: 24,
			height: 24,
			viewBox: "0 0 24 24",
			fill: "none",
			xmlns: "http://www.w3.org/2000/svg"
		},
		/* @__PURE__ */
		React.createElement(
			"path", {
				d: "M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z",
				fill: "#ccc"
			}
		)
	);
}

// src/SpotifyEnhance/components/SpotifyPlayer/index.jsx
var SpotifyPlayer_default = React_default.memo(function SpotifyPlayer() {
	const [isActive, media, mediaType] = Store((_) => [_.isActive, _.media, _.mediaType], shallow);
	const [player, playerBannerBackground] = Settings_default((_) => [_.player, _.playerBannerBackground], shallow);
	const [playerCompactMode, setplayerCompactMode] = Settings_default.useSetting("playerCompactMode");
	if (!player || !isActive || !mediaType) return;
	const { bannerMd, bannerSm, bannerLg } = Store.state.getSongBanners();
	let className = "spotify-player-container";
	if (playerCompactMode) className += " compact";
	if (playerBannerBackground) className += " bannerBackground";
	const minmaxClickHandler = () => setplayerCompactMode(!playerCompactMode);
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			className,
			style: {
				"--banner-sm": `url(${bannerSm?.url})`,
				"--banner-md": `url(${bannerMd?.url})`,
				"--banner-lg": `url(${bannerLg?.url})`
			}
		},
		/* @__PURE__ */
		React_default.createElement(
			TrackMediaDetails_default, {
				mediaType,
				name: media?.name,
				artists: media?.artists
			}
		),
		mediaType === "track" && /* @__PURE__ */ React_default.createElement(TrackTimeLine_default, null),
		/* @__PURE__ */
		React_default.createElement(SpotifyPlayerControls_default, null),
		/* @__PURE__ */
		React_default.createElement(Tooltip_default2, { note: playerCompactMode ? "Maximize" : "Minimize" }, /* @__PURE__ */ React_default.createElement(
			"div", {
				onClick: minmaxClickHandler,
				className: "spotify-player-minmax"
			},
			/* @__PURE__ */
			React_default.createElement(Arrow, null)
		))
	);
});

// src/SpotifyEnhance/patches/patchLayer.jsx
var AppLayerContainer = getModuleAndKey((a) => a.displayName === "AppLayerContainer", { searchExports: true });
var Draggable = getBySource("edgeOffsetBottom", "defaultPosition")?.Z;
Plugin_default.on(Events.START, () => {
	if (!AppLayerContainer) return Logger_default.patchError("PIP");
	const { module: module2, key } = AppLayerContainer;
	const unpatch = Patcher.after(module2, key, (_, __, ret) => {
		return [
			ret,
			renderListener(
				/* @__PURE__ */
				React_default.createElement(ErrorBoundary, { id: "PIP" }, /* @__PURE__ */ React_default.createElement("div", { className: "pipContainer" }, /* @__PURE__ */ React_default.createElement(Draggable, null, /* @__PURE__ */ React_default.createElement(SpotifyPlayer_default, null)))),
				[(_2) => [_2.player, _2.spotifyPlayerPlace], shallow],
				([player, place]) => place === PlayerPlaceEnum.PIP && player,
				true
			)
		];
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// src/SpotifyEnhance/patches/patchListenAlong.js
Plugin_default.on(Events.START, () => {
	if (!SpotifyStore_default) return Logger_default.patchError("ListenAlong");
	const unpatch = Patcher.after(SpotifyStore_default, "getActiveSocketAndDevice", (_, __, ret) => {
		if (!Settings_default.getState().enableListenAlong) return;
		if (ret?.socket) ret.socket.isPremium = true;
		return ret;
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// src/SpotifyEnhance/patches/patchMessageComponentAccessories.jsx
var MessageComponentAccessories = getModule(Filters.byPrototypeKeys("renderPoll"), { searchExports: true });
var urlRegex = /((?:https?|steam):\/\/[^\s<]+[^<.,:;"'\]\s])/g;
var MessageStateContext = React.createContext(null);
Plugin_default.on(Events.START, () => {
	if (!MessageComponentAccessories) return Logger_default.patchError("patchMessageComponentAccessories");
	const unpatches = [
		Patcher.before(MessageComponentAccessories.prototype, "renderEmbeds", (_, args) => {
			const message = args[0];
			const urlMatches = message.content.match(urlRegex) || [];
			if (!urlMatches.length) return;
			const embeds = urlMatches.filter(isSpotifyUrl).map((url) => ({
				url,
				"type": "link",
				"provider": {
					"name": "Spotify",
					"url": "https://spotify.com/"
				}
			}));
			if (!embeds.length) return;
			args[0] = Object.assign(args[0], {
				embeds: [...message.embeds.filter((a) => a.provider.name !== "Spotify"), ...embeds]
			});
		}),
		Patcher.after(MessageComponentAccessories.prototype, "renderEmbeds", (_, [message], ret) => {
			if (!ret || !message?.state) return;
			return /* @__PURE__ */ React.createElement(MessageStateContext.Provider, { value: message.state }, ret);
		})
	];
	Plugin_default.once(Events.STOP, () => unpatches.forEach((a) => a?.()));
});

// MODULES-AUTO-LOADER:@Patch/MessageHeader
var MessageHeader_default = getModuleAndKey(Filters.byStrings("userOverride", "withMentionPrefix"), { searchExports: false }) || {};

// MODULES-AUTO-LOADER:@Modules/useStateFromStores
var useStateFromStores_default = getModule(Filters.byStrings("getStateFromStores"), { searchExports: true });

// MODULES-AUTO-LOADER:@Stores/PresenceStore
var PresenceStore_default = getStore("PresenceStore");

// common/Components/icons/SpotifyIcon/index.jsx
function SpotifyIcon(props) {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
			...props
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2ZM16.5625 16.4375C16.3791 16.7161 16.0145 16.8107 15.7188 16.6562C13.375 15.2188 10.4062 14.9062 6.9375 15.6875C6.71979 15.7377 6.49182 15.668 6.33945 15.5046C6.18709 15.3412 6.13348 15.1089 6.19883 14.8952C6.26417 14.6816 6.43854 14.519 6.65625 14.4688C10.4688 13.5938 13.7188 13.9688 16.375 15.5938C16.5149 15.6781 16.6141 15.816 16.6495 15.9755C16.685 16.1349 16.6535 16.3019 16.5625 16.4375ZM17.8125 13.6875C17.7053 13.8622 17.5328 13.9869 17.3333 14.0338C17.1338 14.0807 16.9238 14.0461 16.75 13.9375C14.0625 12.2812 9.96875 11.8125 6.78125 12.7812C6.5133 12.8594 6.22401 12.7887 6.02236 12.5957C5.8207 12.4027 5.73731 12.1168 5.80361 11.8457C5.8699 11.5746 6.0758 11.3594 6.34375 11.2812C9.96875 10.1875 14.5 10.7188 17.5625 12.625C17.9134 12.8575 18.0229 13.3229 17.8125 13.6875ZM17.9062 10.875C14.6875 8.96875 9.375 8.78125 6.28125 9.71875C5.81691 9.79284 5.36952 9.5115 5.23513 9.0609C5.10074 8.61031 5.32093 8.12986 5.75 7.9375C9.28125 6.875 15.1562 7.0625 18.875 9.28125C19.0893 9.40709 19.2434 9.61436 19.3023 9.85577C19.3612 10.0972 19.3198 10.3521 19.1875 10.5625C18.9054 10.9822 18.3499 11.1177 17.9062 10.875Z" })
	);
}

// src/SpotifyEnhance/patches/patchMessageHeader.jsx
function SpotifyActivityIndicator({ userId }) {
	const activityIndicator = Settings_default(Settings_default.selectors.activityIndicator);
	const spotifyActivity = useStateFromStores_default([PresenceStore_default], () => PresenceStore_default.getActivities(userId).find((activity) => activity?.name?.toLowerCase() === "spotify"));
	if (!activityIndicator || !spotifyActivity) return null;
	return /* @__PURE__ */ React.createElement(Tooltip_default2, { note: `${spotifyActivity.details} - ${spotifyActivity.state}` }, /* @__PURE__ */ React.createElement(
		SpotifyIcon, {
			width: "20",
			height: "20",
			class: "spotifyActivityIndicatorIcon"
		}
	));
}
Plugin_default.on(Events.START, () => {
	const { module: module2, key } = MessageHeader_default;
	if (!module2 || !key) return Logger_default.patchError("MessageHeader");
	const unpatch = Patcher.after(module2, key, (_, [{ message }], ret) => {
		const userId = message.author.id;
		ret.props.children.push(
			/* @__PURE__ */
			React.createElement(ErrorBoundary, { id: "SpotifyActivityIndicator" }, /* @__PURE__ */ React.createElement(SpotifyActivityIndicator, { userId }))
		);
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// src/SpotifyEnhance/components/SpotifyActivityControls/styles.css
StylesLoader_default.push(`.spotify-activity-controls {
	display: flex;
	gap: 8px;
	flex: 1;
}

.spotify-activity-btn {
	padding: 0px;
	height: 32px;
	width: 32px;
	flex: 0 0 32px;
}

.spotify-activity-controls .spotify-activity-btn-listen {
	flex: 1 0 0;
	width: 100%;
}`);

// src/SpotifyEnhance/components/SpotifyActivityControls/ActivityControlButton.jsx
function ActivityControlButton({ value, onClick, className, ...rest }) {
	return /* @__PURE__ */ React_default.createElement(
		Button_default2, {
			innerClassName: "flexCenterCenter",
			className: "spotify-activity-btn " + className,
			grow: false,
			size: Button_default2.Sizes.NONE,
			color: Button_default2.Colors.PRIMARY,
			look: Button_default2.Colors.OUTLINED,
			onClick,
			...rest
		},
		value
	);
}

// common/Components/icons/ListenAlongIcon/index.jsx
function ListenAlongIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			width: "24",
			height: "24",
			viewBox: "0 0 24 24"
		},
		/* @__PURE__ */
		React.createElement(
			"path", {
				fill: "currentColor",
				d: "M11.8 14a6.1 6.1 0 0 0 0 6H3v-2c0-2.7 5.3-4 8-4h.8zm-.8-2c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm6 1c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm-1 6.2l3-2.2-3-2.2v4.4z"
			}
		)
	);
}

// src/SpotifyEnhance/components/SpotifyActivityControls/ListenAlong.jsx
function ListenAlong({ userSyncActivityState }) {
	const { disabled, onClick, tooltip } = userSyncActivityState;
	return /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: tooltip }, /* @__PURE__ */ React_default.createElement(
		ActivityControlButton, {
			className: "spotify-activity-btn-listenAlong",
			disabled,
			onClick: (e) => onClick(e),
			value: /* @__PURE__ */ React_default.createElement(ListenAlongIcon, null)
		}
	));
}

// src/SpotifyEnhance/components/SpotifyActivityControls/Play.jsx
function Play({ userPlayActivityState }) {
	const { label, disabled, onClick, tooltip } = userPlayActivityState;
	return /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: tooltip || label }, /* @__PURE__ */ React_default.createElement(
		ActivityControlButton, {
			disabled,
			fullWidth: true,
			className: "spotify-activity-btn-listen",
			value: /* @__PURE__ */ React_default.createElement(ListenIcon, null),
			onClick
		}
	));
}

// src/SpotifyEnhance/components/SpotifyActivityControls/index.jsx
var { useSpotifyPlayAction, useSpotifySyncAction } = getMangled(
	Filters.byStrings("USER_ACTIVITY_PLAY", "spotifyData", "tooltip"), {
		useSpotifyPlayAction: Filters.byStrings("USER_ACTIVITY_PLAY"),
		useSpotifySyncAction: Filters.byStrings("USER_ACTIVITY_SYNC")
	}, { searchExports: true, raw: true }
);
var SpotifyActivityControls_default = ({ activity, user }) => {
	const isActive = Store(Store.selectors.isActive);
	const userSyncActivityState = useSpotifySyncAction(activity, user);
	const userPlayActivityState = useSpotifyPlayAction(activity, user);
	return /* @__PURE__ */ React_default.createElement("div", { className: "spotify-activity-controls" }, /* @__PURE__ */ React_default.createElement(Play, { userPlayActivityState }), /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: "Add to queue" }, /* @__PURE__ */ React_default.createElement(
		ActivityControlButton, {
			className: "spotify-activity-btn-queue",
			value: /* @__PURE__ */ React_default.createElement(AddToQueueIcon, null),
			disabled: !isActive,
			onClick: () => Store.Api.queue("track", activity.sync_id, activity.details)
		}
	)), /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: "Share in current channel" }, /* @__PURE__ */ React_default.createElement(
		ActivityControlButton, {
			className: "spotify-activity-btn-share",
			onClick: () => Store.Utils.share(`https://open.spotify.com/track/${activity.sync_id}`),
			value: /* @__PURE__ */ React_default.createElement(ShareIcon_default, null)
		}
	)), /* @__PURE__ */ React_default.createElement(ListenAlong, { userSyncActivityState }));
};

// src/SpotifyEnhance/patches/patchSpotifyActivity.jsx
var ActivityComponent = getModuleAndKey(Filters.byStrings("PRESS_LISTEN_ALONG_ON_SPOTIFY_BUTTON", "PRESS_PLAY_ON_SPOTIFY_BUTTON"));
Plugin_default.on(Events.START, () => {
	const { module: module2, key } = ActivityComponent;
	if (!module2 || !key) return Logger_default.patchError("SpotifyActivityComponent");
	const unpatch = Patcher.after(module2, key, (_, [{ user, activity }]) => {
		if (!Settings_default.getState().activity) return;
		if (activity?.name.toLowerCase() !== "spotify") return;
		return /* @__PURE__ */ React.createElement(ErrorBoundary, { id: "SpotifyEmbed" }, /* @__PURE__ */ React.createElement(
			SpotifyActivityControls_default, {
				user,
				activity
			}
		));
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// src/SpotifyEnhance/components/SpotifyControls/styles.css
StylesLoader_default.push(`.spotify-embed-plus {
	display: flex;
	min-width: 400px;
	max-width: 100%;
	gap: 5px;
	overflow: hidden;
}

.spotify-embed-plus > button {
	flex: 1 0 auto;
	text-transform: capitalize;
}`);

// src/SpotifyEnhance/components/SpotifyControls/ControlBtn.jsx
function ControlBtn({ value, onClick, ...rest }) {
	return /* @__PURE__ */ React_default.createElement(
		Button_default2, {
			size: Button_default2.Sizes.TINY,
			color: Button_default2.Colors.GREEN,
			onClick,
			...rest
		},
		value
	);
}

// src/SpotifyEnhance/components/SpotifyControls/index.jsx
var SpotifyControls_default = ({ id, type, embed: { thumbnail, rawTitle, url } }) => {
	const isActive = Store(Store.selectors.isActive);
	const listenBtn = type !== "show" && /* @__PURE__ */ React_default.createElement(
		ControlBtn, {
			disabled: !isActive,
			value: "play on spotify",
			onClick: () => Store.Api.listen(type, id, rawTitle)
		}
	);
	const queueBtn = (type === "track" || type === "episode") && /* @__PURE__ */ React_default.createElement(
		ControlBtn, {
			disabled: !isActive,
			value: "add to queue",
			onClick: () => Store.Api.queue(type, id, rawTitle)
		}
	);
	return /* @__PURE__ */ React_default.createElement("div", { className: "spotify-embed-plus" }, listenBtn, queueBtn, /* @__PURE__ */ React_default.createElement(
		ControlBtn, {
			value: "copy link",
			onClick: () => Store.Utils.copySpotifyLink(url)
		}
	), /* @__PURE__ */ React_default.createElement(
		ControlBtn, {
			value: "copy banner",
			onClick: () => Store.Utils.copySpotifyLink(thumbnail?.url || thumbnail?.proxyURL)
		}
	));
};

// src/SpotifyEnhance/components/SpotifyEmbed/styles.css
StylesLoader_default.push(`.spotify-embed-container {
	background:
		linear-gradient(#00000090 0 0),
		var(--banner-lg) top center/999% no-repeat;
	max-width: 100%;
	width: 350px;
	box-sizing: border-box;
	padding: var(--SpotifyEnhance-gutter);
	border-radius: var(--SpotifyEnhance-radius);
	font-family: var(--SpotifyEnhance-font);

	display: grid;
	column-gap: var(--SpotifyEnhance-gutter);
	grid-template-columns: auto minmax(0, 1fr) auto;
	grid-template-rows: auto auto minmax(0, 1fr);
	grid-template-areas:
		"thumbnail title icon"
		"thumbnail description ."
		"thumbnail controls .";
}

.spotify-embed-thumbnail {
	grid-area: thumbnail;
	cursor: pointer;
	width: 80px;
	height: 80px;
	background: var(--banner-sm, var(--banner-lg)) center/cover no-repeat;
	border-radius: var(--SpotifyEnhance-radius);
}

.spotify-embed-container.playing .spotify-embed-thumbnail {
	border-radius: 50%;
	position: relative;
	box-shadow: 0 0 0 0 #0008;
	animation:
		r 10s linear infinite,
		b 1.5s infinite linear;
	position: relative;
}

.spotify-embed-container.playing .spotify-embed-thumbnail:after {
	content: "";
	position: absolute;
	inset: 0;
	border-radius: inherit;
	box-shadow: 0 0 0 0 #0004;
	animation: inherit;
	animation-delay: -0.5s;
}


.spotify-embed-container.bannerBackground {
	transform: translate(0);
	border: 1px solid rgba(43, 45, 49, 0.9);
	background: unset;
	overflow: hidden;
}

.spotify-embed-container.bannerBackground:before {
	content: "";
	background:
		linear-gradient(#000000a0 0 0),
		var(--banner-lg) center/cover no-repeat;
	position: absolute;
	inset: 0px;
	filter: blur(5px);
	z-index: -1;
}

.spotify-embed-title {
	grid-area: title;

	font-weight: bold;
	color: #fff;
	margin: 0;
	margin-top: 3px;
	align-self: center;

	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.spotify-embed-description {
	grid-area: description;

	font-weight: 500;
	margin: 0;
	margin-top: 3px;
	color: var(--SpotifyEnhance-text-sub);
	font-size: 0.7rem;

	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.spotify-embed-controls {
	grid-area: controls;
	height: 30px;
	display: flex;
	align-self: center;
	gap: var(--SpotifyEnhance-gutter);
}

.spotify-embed-btn {
	background: #0000004d;
	cursor: pointer;
	display: flex;
	align-items: center;
	padding: 6px;
	border-radius: 50%;
	color: #fff;
	box-sizing: border-box;
}

.spotify-embed-btn svg {
	width: 18px;
	height: 18px;
}

.spotify-embed-spotifyIcon {
	grid-area: icon;
	cursor: pointer;
	display: flex;
	color: var(--SpotifyEnhance-spotify-green);
}


@keyframes r {
	to {
		rotate: 360deg;
	}
}

@keyframes b {
	100% {
		box-shadow: 0 0 0 20px #0000;
	}
}

`);

// common/Components/icons/CopyIcon/index.jsx
function CopyIcon() {
	return /* @__PURE__ */ React.createElement(
		"svg", {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24"
		},
		/* @__PURE__ */
		React.createElement("path", { d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z" }),
		/* @__PURE__ */
		React.createElement("path", { d: "M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z" })
	);
}

// src/SpotifyEnhance/components/SpotifyEmbed/PreviewPlayer.jsx
var audioPlayer = class {
	constructor(src) {
		this.src = src;
		this.loaded = false;
	}
	init() {
		if (this.loaded || this.failed) return;
		this.audio = new Audio(this.src);
		this.audio.volume = 0.1;
		this.audio.onloadeddata = () => {
			this.loaded = true;
			this.loading = false;
			this.audio.play();
		};
		this.audio.onerror = () => {
			this.failed = true;
			Toast_default.error("Could not load preview");
		};
		this.audio.onended = () => {
			this.onended?.();
		};
	}
	play() {
		this.init();
		this.play = this.audio.play.bind(this.audio);
	}
	pause() {
		this.audio.pause();
	}
	dispose() {
		if (!this.audio) return;
		this.audio.pause();
		this.audio.onloadeddata = null;
		this.audio.onerror = null;
		this.audio.onended = null;
		this.audio = null;
	}
};
var PreviewPlayer_default = class extends React_default.Component {
	state = {
		isPlaying: false
	};
	constructor() {
		super();
		this.playHandler = this.playHandler.bind(this);
		this.pauseHandler = this.pauseHandler.bind(this);
	}
	componentDidMount() {
		this.audio = new audioPlayer(this.props.src);
		this.audio.onended = this.pauseHandler;
	}
	componentWillUnmount() {
		this.audio.onended = null;
		this.audio.dispose();
		this.audio = null;
	}
	playHandler() {
		this.setState({ isPlaying: true });
		this.audio.play();
	}
	pauseHandler() {
		this.setState({ isPlaying: false });
		this.audio.pause();
	}
	render() {
		const { playPauseTooltip, playPauseHandler, playPauseIcon, playPauseClassName } = {
			true: {
				playPauseTooltip: "Pause preview",
				playPauseClassName: "spotify-embed-btn spotify-embed-preview-pause",
				playPauseHandler: this.pauseHandler,
				playPauseIcon: /* @__PURE__ */ React_default.createElement(PauseIcon, null)
			},
			false: {
				playPauseTooltip: "Play preview",
				playPauseClassName: "spotify-embed-btn spotify-embed-preview-play",
				playPauseHandler: this.playHandler,
				playPauseIcon: /* @__PURE__ */ React_default.createElement(PlayIcon, null)
			}
		} [this.state.isPlaying];
		return /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: playPauseTooltip }, /* @__PURE__ */ React_default.createElement(
			"div", {
				onClick: playPauseHandler,
				className: playPauseClassName
			},
			playPauseIcon
		));
	}
};

// src/SpotifyEnhance/components/SpotifyEmbed/index.jsx
function useGetRessource(type, id) {
	const [state, setState] = React_default.useState(null);
	React_default.useEffect(() => {
		(async () => {
			const data = await Store.Api.getRessource(type, id);
			if (data) setState(data);
		})();
	}, []);
	return state;
}
var SpotifyEmbed_default = ({ id, type }) => {
	const data = useGetRessource(type, id);
	const { thumbnail, rawTitle, rawDescription, url, preview_url } = data || {};
	const embedBannerBackground = Settings_default(Settings_default.selectors.embedBannerBackground);
	const useReducedMotion = useStateFromStores_default([AccessibilityStore_default], () => AccessibilityStore_default.useReducedMotion);
	const [isPlaying, isActive] = Store((_) => [_.isPlaying, _.isActive], shallow);
	const mediaId = Store(Store.selectors.mediaId, (n, o) => n === o || n !== id && o !== id);
	const isThis = mediaId === id;
	const listenBtn = type !== "show" && /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: `Play ${type}` }, /* @__PURE__ */ React_default.createElement(
		"div", {
			onClick: () => Store.Api.listen(type, id, rawTitle),
			className: "spotify-embed-btn spotify-embed-btn-listen"
		},
		/* @__PURE__ */
		React_default.createElement(ListenIcon, null)
	));
	const queueBtn = (type === "track" || type === "episode") && /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: `Add ${type} to queue` }, /* @__PURE__ */ React_default.createElement(
		"div", {
			onClick: () => Store.Api.queue(type, id, rawTitle),
			className: "spotify-embed-btn spotify-embed-btn-addToQueue"
		},
		/* @__PURE__ */
		React_default.createElement(AddToQueueIcon, null)
	));
	let className = "spotify-embed-container";
	if (isThis && isPlaying && !useReducedMotion) className += " playing";
	if (embedBannerBackground) className += " bannerBackground";
	const banner = {
		bannerSm: thumbnail?.[2],
		bannerMd: thumbnail?.[1],
		bannerLg: thumbnail?.[0]
	};
	const bannerStyleObj = {};
	if (banner.bannerSm) bannerStyleObj["--banner-sm"] = `url(${banner.bannerSm?.url})`;
	if (banner.bannerMd) bannerStyleObj["--banner-md"] = `url(${banner.bannerMd?.url})`;
	if (banner.bannerLg) bannerStyleObj["--banner-lg"] = `url(${banner.bannerLg?.url})`;
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			className,
			style: bannerStyleObj
		},
		/* @__PURE__ */
		React_default.createElement(Tooltip_default2, { note: "View" }, /* @__PURE__ */ React_default.createElement(
			"div", {
				onClick: () => {
					const { url: url2, ...rest } = banner.bannerLg;
					openModal(
						/* @__PURE__ */
						React_default.createElement("div", { className: "spotify-banner-modal" }, /* @__PURE__ */ React_default.createElement(
							ImageComponent, {
								url: url2,
								...fit(rest)
							}
						))
					);
				},
				className: "spotify-embed-thumbnail"
			}
		)),
		/* @__PURE__ */
		React_default.createElement(Tooltip_default2, { note: rawTitle }, /* @__PURE__ */ React_default.createElement("h2", { className: "spotify-embed-title" }, rawTitle)),
		/* @__PURE__ */
		React_default.createElement(Tooltip_default2, { note: rawDescription }, /* @__PURE__ */ React_default.createElement("p", { className: "spotify-embed-description" }, rawDescription)),
		type && id && /* @__PURE__ */ React_default.createElement("div", { className: "spotify-embed-controls" }, (isThis && isActive && !isPlaying || !isThis && isActive) && [listenBtn, queueBtn], isThis && isActive && isPlaying && /* @__PURE__ */ React_default.createElement(TrackTimeLine_default, null), /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: "Copy link" }, /* @__PURE__ */ React_default.createElement(
			"div", {
				onClick: () => Store.Utils.copySpotifyLink(url),
				className: "spotify-embed-btn spotify-embed-btn-copy"
			},
			/* @__PURE__ */
			React_default.createElement(CopyIcon, null)
		)), /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: "Copy banner" }, /* @__PURE__ */ React_default.createElement(
			"div", {
				onClick: () => Store.Utils.copySpotifyLink(banner.bannerLg?.url),
				className: "spotify-embed-btn spotify-embed-btn-copy"
			},
			/* @__PURE__ */
			React_default.createElement(ImageIcon, null)
		)), preview_url && /* @__PURE__ */ React_default.createElement(PreviewPlayer_default, { src: preview_url })),
		/* @__PURE__ */
		React_default.createElement(Tooltip_default2, { note: "Play on Spotify" }, /* @__PURE__ */ React_default.createElement(
			"div", {
				onClick: () => Store.Utils.openSpotifyLink(url),
				className: "spotify-embed-spotifyIcon"
			},
			/* @__PURE__ */
			React_default.createElement(SpotifyIcon, null)
		))
	);
};

// src/SpotifyEnhance/components/SpotifyEmbedWrapper/index.jsx
function SpotifyEmbedWrapper({ id, type, embedObject, embedComponent }) {
	const spotifyEmbed = Settings_default(Settings_default.selectors.spotifyEmbed);
	switch (spotifyEmbed) {
		case EmbedStyleEnum.KEEP:
			return [
				embedComponent,
				// eslint-disable-next-line react/jsx-key
				/* @__PURE__ */
				React_default.createElement(
					SpotifyControls_default, {
						id,
						type,
						embed: embedObject
					}
				)
			];
		case EmbedStyleEnum.REPLACE:
			return /* @__PURE__ */ React_default.createElement(
				SpotifyEmbed_default, {
					id,
					type
				}
			);
		case EmbedStyleEnum.HIDE:
			return /* @__PURE__ */ React_default.createElement(
				SpotifyControls_default, {
					id,
					type,
					embed: embedObject
				}
			);
	}
	return embedComponent;
}

// src/SpotifyEnhance/patches/patchSpotifyEmbed.jsx
var SpotifyEmbed = getModule(Filters.byStrings("iframe", "playlist", "track"), { defaultExport: false });
Plugin_default.on(Events.START, () => {
	if (!SpotifyEmbed) return Logger_default.patchError("SpotifyEmbed");
	const unpatch = Patcher.after(SpotifyEmbed, "Z", (_, [{ embed }], ret) => {
		const messageState = React.useContext(MessageStateContext);
		if (messageState !== "SENT") return null;
		const [id, type] = parseSpotifyUrl(embed.url) || [];
		if (!ALLOWD_TYPES.includes(type)) return;
		return /* @__PURE__ */ React.createElement(
			ErrorBoundary, {
				id: "SpotifyEmbed",
				fallback: ret
			},
			/* @__PURE__ */
			React.createElement(
				SpotifyEmbedWrapper, {
					id,
					type,
					embedComponent: ret,
					embedObject: embed
				}
			)
		);
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// src/SpotifyEnhance/patches/patchSpotifyPlayer.jsx
async function cleanFluxContainer() {
	const fluxContainer = await getFluxContainer();
	if (fluxContainer) fluxContainer.stateNode.forceUpdate();
}
Plugin_default.on(Events.START, async () => {
	const fluxContainer = await getFluxContainer();
	if (!fluxContainer) return Logger_default.patchError("SpotifyPlayer");
	const unpatch = Patcher.after(fluxContainer.type.prototype, "render", (_, __, ret) => {
		return [
			renderListener(
				/* @__PURE__ */
				React.createElement(ErrorBoundary, { id: "SpotifyPlayer" }, /* @__PURE__ */ React.createElement(SpotifyPlayer_default, null)),
				[(_2) => [_2.player, _2.spotifyPlayerPlace], shallow],
				([player, place]) => place === PlayerPlaceEnum.USERAREA && player,
				true
			),
			ret
		];
	});
	fluxContainer.stateNode.forceUpdate();
	Plugin_default.once(Events.STOP, () => {
		unpatch();
		cleanFluxContainer();
	});
});

// src/SpotifyEnhance/patches/patchSpotifySocket.js
function getSocketConstructor() {
	const playableComputerDevices = SpotifyStore_default.getPlayableComputerDevices() || [];
	return playableComputerDevices[0]?.socket?.constructor;
}

function getSocket() {
	const socket = getSocketConstructor();
	if (socket) return Promise.resolve(socket);
	return new Promise((resolve) => {
		function listener() {
			try {
				const socket2 = getSocketConstructor();
				if (!socket2) return;
				SpotifyStore_default.removeChangeListener(listener);
				resolve(socket2);
			} catch (e) {
				Logger_default.error(e);
			}
		}
		SpotifyStore_default.addChangeListener(listener);
	});
}
Plugin_default.on(Events.START, async () => {
	const socket = await getSocket();
	const unpatch = Patcher.after(socket.prototype, "handleEvent", function onSocketEvent(socket2, [socketEvent]) {
		Logger_default.log("Spotify Socket", socketEvent, Date.now());
		if (Store.state.account?.accountId && socket2.accountId !== Store.state.account?.accountId) return;
		const { type, event } = socketEvent;
		switch (type) {
			case "PLAYER_STATE_CHANGED":
				Store.state.setPlayerState(event.state);
				break;
			case "DEVICE_STATE_CHANGED": {
				const devices = event.devices;
				const isActive = !!(devices.find((d) => d.is_active) || devices[0])?.is_active;
				Store.state.setDeviceState(isActive);
				if (!isActive) Store.state.setPlayerState({});
				break;
			}
		}
	});
	Plugin_default.once(Events.STOP, unpatch);
});

// common/Components/Collapsible/styles.css
StylesLoader_default.push(`.collapsible-container {
	border-radius: 5px;
	border: 1px solid rgb(30, 31, 34);
	gap: 0px 20px;
	display: grid;
	grid-template-rows: min-content 0fr;
	transition: grid-template-rows 200ms linear;
}

.collapsible-header {
	background: rgba(30, 31, 34, 0.3);
	padding: 10px 3px;
	gap: 8px;
	display: flex;
	align-items: center;
}

.collapsible-icon {
	display: flex;
	flex-grow: 0;
	rotate: 0deg;
	transition: rotate 150ms linear;
}

.collapsible-title {
	text-transform: capitalize;
}

.collapsible-body {
	margin: 0 10px;
	transition: margin 0ms 200ms;
	overflow: hidden;
}

.collapsible-container.collapsible-open .collapsible-body{
	margin: 10px;
	transition: none;
}

.collapsible-container.collapsible-open {
	grid-template-rows: min-content 1fr;
}

.collapsible-container.collapsible-open .collapsible-header {
	border-bottom: 1px solid rgb(30, 31, 34);
}

.collapsible-container.collapsible-open .collapsible-icon {
	rotate: 90deg;
}`);

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true });

// common/Components/Collapsible/index.jsx
function Collapsible({ title, children }) {
	const [open, setOpen] = React.useState(false);
	return /* @__PURE__ */ React.createElement("div", { className: open ? "collapsible-container collapsible-open" : "collapsible-container" }, /* @__PURE__ */ React.createElement(
		"div", {
			className: "collapsible-header",
			onClick: () => setOpen(!open)
		},
		/* @__PURE__ */
		React.createElement("div", { className: "collapsible-icon" }, /* @__PURE__ */ React.createElement(Arrow, null)),
		/* @__PURE__ */
		React.createElement(
			Heading_default, {
				className: "collapsible-title",
				tag: "h5"
			},
			title
		)
	), /* @__PURE__ */ React.createElement("div", { className: "collapsible-body" }, children));
}

// common/Components/Gap/index.jsx
function Gap({ direction, gap, className }) {
	const style = {
		VERTICAL: {
			width: gap,
			height: "100%"
		},
		HORIZONTAL: {
			height: gap,
			width: "100%"
		}
	} [direction];
	return /* @__PURE__ */ React.createElement("div", { style, className });
}
Gap.direction = {
	HORIZONTAL: "HORIZONTAL",
	VERTICAL: "VERTICAL"
};

// MODULES-AUTO-LOADER:@Modules/FormSwitch
var FormSwitch_default = getModule(Filters.byStrings("note", "tooltipNote"), { searchExports: true });

// common/Components/Switch/index.jsx
var Switch_default = FormSwitch_default || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("div", { style: { color: "#fff" } }, props.children, /* @__PURE__ */ React.createElement(
		"input", {
			type: "checkbox",
			checked: props.value,
			onChange: (e) => props.onChange(e.target.checked)
		}
	));
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ settingKey, note, onChange = nop, hideBorder = false, description, ...rest }) {
	const [val, set] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React.createElement(
		Switch_default, {
			...rest,
			value: val,
			note,
			hideBorder,
			onChange: (e) => {
				set(e);
				onChange(e);
			}
		},
		description || settingKey
	);
}

// MODULES-AUTO-LOADER:@Modules/RadioGroup
var RadioGroup_default = getModule((a) => a?.Sizes?.NOT_SET === "", { searchExports: true });

// src/SpotifyEnhance/components/SettingComponent/index.jsx
function SpotifyEmbedOptions() {
	const [val, set] = Settings_default.useSetting("spotifyEmbed");
	return /* @__PURE__ */ React_default.createElement(
		RadioGroup_default, {
			options: [{
					value: EmbedStyleEnum.KEEP,
					name: "Keep: Use original Spotify Embed"
				},
				{
					value: EmbedStyleEnum.REPLACE,
					name: "Replace: A less laggy Spotify Embed"
				},
				{
					value: EmbedStyleEnum.HIDE,
					name: "Hide: Completely remove spotify embed"
				}
			],
			orientation: "horizontal",
			value: val,
			onChange: (e) => set(e.value)
		}
	);
}

function SpotifyPLayerOptions() {
	const [val, set] = Settings_default.useSetting("spotifyPlayerPlace;");
	return /* @__PURE__ */ React_default.createElement(
		RadioGroup_default, {
			options: [{
					value: PlayerPlaceEnum.PIP,
					name: "PIP: place the player in a draggable picture-in-picture"
				},
				{
					value: PlayerPlaceEnum.USERAREA,
					name: "USERAREA: place the player in the user area (bottom left)"
				}
			],
			orientation: "horizontal",
			value: val,
			onChange: (e) => {
				set(e.value);
			}
		}
	);
}

function SettingComponent() {
	return /* @__PURE__ */ React_default.createElement("div", { className: `${Config_default.info.name}-settings` }, /* @__PURE__ */ React_default.createElement(Collapsible, { title: "miscellaneous" }, [{
			settingKey: "player",
			description: "Enable/Disable player.",
			hideBorder: true
		},
		{
			settingKey: "enableListenAlong",
			description: "Enables/Disable listen along without premium.",
			hideBorder: true
		},
		{
			settingKey: "activity",
			description: "Modify Spotify activity.",
			hideBorder: true
		},
		{
			settingKey: "activityIndicator",
			description: "Show user's Spotify activity in chat.",
			hideBorder: true
		},
		{
			settingKey: "playerCompactMode",
			description: "Player compact mode",
			hideBorder: true
		},
		{
			settingKey: "playerBannerBackground",
			description: "Use the banner as background for the player.",
			hideBorder: true
		},
		{
			settingKey: "embedBannerBackground",
			description: "Use the banner as background for the embed.",
			hideBorder: true,
			style: { marginBottom: 0 }
		}
	].map(SettingSwtich)), /* @__PURE__ */ React_default.createElement(
		Gap, {
			direction: Gap.direction.HORIZONTAL,
			gap: 5
		}
	), /* @__PURE__ */ React_default.createElement(Collapsible, { title: "Show/Hide Player buttons" }, [
		{ settingKey: PlayerButtonsEnum.SHARE, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.SHUFFLE, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.PREVIOUS, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.PLAY, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.NEXT, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.REPEAT, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.VOLUME, hideBorder: true, style: { marginBottom: 0 } }
	].map(SettingSwtich)), /* @__PURE__ */ React_default.createElement(
		Gap, {
			direction: Gap.direction.HORIZONTAL,
			gap: 5
		}
	), /* @__PURE__ */ React_default.createElement(Collapsible, { title: "Spotify embed style" }, /* @__PURE__ */ React_default.createElement(SpotifyEmbedOptions, null)), /* @__PURE__ */ React_default.createElement(
		Gap, {
			direction: Gap.direction.HORIZONTAL,
			gap: 5
		}
	), /* @__PURE__ */ React_default.createElement(Collapsible, { title: "Spotify player placement" }, /* @__PURE__ */ React_default.createElement(SpotifyPLayerOptions, null)));
}

// src/SpotifyEnhance/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent, null);
module.exports = () => Plugin_default;
