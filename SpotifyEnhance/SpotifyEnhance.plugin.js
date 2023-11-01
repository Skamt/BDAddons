/**
 * @name SpotifyEnhance
 * @description All in one better spotify-discord experience.
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/SpotifyEnhance
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/SpotifyEnhance/SpotifyEnhance.plugin.js
 */

const config = {
	"info": {
		"name": "SpotifyEnhance",
		"version": "1.0.0",
		"description": "All in one better spotify-discord experience.",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/SpotifyEnhance/SpotifyEnhance.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/SpotifyEnhance",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"spotifyEmbed": "keep"
	}
}

const css = `

:root {
	--spotify-green: #1ed760;
	--text-normal: #fff;
	--text-sub: #a7a7a7;
	--radius: 8px;
	--icon-size: 18px;
	--gutter: 10px;
	--font: gg sans, Helvetica Neue, helvetica, arial, Hiragino Kaku Gothic Pro, Meiryo, MS Gothic;
	--accent: #1ed760;
}

/* Spotify Indicator */

.spotifyActivityIndicatorIcon {
	color: var(--spotify-green);
	vertical-align: text-bottom;
	margin: 0 0 0 0.5rem;
}

[class^="repliedMessage"] .spotifyActivityIndicatorIcon {
	margin: 0 0.25rem 0 0;
}

/* Spotify Embed */
.spotifyEmbed-Container {
	background:
		linear-gradient(#00000090 0 0),
		var(--thumbnail) top center/9999% no-repeat;
	max-width: 350px;
	min-width: 350px;
	padding: var(--gutter);
	border-radius: var(--radius);
	font-family: var(--font);

	display: grid;
	column-gap: var(--gutter);
	grid-template-columns: auto minmax(0, 1fr) auto;
	grid-template-rows: auto auto minmax(0, 1fr);
	grid-template-areas:
		"thumbnail title icon"
		"thumbnail description ."
		"thumbnail controls .";
}

.spotifyEmbed-thumbnail {
	grid-area: thumbnail;

	width: 80px;
	height: 80px;
	background: var(--thumbnail) center/cover no-repeat;
	border-radius: var(--radius);
}

.spotifyEmbed-title {
	grid-area: title;

	font-weight: bold;
	color: var(--text-normal);
	margin: 0;
	margin-top: 3px;
	align-self: center;

	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.spotifyEmbed-description {
	grid-area: description;

	font-weight: 500;
	margin: 0;
	margin-top: 3px;
	color: var(--text-sub);
	font-size: 0.7rem;

	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.spotifyEmbed-controls {
	grid-area: controls;
	height: 30px;
	display: flex;
	align-self: center;
	gap: var(--gutter);
}

.spotifyEmbed-btn {
	background: #0000004d;
	cursor: pointer;
	display: flex;
	align-items: center;
	padding: 6px;
	border-radius: 50%;
	color: #fff;
	box-sizing: border-box;
}

.spotifyEmbed-btn svg {
	width: var(--icon-size);
	height: var(--icon-size);
}

.spotifyEmbed-spotifyIcon {
	grid-area: icon;
	cursor: pointer;
	display: flex;
	color: var(--spotify-green);
}

/* spotify activity controls */
.spotify-activity-controls {
	display: flex;
	margin-top: 10px;
	gap: 8px;
}

.spotify-activity-controls svg {
	width: 18px;
	height: 18px;
}

.spotify-activity-controls button > div {
	font-size: 0;
	line-height: 1;
}

.spotify-activity-controls button {
	padding: 3px 6px !important;
}

.spotify-activity-controls > :first-child {
	flex: 1;
}

/* Spotify Player */
.spotify-player-container {
	padding: 10px 10px;

	display: flex;
	flex-direction: column;
}

.spotify-player-media {
	color: white;
	font-size: 0.9rem;

	display: grid;
	column-gap: 10px;
	grid-template-columns: 64px 1fr;
	grid-template-rows: repeat(3, auto);
	align-items: center;
	
	grid-template-areas:
		"banner title"
		"banner artist"
		"banner album";
}

.spotify-player-banner {
	grid-area: banner;
	cursor: pointer;
	width: 64px;
	height: 64px;
	background: var(--banner) center/cover no-repeat, lime;
	border-radius: 5px;
}

.spotify-player-title {
	grid-area: title;
	font-weight: bold;
	color: #fff;
	font-size:1.05rem;
	
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.spotify-player-artist {
	grid-area: artist;
	font-size: 0.8rem;
	--text-link: var(--text-sub);

	overflow: hidden;
	text-overflow: ellipsis;
}

.spotify-player-album {
	grid-area: album;
	--text-link: var(--text-sub);

	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.spotify-player-controls {
	display: flex;
	justify-content: space-between;
	width: 100%;
	overflow: hidden;
}

.spotify-player-controls button > div {
	font-size: 0;
	line-height: 1;
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
	color: var(--spotify-green);
}

.spotify-player-timeline {
	margin-bottom: 2px;
	color: white;
	display: flex;
	flex-wrap: wrap;
	font-size: 0.8rem;
	flex:1;
}

.spotify-player-timeline-progress {
	flex: 1;
}

.spotify-player-timeline-trackbar {
	margin-top: -8px;
	margin-bottom: 8px;
	cursor: pointer;
}

.spotify-player-timeline:hover .spotify-player-timeline-trackbar-grabber {
	opacity: 1;
}

.spotify-player-timeline .spotify-player-timeline-trackbar-grabber {
	opacity: 0;
	cursor: grab;
	width: 10px;
	height: 10px;
	margin-top: 4px;
}

 .spotify-player-timeline .spotify-player-timeline-trackbar-bar {
	background: hsl(0deg 0% 100% / 30%);
	height: 6px;
}

.spotify-player-timeline .spotify-player-timeline-trackbar-bar > div {
	background: #fff;
	border-radius: 4px;
}

.spotify-player-timeline:hover .spotify-player-timeline-trackbar-bar > div {
	background: var(--spotify-green);
}

.spotify-player-container {
	background: hsl(228 8% 12%);
	border-bottom: 1px solid hsl(228deg 6% 33% / 48%);
}

.spotify-player-controls-volume-slider-wrapper {
	box-sizing: border-box;
	background: #000;
	width: 100px;
	height: 22px;
	padding: 2px 5px;
	border-radius: 999px;
}

.spotify-player-controls-volume-slider {
	width: 100%;
	box-sizing: border-box;
	position: relative;
	top: -10px;
}

.spotify-player-controls-volume-slider-wrapper .spotify-player-controls-volume-slider-grabber {
	width: 10px;
	height: 10px;
	margin-top: 3px;
	cursor: pointer;
}

.spotify-player-controls-volume-slider-wrapper .spotify-player-controls-volume-slider-bar {
	height: 4px;
}

.spotify-player-controls-volume-slider-wrapper .spotify-player-controls-volume-slider-bar > div {
	background: var(--spotify-green);
}`;

const Logger = {
	error(...args) {
		this.p(console.error, ...args);
	},
	patch(patchId) {
		console.error(`%c[${config.info.name}] %c Error at %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
	},
	log(...args) {
		this.p(console.log, ...args);
	},
	p(target, ...args) {
		target(`%c[${config.info.name}]`, "color: #3a71c1;font-weight: bold;", ...args);
	}
};

const Api = new BdApi(config.info.name);

const UI = Api.UI;
const DOM = Api.DOM;
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;
const getInternalInstance = Api.ReactUtils.getInternalInstance;

class ChangeEmitter {
	constructor() {
		this.listeners = new Set();
	}

	isInValid(handler) {
		return !handler || typeof handler !== "function";
	}

	on(handler) {
		if (this.isInValid(handler)) return;
		this.listeners.add(handler);
		return () => this.off(handler);
	}

	off(handler) {
		if (this.isInValid(handler)) return;
		this.listeners.delete(handler);
	}

	emit(payload) {
		for (const listener of this.listeners) {
			try {
				listener(payload);
			} catch (err) {
				console.error(`Could not run listener`, err);
			}
		}
	}
}

const Settings = new(class Settings extends ChangeEmitter {
	constructor() {
		super();
	}

	init(defaultSettings) {
		this.settings = Data.load("settings") || defaultSettings;
	}

	get(key) {
		return this.settings[key];
	}

	set(key, val) {
		this.settings[key] = val;
		this.commit();
	}

	setMultiple(newSettings) {
		this.settings = Object.assign(this.settings, newSettings);
		this.commit();
	}

	commit() {
		Data.save("settings", this.settings);
		this.emit();
	}
})();

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return undefined;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return undefined;
	return { module, key };
}

const SpotifyStore = getModule(m => m._dispatchToken && m.getName() === "SpotifyStore");

const patchListenAlong = () => {
	if (SpotifyStore)
		Patcher.after(SpotifyStore, "getActiveSocketAndDevice", (_, __, ret) => {
			if (ret?.socket) ret.socket.isPremium = true;
			return ret;
		});
	else Logger.patch("ListenAlong");
};

class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };

	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}

	renderErrorBoundary() {
		return (
			React.createElement('div', { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" }, }, React.createElement('b', { style: { color: "#e0e1e5" }, }, "An error has occured while rendering ", React.createElement('span', { style: { color: "orange" }, }, this.props.id)))
		);
	}

	renderFallback() {
		if (React.isValidElement(this.props.fallback)) {
			if (this.props.passMetaProps)
				this.props.fallback.props = {
					id: this.props.id,
					plugin: this.props.plugin,
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return (
			React.createElement(this.props.fallback, {
				id: this.props.id,
				plugin: this.props.plugin,
			})
		);
	}

	render() {
		if (!this.state.hasError) return this.props.children;
		return this.props.fallback ? this.renderFallback() : this.renderErrorBoundary();
	}
}

const EmbedComponent = getModule(m => m.prototype.getSpoilerStyles, { searchExports: false });

const EmbedStyleEnum = {
	KEEP: "KEEP",
	REPLACE: "REPLACE",
	HIDE: "HIDE"
};

function useSettings(key) {
	const target = Settings.get(key);
	const [state, setState] = React.useState(target);
	React.useEffect(() => {
		function settingsChangeHandler() {
			const newVal = Settings.get(key);
			setState(newVal);
		}
		return Settings.on(settingsChangeHandler);
	}, []);

	return state;
}

function usePropBasedState(prop) {
	const [state, setState] = React.useState(prop);
	React.useEffect(() => {
		setState(prop);
	}, [prop]);

	return [state, setState];
}

const TheBigBoyBundle = getModule(Filters.byProps("openModal", "FormSwitch", "Anchor"), { searchExports: false });

const Button = TheBigBoyBundle.Button ||
	function ButtonComponentFallback(props) {
		return React.createElement('button', { ...props, });
	};

const FluxHelpers = getModule(Filters.byProps("useStateFromStores"), { searchExports: false });

const activityPanelClasses = getModule(Filters.byProps("activityPanel", "panels"), { searchExports: false });

function parseSpotifyUrl(url) {
	if (typeof url !== "string") return undefined;
	const [, type, id] = url.match(/https?:\/\/open.spotify.com\/(\w+)\/(\w+)/) || [];
	return [type, id];
}

function getFluxContainer() {
	const el = document.querySelector(`.${activityPanelClasses.panels}`);
	if (!el) return;
	const instance = getInternalInstance(el);
	if (!instance) return;
	return instance.child;
}

function sanitizeSpotifyLink(link) {
	try {
		const url = new URL(link);
		return url.origin + url.pathname;
	} catch {
		return link;
	}
}

const ImageModalVideoModal = getModule(Filters.byProps("ImageModal"), { searchExports: false });

const ModalRoot = getModule(Filters.byStrings("onAnimationEnd"), { searchExports: true });

const RenderLinkComponent = getModule(m => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });

const ImageModal = ImageModalVideoModal.ImageModal;

const openModal = children => {
	TheBigBoyBundle.openModal(props => {
		return (
			React.createElement(ErrorBoundary, {
				id: "modal",
				plugin: config.info.name,
			}, React.createElement(ModalRoot, {
				...props,
				className: "modal-3Crloo",
			}, children))
		);
	});
};

const getImageModalComponent = (url, rest) => (
	React.createElement(ImageModal, {
		...rest,
		src: url,
		original: url,
		renderLinkComponent: p => React.createElement(RenderLinkComponent, { ...p, }),
	})
);

const promiseHandler = promise => promise.then(data => [, data]).catch(err => [err]);

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

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

const API_ENDPOINT = "https://api.spotify.com/v1";

async function responseToJson(response) {
	const failsafeResponse = response.clone();
	const [error, data] = await promiseHandler(response.json());
	if (!error) return data;
	return {
		invalidJson: true,
		data: await failsafeResponse.text()
	};
}

async function wrappedFetch(url, options) {
	const response = await fetch(url, options);

	if (!response.ok)
		switch (response.status) {
			case 400:
			case 401:
			case 403:
			case 404:
			case 429:
			case 503:
				const data = await responseToJson(response);
				throw data.invalidJson ? data.data : data.error;
			default:
				throw response;
		}

	if (response.status === 204) return;
	return await responseToJson(response);
}

function buildFetchRequestOptions(builderObj) {
	const options = {
		method: builderObj.method,
		headers: builderObj.headers
	};

	if (builderObj.body) options["body"] = JSON.stringify(builderObj.body);
	return options;
}

class FetchRequestBuilder {
	constructor(endpoint) {
		this.endpoint = endpoint;
	}

	setToken(token) {
		this.setHeaders({
			Authorization: `Bearer ${token}`
		});
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
}

class SpotifyClientAPI {
	constructor(credentials = {}) {
		this.credentials = credentials;
	}

	set token(value) {
		this.credentials["token"] = value;
	}

	get token() {
		return this.credentials["token"] || null;
	}

	set accountId(value) {
		this.credentials["accountId"] = value;
	}

	get accountId() {
		return this.credentials["accountId"] || null;
	}

	getRequestBuilder() {
		return new FetchRequestBuilder(API_ENDPOINT).setToken(this.token);
	}

	next() {
		return this.getRequestBuilder()
			.setPath("/me/player/next")
			.setMethod("POST")
			.build()
			.run();
	}

	previous() {
		return this.getRequestBuilder()
			.setPath("/me/player/previous")
			.setMethod("POST")
			.build()
			.run();
	}

	play() {
		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.build()
			.run();
	}

	pause() {
		return this.getRequestBuilder()
			.setPath("/me/player/pause")
			.setMethod("PUT")
			.build()
			.run();
	}

	seek(ms) {
		return this.getRequestBuilder()
			.setPath("/me/player/seek")
			.setMethod("PUT")
			.setParams({ position_ms: ms })
			.build()
			.run();
	}

	shuffle(state) {
		return this.getRequestBuilder()
			.setPath("/me/player/shuffle")
			.setMethod("PUT")
			.setParams({ state })
			.build()
			.run();
	}

	volume(volume_percent) {
		return this.getRequestBuilder()
			.setPath("/me/player/volume")
			.setMethod("PUT")
			.setParams({ volume_percent })
			.build()
			.run();
	}

	repeat(state) {
		return this.getRequestBuilder()
			.setPath("/me/player/repeat")
			.setMethod("PUT")
			.setParams({ state })
			.build()
			.run();
	}

	listen(type, id) {
		let body = {};

		if (type === "track" || type === "episode")
			body = { uris: [`spotify:${type}:${id}`] };
		else
			body = { context_uri: `spotify:${type}:${id}` };

		return this.getRequestBuilder()
			.setPath("/me/player/play")
			.setMethod("PUT")
			.setBody(body)
			.build()
			.run();
	}

	queue(type, id) {
		return this.getRequestBuilder()
			.setPath("/me/player/queue")
			.setMethod("POST")
			.setParams({ uri: `spotify:${type}:${id}` })
			.build()
			.run();
	}

	getPlayerState() {
		return this.getRequestBuilder().setPath("/me/player").setMethod("GET").build().run();
	}

	getDevices() {
		return this.getRequestBuilder().setPath("/me/player/devices").setMethod("GET").build().run();
	}

}

const SpotifyAPI = new SpotifyClientAPI();

const RefreshToken = getModule(Filters.byStrings("CONNECTION_ACCESS_TOKEN"), { searchExports: true });

function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { type });
}

const Toast = {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
};

function handleError(msg, error) {
	const e = new Error(msg || "Unknown error", { error });
	Logger.error(e);
	return e;
}

async function requestHandler(action) {
	let repeatOnce = 2;
	while (repeatOnce--) {
		const [err, res] = await promiseHandler(action());
		if (!err) return res;
		if (err.status !== 401) throw handleError(err.message, err);

		if (!SpotifyAPI.accountId) throw "Unknown account ID";
		const [error, response] = await promiseHandler(RefreshToken(SpotifyAPI.accountId));
		if (error) throw handleError("Could not refresh Spotify token", error);
		SpotifyAPI.token = response.body.access_token;
	}
}

function playerActions(prop) {
	return (...args) =>
		requestHandler(() => SpotifyAPI[prop].apply(SpotifyAPI, args)).catch(reason => {
			Toast.error(`Could not execute ${prop} command\n${reason}`);
		});
}

function ressourceActions(prop) {
	const { success, error } = {
		queue: {
			success: (type, name) => `Queued ${type} ${name}`,
			error: (type, name, reason) => `Could not queue ${type} ${name}\n${reason}`
		},
		listen: {
			success: (type, name) => `Playing ${type} ${name}`,
			error: (type, name, reason) => `Could not play ${type} ${name}\n${reason}`
		}
	} [prop];

	return (type, id, description) =>
		requestHandler(() => SpotifyAPI[prop](type, id))
		.then(() => {
			Toast.success(success(type, description));
		})
		.catch((reason) => {
			Toast.error(error(type, description, reason));
		});
}

const SpotifyAPIWrapper = new Proxy({}, {
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
				return playerActions(prop);
			case "getPlayerState":
			case "getDevices":
				return () => requestHandler(() => SpotifyAPI[prop]());
			case "updateToken":
				return socket => {
					SpotifyAPI.token = socket?.accessToken;
					SpotifyAPI.accountId = socket?.accountId;
				};
			default:
				return Promise.reject("Unknown API Command", prop);
		}
	}
});

function getSocketConstructor() {
	const playableComputerDevices = SpotifyStore.getPlayableComputerDevices() || [];
	return playableComputerDevices[0]?.socket?.constructor;
}

function getSocket() {
	const socket = getSocketConstructor();
	if (socket) return Promise.resolve(socket);

	return new Promise(resolve => {
		function listener() {
			const socket = getSocketConstructor();
			if (!socket) return;
			SpotifyStore.removeChangeListener(listener);
			resolve(socket);
		}
		SpotifyStore.addChangeListener(listener);
	});
}

const SpotifySocketListener = new(class SpotifySocketListener extends ChangeEmitter {
	constructor() {
		super();
	}

	async init() {
		const socket = await getSocket();
		if (this.unpatch) this.unpatch();
		this.unpatch = Patcher.after(socket.prototype, "handleEvent", (socket, [event]) => this.emit({ socket, event }));
	}

	dispose() {
		this.unpatch?.();
		delete this.unpatch;
	}
})();

const ConnectedAccountsStore = getModule(m => m._dispatchToken && m.getName() === "ConnectedAccountsStore");

class SpotifyAccount {
	constructor(socket) {
		this.socket = socket;
	}

	get accessToken() {
		return this.socket.accessToken;
	}

	get id() {
		return this.socket.accountId;
	}

	get isActive() {
		return this.device?.is_active;
	}

	setDevices(devices) {
		this.device = devices.find(d => d.is_active) || devices[0];
		if (!this.isActive) this.playerState = undefined;
	}

	setPlayerState(playerState) {
		this.playerState = new PlayerState(playerState);
		this.device = playerState.device;
	}
}

class PlayerState {
	constructor(playerState) {
		this.playerState = playerState;
		this.track = playerState.item ? new Track(playerState.item) : null;
	}

	get disallowedActions() {
		return this.playerState.actions.disallows;
	}

	get currentlyPlayingType() {
		return this.playerState.currently_playing_type;
	}

	get context() {
		return this.playerState.context;
	}

	get ressourceId() {
		return this.track?.id;
	}

	get duration() {
		return this.track?.duration;
	}

	get shuffle() {
		return this.playerState["shuffle_state"];
	}

	get repeat() {
		return this.playerState["repeat_state"];
	}

	get progress() {
		return this.playerState["progress_ms"];
	}

	get isPlaying() {
		return this.playerState["is_playing"];
	}

	get volume() {
		return this.playerState.device["volume_percent"];
	}
}

class Track {
	constructor(track) {
		this.track = track;
	}

	get id() {
		return this.track.id;
	}

	get url() {
		return this.track.external_urls.spotify;
	}

	get artists() {
		return this.track.artists;
	}

	get duration() {
		return this.track["duration_ms"];
	}

	get explicit() {
		return this.track.explicit;
	}

	get name() {
		return this.track.name;
	}

	get bannerObj() {
		return this.track.album.images;
	}

	get albumName() {
		return this.track.album.name;
	}

	get albumUrl() {
		return this.track.album.external_urls.spotify;
	}
}

const SpotifyActiveAccount = new(class SpotifyActiveAccount extends ChangeEmitter {
	constructor() {
		super();
		this.onSocketEvent = this.onSocketEvent.bind(this);
		this.onSpotifyStoreChange = this.onSpotifyStoreChange.bind(this);
		this.onAccountsChanged = this.onAccountsChanged.bind(this);
	}

	async init() {
		this.activeAccount = undefined;

		SpotifySocketListener.init();
		SpotifySocketListener.on(this.onSocketEvent);

		SpotifyStore.addChangeListener(this.onSpotifyStoreChange);
		ConnectedAccountsStore.addChangeListener(this.onAccountsChanged);
		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (!socket) return;

		this.activeAccount = new SpotifyAccount(socket);
		this.setToken();
		await this.ensureDeviceState();
		if (this.activeAccount.isActive) await this.fetchPlayerState();
		this.emit();
	}

	dispose() {
		SpotifyStore.removeChangeListener(this.onSpotifyStoreChange);
		SpotifySocketListener.off(this.onSocketEvent);
		ConnectedAccountsStore.removeChangeListener(this.onAccountsChanged);
		SpotifySocketListener.dispose();
		clearTimeout(this.idleTimeoutId);
		delete this.activeAccount;
	}

	onAccountsChanged() {
		if (!this.activeAccount) return;
		const connectedAccounts = ConnectedAccountsStore.getAccounts().filter(account => account.type === "spotify");
		if (connectedAccounts.some(a => a.id === this.activeAccount.id)) return;

		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (socket) return;
		this.activeAccount = undefined;
		this.setToken();
		this.emit();
	}

	async onSpotifyStoreChange() {
		if (this.activeAccount) return;
		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (!socket) return;

		this.activeAccount = new SpotifyAccount(socket);
		this.setToken();
		await this.fetchPlayerState();
		this.emit();
	}

	onSocketEvent({ socket, event }) {
		if (socket.accountId !== this.activeAccount?.id) return;

		switch (event.type) {
			case "PLAYER_STATE_CHANGED":
				this.activeAccount.setPlayerState(event.event.state);
				break;
			case "DEVICE_STATE_CHANGED":
				this.activeAccount.setDevices(event.event.devices);
				break;
		}
		if (!this.activeAccount?.isActive) this.activeAccount = undefined;
		this.checkActivityInterval();
		this.emit();
	}

	checkActivityInterval() {
		if (!this.activeAccount?.playerState && this.idleTimeoutId) {
			console.log("Clear Idle Timeout");
			clearTimeout(this.idleTimeoutId);
			this.idleTimeoutId = null;
			return;
		}

		if (!this.activeAccount?.playerState) return;

		const { isPlaying } = this.activeAccount.playerState;

		if (isPlaying && this.idleTimeoutId) {
			console.log("Clear Idle Timeout");
			clearTimeout(this.idleTimeoutId);
			this.idleTimeoutId = null;
			return;
		}

		if (!isPlaying && this.idleTimeoutId) return;

		if (!isPlaying) {
			console.log("Start Idle Timeout");
			this.idleTimeoutId = setTimeout(
				() => {
					clearTimeout(this.idleTimeoutId);
					this.idleTimeoutId = null;
					this.activeAccount = undefined;
					console.log("Idle Timeout HIT");
					this.emit();
				},
				20 * 60 * 1000
			);
		}
	}

	setToken() {
		SpotifyAPIWrapper.updateToken(this.activeAccount?.socket || {});
	}

	async ensureDeviceState() {
		const [err, data] = await promiseHandler(SpotifyAPIWrapper.getDevices());
		if (err) return;
		this.activeAccount.setDevices(data.devices);
	}

	async fetchPlayerState() {
		const [err, playerState] = await promiseHandler(SpotifyAPIWrapper.getPlayerState());
		if (err) return;
		this.activeAccount.setPlayerState(playerState);
	}

	getActiveAccount() {
		return this.activeAccount;
	}
})();

const SelectedChannelStore = getModule(m => m._dispatchToken && m.getName() === "SelectedChannelStore");

const MessageActions = getModule(Filters.byProps('jumpToMessage', '_sendMessage'), { searchExports: false });

const Dispatcher = getModule(Filters.byProps("dispatch", "subscribe"), { searchExports: false });

const PendingReplyStore = getModule(m => m._dispatchToken && m.getName() === "PendingReplyStore");

function getReply(channelId) {
	const reply = PendingReplyStore?.getPendingReply(channelId);
	if (!reply) return {};
	Dispatcher?.dispatch({ type: "DELETE_PENDING_REPLY", channelId });
	return {
		messageReference: {
			guild_id: reply.channel.guild_id,
			channel_id: reply.channel.id,
			message_id: reply.message.id
		},
		allowedMentions: reply.shouldMention ?
			undefined : {
				parse: ["users", "roles", "everyone"],
				replied_user: false
			}
	};
}

async function sendMessageDirectly(channel, content) {
	if (!MessageActions || !MessageActions.sendMessage || typeof MessageActions.sendMessage !== "function")
		throw new Error("Can't send message directly.");

	return MessageActions.sendMessage(
		channel.id, {
			validNonShortcutEmojis: [],
			content
		},
		undefined,
		getReply(channel.id)
	);
}

const insertText = (() => {
	let ComponentDispatch;
	return content => {
		if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length, { searchExports: true });
		setTimeout(() => {
			ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
				plainText: content
			});
		});
	};
})();

const Utils = {
	copySpotifyLink(link) {
		if (!link) return Toast.error("Could not resolve url");
		link = sanitizeSpotifyLink(link);
		copy(link);
		Toast.success("Link copied!");
	},
	openSpotifyLink(link) {
		if (!link) return Toast.error("Could not resolve url");
		link = sanitizeSpotifyLink(link);
		window.open(link, "_blank");
	},
	share(link) {
		if (!link) return Toast.error("Could not resolve url");
		const id = SelectedChannelStore.getCurrentlySelectedChannelId();
		if (!id) return Toast.info("There is no Selected Channel");
		link = sanitizeSpotifyLink(link);
		sendMessageDirectly({ id }, link).catch(a => {
			Toast.error(a.message);
			insertText(link);
		});
	}
};

const SpotifyWrapper = new(class SpotifyWrapper extends ChangeEmitter {
	constructor() {
		super();
		this.onStateChange = this.onStateChange.bind(this);
	}

	init() {
		SpotifyActiveAccount.init();
		SpotifyActiveAccount.on(this.onStateChange);
		this.activeAccount = SpotifyActiveAccount.getActiveAccount();
		this.Player = SpotifyAPIWrapper;
		this.Utils = Utils;
	}

	dispose() {
		SpotifyActiveAccount.dispose();
		SpotifyActiveAccount.off(this.onStateChange);
		delete this.activeAccount;
		delete this.Player;
		delete this.Utils;
	}

	onStateChange() {
		this.activeAccount = SpotifyActiveAccount.getActiveAccount();
		console.log("activeAccount", this.activeAccount?.playerState);
		this.emit();
	}

	getSpotifyState() {
		return {
			deviceState: this.activeAccount?.isActive,
			playerState: this.activeAccount?.playerState
		};
	}
})();

const SpotifyControls = ({ embed }) => {
	const { url } = embed;
	const [type, id] = parseSpotifyUrl(url);
	const spotifySocket = FluxHelpers.useStateFromStores([SpotifyStore], () => SpotifyStore.getActiveSocketAndDevice()?.socket);
	if (!spotifySocket) return null;
	const listenBtn = type !== "show" && (
		React.createElement(ControlBtn, {
			value: "listen",
			onClick: () => SpotifyWrapper.Player.listen(type, id, embed.rawTitle),
		})
	);

	const queueBtn = (type === "track" || type === "episode") && (
		React.createElement(ControlBtn, {
			value: "add to queue",
			onClick: () => SpotifyWrapper.Player.queue(type, id, embed.rawTitle),
		})
	);

	const copyBtn = (
		React.createElement(ControlBtn, {
			value: "copy",
			onClick: () => SpotifyWrapper.Utils.copySpotifyLink(url),
		})
	);

	return (
		React.createElement('div', { className: "spotify-controls", }, listenBtn, queueBtn, copyBtn)
	);
};

function ControlBtn({ value, onClick }) {
	return (
		React.createElement(Button, {
			size: Button.Sizes.TINY,
			color: Button.Colors.GREEN,
			onClick: onClick,
		}, value)
	);
}

function AddToQueueIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
		}, React.createElement('path', { d: "M12 2.00098C6.486 2.00098 2 6.48698 2 12.001C2 17.515 6.486 22.001 12 22.001C17.514 22.001 22 17.515 22 12.001C22 6.48698 17.514 2.00098 12 2.00098ZM17 13.001H13V17.001H11V13.001H7V11.001H11V7.00098H13V11.001H17V13.001Z", }))
	);
}

function CopyIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
		}, React.createElement('path', { d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z", }), React.createElement('path', { d: "M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z", }))
	);
}

function ListenIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
		}, React.createElement('path', { d: "M22 16.53C22 18.3282 20.2485 19.7837 18.089 19.7837C15.9285 19.7837 14.5396 18.3277 14.5396 16.53C14.5396 14.7319 15.9286 13.2746 18.089 13.2746C18.7169 13.2746 19.3089 13.4013 19.8353 13.6205V5.814L9.46075 7.32352V18.7449C9.46075 20.5424 7.70957 22 5.54941 22C3.38871 22 2 20.5443 2 18.7456C2 16.9481 3.3892 15.4898 5.54941 15.4898C6.17823 15.4898 6.76966 15.6162 7.29604 15.836C7.29604 11.3608 7.29604 8.5366 7.29604 4.1395L21.9996 2L22 16.53Z", }))
	);
}

function SpotifyIcon(props) {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
			...props,
		}, React.createElement('path', { d: "M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2ZM16.5625 16.4375C16.3791 16.7161 16.0145 16.8107 15.7188 16.6562C13.375 15.2188 10.4062 14.9062 6.9375 15.6875C6.71979 15.7377 6.49182 15.668 6.33945 15.5046C6.18709 15.3412 6.13348 15.1089 6.19883 14.8952C6.26417 14.6816 6.43854 14.519 6.65625 14.4688C10.4688 13.5938 13.7188 13.9688 16.375 15.5938C16.5149 15.6781 16.6141 15.816 16.6495 15.9755C16.685 16.1349 16.6535 16.3019 16.5625 16.4375ZM17.8125 13.6875C17.7053 13.8622 17.5328 13.9869 17.3333 14.0338C17.1338 14.0807 16.9238 14.0461 16.75 13.9375C14.0625 12.2812 9.96875 11.8125 6.78125 12.7812C6.5133 12.8594 6.22401 12.7887 6.02236 12.5957C5.8207 12.4027 5.73731 12.1168 5.80361 11.8457C5.8699 11.5746 6.0758 11.3594 6.34375 11.2812C9.96875 10.1875 14.5 10.7188 17.5625 12.625C17.9134 12.8575 18.0229 13.3229 17.8125 13.6875ZM17.9062 10.875C14.6875 8.96875 9.375 8.78125 6.28125 9.71875C5.81691 9.79284 5.36952 9.5115 5.23513 9.0609C5.10074 8.61031 5.32093 8.12986 5.75 7.9375C9.28125 6.875 15.1562 7.0625 18.875 9.28125C19.0893 9.40709 19.2434 9.61436 19.3023 9.85577C19.3612 10.0972 19.3198 10.3521 19.1875 10.5625C18.9054 10.9822 18.3499 11.1177 17.9062 10.875Z", }))
	);
}

const { Tooltip } = TheBigBoyBundle;

const Tooltip$1 = ({ note, position, children }) => {
	return (
		React.createElement(Tooltip, {
			text: note,
			position: position || "top",
		}, props => {
			children.props = {
				...props,
				...children.props
			};
			return children;
		})
	);
};

const { Slider: Slider$1 } = TheBigBoyBundle;

function formatMsToTime(ms) {
	const time = new Date(ms);
	return [time.getUTCHours(), String(time.getUTCMinutes()), String(time.getUTCSeconds()).padStart(2, "0")].filter(Boolean).join(":");
}

const TrackTimeLine = ({ duration, isPlaying, progress }) => {
	const [position, setPosition] = usePropBasedState(progress);
	const sliderRef = React.useRef();

	React.useEffect(() => {
		if (!isPlaying) return;
		const interval = setInterval(() => {
			if (sliderRef.current?.state?.active) return;
			if (position >= duration) clearInterval(interval);
			setPosition(position + 1000);
		}, 1000);

		return () => clearInterval(interval);
	}, [duration, position, isPlaying]);

	const rangeChangeHandler = e => {
		const pos = Math.floor(e);
		if (!sliderRef.current?.state?.active) return;
		setPosition(pos);
		SpotifyWrapper.Player.seek(pos);
		console.log(pos);
	};

	return (
		React.createElement('div', { className: "spotify-player-timeline", }, React.createElement(Slider$1, {
			className: "spotify-player-timeline-trackbar",
			mini: true,
			minValue: 0,
			maxValue: duration,
			initialValue: position < 1000 ? 0 : position,
			onValueChange: rangeChangeHandler,
			onValueRender: formatMsToTime,
			ref: sliderRef,
			grabberClassName: "spotify-player-timeline-trackbar-grabber",
			barClassName: "spotify-player-timeline-trackbar-bar",
		}), React.createElement('div', { className: "spotify-player-timeline-progress", }, formatMsToTime(position)), React.createElement('div', { className: "spotify-player-timeline-duration", }, formatMsToTime(duration)))
	);
};

const SpotifyEmbed = ({ embed }) => {
	const [{ deviceState: isActive, playerState }, setState] = React.useState(SpotifyWrapper.getSpotifyState());
	const { thumbnail, rawTitle, rawDescription, url } = embed;
	const [type, id] = parseSpotifyUrl(url);
	const { duration, isPlaying, progress } = playerState || {};
	const isThis = playerState?.track?.id === id && progress !== 0;

	React.useEffect(() => {
		return SpotifyWrapper.on(() => {
			const newState = SpotifyWrapper.getSpotifyState();
			if (newState.deviceState === isActive && newState?.playerState?.isPlaying && newState?.playerState?.track?.id !== id) return;
			setState(newState);
		});
	}, []);

	const thumbnailClickHandler = () => {
		let { proxyURL, url, width, height } = thumbnail;
		width = width > 650 ? 650 : width;
		height = height > 650 ? 650 : height;
		openModal(getImageModalComponent(proxyURL || url, { width, height }));
	};

	const listenBtn = type !== "show" && (
		React.createElement(Listen, {
			type: type,
			id: id,
			embed: embed,
		})
	);

	const queueBtn = (type === "track" || type === "episode") && (
		React.createElement(AddToQueue, {
			type: type,
			id: id,
			embed: embed,
		})
	);

	return (
		React.createElement('div', {
				className: "spotifyEmbed-Container",
				style: { "--thumbnail": `url(${thumbnail.proxyURL || thumbnail.url})` },
			}, React.createElement('div', {
				onClick: thumbnailClickHandler,
				className: "spotifyEmbed-thumbnail",
			})

			, React.createElement('h2', { className: "spotifyEmbed-title", }, rawTitle), React.createElement('p', { className: "spotifyEmbed-description", }, rawDescription)

			, type && id && (
				React.createElement('div', { className: "spotifyEmbed-controls", }, !isThis && isActive && [listenBtn, queueBtn], isThis && React.createElement(TrackTimeLine, { ...{ duration, isPlaying, progress }, }), React.createElement(Copy, { url: url, }))
			), React.createElement(SpotifyLogoBtn, { url: url, })
		)
	);
};

function SpotifyLogoBtn({ url }) {
	return (
		React.createElement(Tooltip$1, { note: "Play on Spotify", }, React.createElement('div', {
			onClick: () => SpotifyWrapper.Utils.openSpotifyLink(url),
			className: "spotifyEmbed-spotifyIcon",
		}, React.createElement(SpotifyIcon, null)))
	);
}

function Copy({ url }) {
	return (
		React.createElement(Tooltip$1, { note: "Copy link", }, React.createElement('div', {
			onClick: () => SpotifyWrapper.Utils.copySpotifyLink(url),
			className: "spotifyEmbed-btn spotifyEmbed-btn-copy",
		}, React.createElement(CopyIcon, null)))
	);
}

function Listen({ type, id, embed }) {
	return (
		React.createElement(Tooltip$1, { note: `Play ${type}`, }, React.createElement('div', {
			onClick: () => SpotifyWrapper.Player.listen(type, id, embed.rawTitle),
			className: "spotifyEmbed-btn spotifyEmbed-btn-listen",
		}, React.createElement(ListenIcon, null)))
	);
}

function AddToQueue({ type, id, embed }) {
	return (
		React.createElement(Tooltip$1, { note: `Add ${type} to queue`, }, React.createElement('div', {
			onClick: () => SpotifyWrapper.Player.queue(type, id, embed.rawTitle),
			className: "spotifyEmbed-btn spotifyEmbed-btn-addToQueue",
		}, React.createElement(AddToQueueIcon, null)))
	);
}

function SpotifyEmbedWrapper({ embedObject, embedComponent }) {
	const spotifyEmbed = useSettings("spotifyEmbed");
	switch (spotifyEmbed) {
		case EmbedStyleEnum.KEEP:
			return [embedComponent, React.createElement(SpotifyControls, { embed: embedObject, })];
		case EmbedStyleEnum.REPLACE:
			return React.createElement(SpotifyEmbed, { embed: embedObject, });
		case EmbedStyleEnum.HIDE:
			return React.createElement(SpotifyControls, { embed: embedObject, });
	}
	return embedComponent;
}

const patchSpotifyEmbed = () => {
	if (EmbedComponent)
		Patcher.after(EmbedComponent.prototype, "render", (_, args, ret) => {
			const { props } = _;
			if (props.embed?.provider?.name !== "Spotify") return;
			if (props.embed?.type === "article") {
				Logger.log("Spotify article", props.embed.url);
				return;
			}

			return (
				React.createElement(ErrorBoundary, {
						id: "SpotifyEmbed",
						plugin: config.info.name,
					}

					, React.createElement(SpotifyEmbedWrapper, {
						embedComponent: ret,
						embedObject: props.embed,
					})
				)
			);
		});
	else Logger.patch("SpotifyEmbed");
};

function ListenAlongIcon() {
	return (
		React.createElement('svg', {
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
		}, React.createElement('path', {
			fill: "currentColor",
			d: "M11.8 14a6.1 6.1 0 0 0 0 6H3v-2c0-2.7 5.3-4 8-4h.8zm-.8-2c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm6 1c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm-1 6.2l3-2.2-3-2.2v4.4z",
		}))
	);
}

const ShareIcon = () => {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
		}, React.createElement('path', { d: "M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z", }))
	);
};

const getUserSyncActivityState = getModule(Filters.byStrings("USER_ACTIVITY_SYNC", "spotifyData"), { searchExports: true });
const getUserPlayActivityState = getModule(Filters.byStrings("USER_ACTIVITY_PLAY", "spotifyData"), { searchExports: true });

function ActivityControlButton({ value, onClick, ...rest }) {
	return (
		React.createElement(Button, {
			size: Button.Sizes.NONE,
			color: Button.Colors.PRIMARY,
			onClick: onClick,
			...rest,
		}, value)
	);
}

const SpotifyActivityControls = ({ activity, user, source, renderActions }) => {
	const spotifySocket = FluxHelpers.useStateFromStores([SpotifyStore], () => SpotifyStore.getActiveSocketAndDevice()?.socket);

	const userSyncActivityState = getUserSyncActivityState(activity, user, source);
	const userPlayActivityState = getUserPlayActivityState(activity, user, source);

	if (!spotifySocket) return renderActions();

	const queue = () => SpotifyWrapper.Player.queue("track", activity.sync_id, activity.details);
	const share = () => SpotifyWrapper.Utils.share(`https://open.spotify.com/track/${activity.sync_id}`);

	return (
		React.createElement('div', { className: "spotify-activity-controls", }, React.createElement(Play, { userPlayActivityState: userPlayActivityState, }), React.createElement(Tooltip$1, { note: "Add to queue", }, React.createElement(ActivityControlButton, {
			className: "activity-controls-queue",
			value: React.createElement(AddToQueueIcon, null),
			onClick: queue,
		})), React.createElement(Tooltip$1, { note: "Share in current channel", }, React.createElement(ActivityControlButton, {
			className: "activity-controls-share",
			onClick: share,
			value: React.createElement(ShareIcon, null),
		})), React.createElement(ListenAlong, { userSyncActivityState: userSyncActivityState, }))
	);
};

function Play({ userPlayActivityState }) {
	const { label, disabled, onClick, tooltip } = userPlayActivityState;

	return (
		React.createElement(Tooltip$1, { note: tooltip || label, }, React.createElement(ActivityControlButton, {
			disabled: disabled,
			className: "activity-controls-listen",
			value: React.createElement(ListenIcon, null),
			onClick: onClick,
		}))
	);
}

function ListenAlong({ userSyncActivityState }) {
	const { disabled, onClick, tooltip } = userSyncActivityState;

	return (
		React.createElement(Tooltip$1, { note: tooltip, }, React.createElement(ActivityControlButton, {
			className: "activity-controls-listenAlong",
			disabled: disabled,
			onClick: e => onClick(e),
			value: React.createElement(ListenAlongIcon, null),
		}))
	);
}

const ActivityComponent = getModule(a => a.prototype.isStreamerOnTypeActivityFeed);

const patchSpotifyActivity = () => {
	if (ActivityComponent)
		Patcher.before(ActivityComponent.prototype, "render", ({ props }) => {
			if (!props.activity) return;
			if (props.activity.name.toLowerCase() !== "spotify") return;

			const renderActions = props.renderActions;
			props.renderActions = () => (
				React.createElement(ErrorBoundary, {
					id: "SpotifyEmbed",
					plugin: config.info.name,
				}, React.createElement(SpotifyActivityControls, {
					...props,
					renderActions: renderActions,
				}))
			);
		});
	else Logger.patch("SpotifyActivityComponent");
};

const MessageHeader = getModuleAndKey(Filters.byStrings("userOverride", "withMentionPrefix"), { searchExports: false });

const PresenceStore = getModule(m => m._dispatchToken && m.getName() === "PresenceStore");

function spotifyActivityFilter(activity) {
	return activity.name.toLowerCase() === "spotify";
}

function getUserActivity(userId, filter) {
	return PresenceStore.getActivities(userId).find(filter);
}

const patchMessageHeader = () => {
	const { module, key } = MessageHeader;
	if (module && key)
		Patcher.after(module, key, (_, [{ message }], ret) => {
			const userId = message.author.id;
			ret.props.children.push(
				React.createElement(ErrorBoundary, {
					id: "SpotifyActivityIndicator",
					plugin: config.info.name,
				}, React.createElement(SpotifyActivityIndicator, { userId: userId, }))
			);
		});
	else Logger.patch("MessageHeader");
};

function SpotifyActivityIndicator({ userId }) {
	const spotifyActivity = FluxHelpers.useStateFromStores([PresenceStore], () => getUserActivity(userId, spotifyActivityFilter));
	if (!spotifyActivity) return null;

	return (
		React.createElement(Tooltip$1, { note: `${spotifyActivity.details} - ${spotifyActivity.state}`, }, React.createElement(SpotifyIcon, {
			width: "20",
			height: "20",
			class: "spotifyActivityIndicatorIcon",
		}))
	);
}

const { Anchor } = TheBigBoyBundle;

const TrackMediaDetails = ({ track }) => {
	if (!track) return;

	const { albumName, albumUrl, bannerObj, url, name, artists } = track;

	return (
		React.createElement('div', { className: "spotify-player-media", }, React.createElement(TrackBanner, { banner: bannerObj, }), React.createElement(Anchor, {
				href: url,
				className: "spotify-player-title",
			}, name)

			, React.createElement(Artist, { artists: artists, }), React.createElement('div', { className: "spotify-player-album", }, "on ", React.createElement(Anchor, { href: albumUrl, }, albumName), " ")
		)
	);
};

function transformArtist(artist) {
	return React.createElement(Anchor, { href: `https://open.spotify.com/artist/${artist.id}`, }, artist.name);
}

function Artist({ artists }) {
	const artist =
		artists?.length === 1 ?
		transformArtist(artists[0]) :
		artists.map(transformArtist).reduce((acc, el, index, obj) => {
			acc.push(el);
			if (index < obj.length - 1) acc.push(", ");
			return acc;
		}, []);

	return React.createElement('div', { className: "spotify-player-artist", }, "by ", artist);
}

function TrackBanner({ banner = [] }) {
	const smBanner = banner[2];

	const thumbnailClickHandler = () => {
		const lgBanner = banner[0];
		if (!lgBanner) return;
		openModal(getImageModalComponent(lgBanner.url, lgBanner));
	};

	return (
		React.createElement('div', {
			onClick: thumbnailClickHandler,
			style: { "--banner": `url(${smBanner && smBanner.url})` },
			className: "spotify-player-banner",
		})
	);
}

const { Popout } = TheBigBoyBundle;

const Popout$1 = ({ spacing, position, animation, renderPopout, children }) => {
	const [show, setShow] = React.useState(false);

	return (
		React.createElement('div', {
			className: `${config.info.name}-popout-container`,
			onMouseLeave: () => setShow(false),
			onMouseEnter: () => setShow(true),
		}, React.createElement(Popout, {
			renderPopout: renderPopout,
			shouldShow: show,
			onRequestClose: () => setShow(false),
			position: position ?? "top",
			animation: animation ?? "1",
			spacing: spacing ?? 8,
		}, () => children))
	);
};

function PauseIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16",
		}, React.createElement('path', { d: "M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z", }))
	);
}

function PlayIcon$1() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16",
		}, React.createElement('path', { d: "M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z", }), "\t")
	);
}

function RepeatIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16",
		}, React.createElement('path', { d: "M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z", }))
	);
}

function ShuffleIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			height: "24",
			width: "24",
			viewBox: "0 0 16 16",
		}, React.createElement('path', { d: "M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z", }), React.createElement('path', { d: "m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z", }))
	);
}

function NextIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			height: "24",
			width: "24",
			viewBox: "0 0 16 16",
		}, React.createElement('path', { d: "M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z", }))
	);
}

function VolumeIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16",
		}, React.createElement('path', { d: "M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z", }), React.createElement('path', { d: "M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z", }))
	);
}

function PlayIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			height: "24",
			width: "24",
			viewBox: "0 0 16 16",
		}, React.createElement('path', { d: "M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z", }))
	);
}

function RepeatOneIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16",
		}, React.createElement('path', { d: "M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5zM12.25 2.5h-.75V1h.75A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25z", }), React.createElement('path', { d: "M9.12 8V1H7.787c-.128.72-.76 1.293-1.787 1.313V3.36h1.57V8h1.55z", }))
	);
}

const { MenuItem, Menu, Slider } = TheBigBoyBundle;

const SpotifyPlayerControls = ({ disallowedActions, state, data }) => {
	if (!disallowedActions || !state || !data) return;

	const { url, banner: [{ url: posterUrl }], volume } = data;
	const { shuffle, repeat, isPlaying } = state;
	const { toggling_shuffle, toggling_repeat_track, /* pausing, resuming, seeking, */ skipping_next, skipping_prev } = disallowedActions;

	const { repeatTooltip, repeatActive, repeatIcon, repeatArg } = {
		"off": {
			repeatTooltip: "Repeat",
			repeatArg: "context",
			repeatIcon: React.createElement(RepeatIcon, null),
			repeatActive: false
		},
		"context": {
			repeatTooltip: "Repeat track",
			repeatArg: "track",
			repeatIcon: React.createElement(RepeatIcon, null),
			repeatActive: true
		},
		"track": {
			repeatTooltip: "Repeat off",
			repeatArg: "off",
			repeatIcon: React.createElement(RepeatOneIcon, null),
			repeatActive: true
		}
	} [repeat];

	const shuffleHandler = () => SpotifyWrapper.Player.shuffle(!shuffle);
	const previousHandler = () => SpotifyWrapper.Player.previous();
	const nextHandler = () => SpotifyWrapper.Player.next();
	const repeatHandler = () => SpotifyWrapper.Player.repeat(repeatArg);
	const pauseHandler = () => SpotifyWrapper.Player.pause();
	const playHandler = () => SpotifyWrapper.Player.play();
	const volumeHandler = v => SpotifyWrapper.Player.volume(Math.round(v));

	const shareSongHandler = () => SpotifyWrapper.Utils.share(url);
	const sharePosterHandler = () => SpotifyWrapper.Utils.share(posterUrl);

	const copySongHandler = () => SpotifyWrapper.Utils.copySpotifyLink(url);
	const copyPosterHandler = () => SpotifyWrapper.Utils.copySpotifyLink(posterUrl);

	const { playPauseTooltip, playPauseHandler, playPauseIcon, playPauseClassName } = {
		"true": {
			playPauseTooltip: "Pause",
			playPauseClassName: "spotify-player-controls-pause",
			playPauseHandler: pauseHandler,
			playPauseIcon: React.createElement(PauseIcon, null)
		},
		"false": {
			playPauseTooltip: "Play",
			playPauseClassName: "spotify-player-controls-play",
			playPauseHandler: playHandler,
			playPauseIcon: React.createElement(PlayIcon$1, null)
		}
	} [isPlaying];

	return (
		React.createElement('div', { className: "spotify-player-controls", }, React.createElement(Popout$1, {
				renderPopout: t => (
					React.createElement(Menu, { onClose: t.closePopout, }, React.createElement(MenuItem, {
						id: "copy-song-link",
						key: "copy-song-link",
						action: copySongHandler,
						label: "Copy song url",
					}), React.createElement(MenuItem, {
						id: "copy-poster-link",
						key: "copy-poster-link",
						action: copyPosterHandler,
						label: "Copy poster url",
					}), React.createElement(MenuItem, {
						id: "share-song-link",
						key: "share-song-link",
						action: shareSongHandler,
						label: "Share song in current channel",
					}), React.createElement(MenuItem, {
						id: "share-poster-link",
						key: "share-poster-link",
						action: sharePosterHandler,
						label: "Share poster in current channel",
					}))
				),
				position: "top",
				animation: "1",
				spacing: 0,
			}, React.createElement(SpotifyPlayerButton, {
				className: "spotify-player-controls-share",
				value: React.createElement(ShareIcon, null),
			}))

			, React.createElement(Tooltip$1, { note: "shuffle", }, React.createElement(SpotifyPlayerButton, {
				active: shuffle,
				className: "spotify-player-controls-shuffle",
				disabled: toggling_shuffle,
				onClick: shuffleHandler,
				value: React.createElement(ShuffleIcon, null),
			})), React.createElement(Tooltip$1, { note: "Previous", }, React.createElement(SpotifyPlayerButton, {
				className: "spotify-player-controls-previous",
				disabled: skipping_prev,
				onClick: previousHandler,
				value: React.createElement(PlayIcon, null),
			})), React.createElement(Tooltip$1, { note: playPauseTooltip, }, React.createElement(SpotifyPlayerButton, {
				className: playPauseClassName,
				onClick: playPauseHandler,
				value: playPauseIcon,
			})), React.createElement(Tooltip$1, { note: "Next", }, React.createElement(SpotifyPlayerButton, {
				className: "spotify-player-controls-next",
				disabled: skipping_next,
				onClick: nextHandler,
				value: React.createElement(NextIcon, null),
			})), React.createElement(Tooltip$1, { note: repeatTooltip, }, React.createElement(SpotifyPlayerButton, {
				active: repeatActive,
				className: "spotify-player-controls-repeat",
				disabled: toggling_repeat_track,
				onClick: repeatHandler,
				value: repeatIcon,
			}))

			, React.createElement(Popout$1, {
				renderPopout: () => (
					React.createElement('div', { className: "spotify-player-controls-volume-slider-wrapper", }, React.createElement(Slider, {
						className: "spotify-player-controls-volume-slider",
						mini: true,
						minValue: 0,
						maxValue: 100,
						initialValue: volume,
						onValueRender: a => "" + Math.round(a),
						onValueChange: volumeHandler,
						grabberClassName: "spotify-player-controls-volume-slider-grabber",
						barClassName: "spotify-player-controls-volume-slider-bar",
					}))
				),
				position: "right",
				animation: "1",
				spacing: 0,
			}, React.createElement(SpotifyPlayerButton, {
				className: "spotify-player-controls-volume",

				value: React.createElement(VolumeIcon, null),
			}))
		)
	);
};

function SpotifyPlayerButton({ value, onClick, className, active, ...rest }) {
	return (
		React.createElement(Button, {
			className: `spotify-player-controls-btn ${className} ${active ? "enabled" : ""}`,
			size: Button.Sizes.NONE,
			color: Button.Colors.PRIMARY,
			look: Button.Looks.BLANK,
			onClick: onClick,
			...rest,
		}, value)
	);
}

const SpotifyPlayer = React.memo(function SpotifyPlayer() {
	const [{ deviceState, playerState }, setState] = React.useState(SpotifyWrapper.getSpotifyState());
	React.useEffect(() => {
		return SpotifyWrapper.on(() => setState(SpotifyWrapper.getSpotifyState()));
	}, []);

	if (!deviceState) return;
	if (!playerState) return;
	if (!playerState.track) return;

	const { disallowedActions, track, duration, shuffle, volume, repeat, isPlaying, progress } = playerState;
	const { url } = track;
	console.log(track, "duration: " + duration, "shuffle: " + shuffle, "volume: " + volume, "repeat: " + repeat, "isPlaying: " + isPlaying, "progress: " + progress);
	return (
		React.createElement('div', { className: "spotify-player-container", }, React.createElement(TrackMediaDetails, { track: track, }), React.createElement(TrackTimeLine, { ...{ duration, isPlaying, progress }, }), React.createElement(SpotifyPlayerControls, {
			disallowedActions: disallowedActions,
			state: { shuffle, isPlaying, repeat },
			data: { banner: track.bannerObj, url, volume },
		}))
	);
});

const patchSpotifyPlayer = () => {
	const fluxContainer = getFluxContainer();
	if (!fluxContainer) return Logger.patch("SpotifyPlayer");
	Patcher.after(fluxContainer.type.prototype, "render", (_, __, ret) => {
		return [
			React.createElement(ErrorBoundary, {
				id: "SpotifyPlayer",
				plugin: config.info.name,
			}, React.createElement(SpotifyPlayer, null)),
			ret
		];
	});
	fluxContainer.stateNode.forceUpdate();
};

const Heading = getModule(Filters.byStrings("LEGEND", "LABEL"), { searchExports: true });

const SettingComponent = React.createElement(SpotifyEmbedOptions, null);

const { RadioGroup } = TheBigBoyBundle;

function SpotifyEmbedOptions() {
	const [selected, setSelected] = React.useState(Settings.get("spotifyEmbed"));
	return (
		React.createElement(React.Fragment, null, React.createElement(Heading, { tag: "h5", }, "spotify embed style"), React.createElement(RadioGroup, {
			options: [{
					"value": EmbedStyleEnum.KEEP,
					"name": "Keep: Use original Spotify Embed"
				},
				{
					"value": EmbedStyleEnum.REPLACE,
					"name": "Replace: A less laggy Spotify Embed"
				},
				{
					"value": EmbedStyleEnum.HIDE,
					"name": "Hide: Completely remove spotify embed"
				}
			],
			orientation: "horizontal",
			value: selected,
			onChange: e => {
				Settings.set("spotifyEmbed", e.value);
				setSelected(e.value);
			},
		}))
	);
}

window.SpotifyWrapper = SpotifyWrapper;
window.SpotifyAPI = SpotifyAPI;

class SpotifyEnhance {
	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			SpotifyWrapper.init();
			patchListenAlong();
			patchSpotifyEmbed();
			patchSpotifyActivity();
			patchMessageHeader();
			patchSpotifyPlayer();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		try {
			SpotifyWrapper.dispose();
			DOM.removeStyle();
			Patcher.unpatchAll();

			const fluxContainer = getFluxContainer();
			if (fluxContainer) fluxContainer?.stateNode?.forceUpdate();
		} catch (e) {
			Logger.error(e);
		}
	}

	getSettingsPanel() {
		return SettingComponent;
	}
}

module.exports = SpotifyEnhance;
