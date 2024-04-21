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
		"spotifyEmbed": "REPLACE",
		"activity": false,
		"player": false
	}
}

const Api = new BdApi(config.info.name);

const UI = Api.UI;
const DOM = Api.DOM;
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;

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

	emit(...payload) {
		for (const listener of this.listeners) {
			try {
				listener.apply(null, payload);
			} catch (err) {
				console.error("Could not run listener", err);
			}
		}
	}
}

const Settings = new(class Settings extends ChangeEmitter {
	init(defaultSettings) {
		this.settings = {
			...defaultSettings,
			...Data.load("settings")
		};
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

const ImageModalVideoModal = getModule(Filters.byProps("ImageModal"), { searchExports: false });

const RenderLinkComponent = getModule(m => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });

const TheBigBoyBundle = getModule(Filters.byProps("openModal", "FormSwitch", "Anchor"), { searchExports: false });

const { ModalRoot, ModalSize } = TheBigBoyBundle;
const ImageModal = ImageModalVideoModal.ImageModal;
const getInternalInstance = Api.ReactUtils.getInternalInstance;

const openModal = (children, tag) => {
	const id = `${tag ? `${tag}-` : ""}modal`;
	TheBigBoyBundle.openModal(props => {
		return (
			React.createElement(ErrorBoundary, {
				id: id,
				plugin: config.info.name,
			}, React.createElement(ModalRoot, {
				...props,
				onClick: props.onClose,
				size: ModalSize.DYNAMIC,
			}, children))
		);
	});
};

const getImageModalComponent = (url, rest = {}) => (
	React.createElement(ImageModal, {
		...rest,
		src: url,
		original: url,
		response: true,
		renderLinkComponent: p => React.createElement(RenderLinkComponent, { ...p, }),
	})
);

const promiseHandler = promise => promise.then(data => [undefined, data]).catch(err => [err]);

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

function parseSpotifyUrl(url) {
	if (typeof url !== "string") return undefined;
	const [, type, id] = url.match(/https?:\/\/open\.spotify\.com\/(\w+)\/(\w+)/) || [];
	return [type, id];
}

function sanitizeSpotifyLink(link) {
	try {
		const url = new URL(link);
		return url.origin + url.pathname;
	} catch {
		return link;
	}
}

const activityPanelClasses = getModule(Filters.byProps("activityPanel", "panels"), { searchExports: false });

function getFluxContainer() {
	const el = document.querySelector(`.${activityPanelClasses.panels}`);
	if (el) {
		const instance = getInternalInstance(el);
		if (instance) return Promise.resolve(instance.child.sibling);
	}
	return new Promise(resolve => {
		const interval = setInterval(() => {
			const el = document.querySelector(`.${activityPanelClasses.panels}`);
			if (!el) return;
			const instance = getInternalInstance(el);
			if (!instance) return;
			resolve(instance.child.sibling);
			clearInterval(interval);
		}, 500);

		setTimeout(() => {
			resolve(null);
			clearInterval(interval);
		}, 20 * 1000);
	});
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

const ConnectedAccountsStore = getModule(m => m._dispatchToken && m.getName() === "ConnectedAccountsStore");

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
		if (!ComponentDispatch) return;
		setTimeout(() => {
			ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
				plainText: content
			});
		});
	};
})();

class Timer {
	constructor(fn, delay) {
		this.delay = delay;
		this.fn = fn;
		this.running = false;
	}

	start() {
		if (this.running) return;
		this.running = true;
		this.timerId = setTimeout(() => {
			this.stop();
			try {
				this.fn.apply(null);
			} catch {}
		}, this.delay);
	}

	stop() {
		if (!this.running) return;
		clearTimeout(this.timerId);
		this.running = false;
	}
}

function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { timeout: 5000, type });
}

const Toast = {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
};

const API_ENDPOINT = "https://api.spotify.com/v1";

async function responseToJson(response) {
	const [error, data] = await promiseHandler(response.json());
	if (!error) return data;
	return { invalidJson: true, error, response };
}

async function wrappedFetch(url, options) {
	const [error, response] = await promiseHandler(fetch(url, options));
	if (error) throw `Network error, ${error}`;

	if (!response.ok) {
		const result = await responseToJson(response.clone());
		throw (
			result.error || {
				message: "Unknown error",
				status: response.status,
				response
			}
		);
	}

	if (response.status === 204) return true;

	return await responseToJson(response);
}

function buildFetchRequestOptions(builderObj) {
	const options = {
		method: builderObj.method,
		headers: builderObj.headers
	};

	if (builderObj.body) options.body = JSON.stringify(builderObj.body);
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

async function requestHandler(action) {
	let repeat = 2;
	while (repeat--) {
		const [actionError, actionResponse] = await promiseHandler(action());
		if (!actionError) return actionResponse;
		if (actionError.status !== 401) {
			Logger.error(actionError);
			throw actionError;
		}

		if (!SpotifyAPI.accountId) throw "Can't refresh expired access token Unknown account ID";

		const [tokenRefreshError, tokenRefreshResponse] = await promiseHandler(RefreshToken(SpotifyAPI.accountId));
		if (tokenRefreshError) {
			Logger.error(tokenRefreshError);
			throw "Could not refresh Spotify token";
		}
		SpotifyAPI.token = tokenRefreshResponse.body.access_token;
	}
}

function playerActions(prop) {
	return (...args) =>
		requestHandler(() => SpotifyAPI[prop].apply(SpotifyAPI, args)).catch(reason => {
			Toast.error(`Could not execute ${prop} command\n${reason.message}`);
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
		.catch(reason => {
			Toast.error(error(type, description, reason.message));
		});
}

const SpotifyApi = new Proxy({}, {
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
			case "setToken":
				return socket => {
					SpotifyAPI.token = socket?.accessToken;
					SpotifyAPI.accountId = socket?.accountId;
				};
			default:
				return undefined;
		}
	}
});

const createStore = getModule(Filters.byStrings("subscribeWithSelector", "useReducer"));

const Utils = {
	copySpotifyLink(link) {
		if (!link) return Toast.error("Could not resolve url");
		copy(sanitizeSpotifyLink(link));
		Toast.success("Link copied!");
	},
	openSpotifyLink(link) {
		if (!link) return Toast.error("Could not resolve url");
		window.open(sanitizeSpotifyLink(link), "_blank");
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

const Store = Object.assign(
	createStore((set, get) => {

		return {
			account: undefined,
			setAccount: socket => {
				if (socket === get().account) return;
				SpotifyApi.setToken(socket);
				set({ account: socket, isActive: !!socket });
			},

			isActive: false,
			setDeviceState: isActive => set({ isActive }),

			async fetchPlayerState() {
				const [err, playerState] = await promiseHandler(SpotifyApi.getPlayerState());
				if (err) return Logger.error("Could not fetch player state", err);
				get().setPlayerState(playerState);
			},

			media: {},
			mediaType: "",
			volume: 50,
			progress: 0,
			isPlaying: false,
			mediaId: "",
			repeat: "",
			shuffle: false,
			actions: {},
			setPlayerState: playerState => {
				if (!playerState || playerState.currently_playing_type === "ad") return;
				const state = get();
				const media = playerState.item?.id === state.media?.id ? state.media : playerState.item;
				set({
					isActive: !!playerState?.device?.is_active,
					volume: playerState?.device?.volume_percent,
					duration: playerState?.item?.duration_ms,
					progress: playerState?.progress_ms,
					isPlaying: playerState?.is_playing,
					repeat: playerState?.repeat_state,
					shuffle: playerState?.shuffle_state,
					media: media,
					mediaId: media?.id,
					mediaType: playerState?.currently_playing_type,
					actions: playerState?.actions?.disallows
				});
			}
		};
	}), {
		init() {
			SpotifyStore.addChangeListener(onSpotifyStoreChange);
			ConnectedAccountsStore.addChangeListener(onAccountsChanged);
			const state = Store.getState();

			const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
			if (!socket) return;
			state.setAccount(socket);

		},
		dispose() {
			SpotifyStore.removeChangeListener(onSpotifyStoreChange);
			ConnectedAccountsStore.removeChangeListener(onAccountsChanged);
			Store.getState().setAccount();
			Store.getState().setPlayerState({});
			timer.stop();
		},
		Utils,
		selectors: {
			isActive: state => state.isActive,
			media: state => state.media,
			mediaType: state => state.mediaType,
			volume: state => state.volume,
			progress: state => state.progress,
			mediaId: state => state.mediaId,
			isPlaying: state => state.isPlaying,
			duration: state => state.duration,
			repeat: state => state.repeat,
			shuffle: state => state.shuffle,
			actions: state => state.actions
		}
	}
);

const timer = new Timer(
	() => {
		const state = Store.getState();
		console.log("Idle Timeout HIT: ", Date());
		state.setAccount(undefined);
	},
	10 * 60 * 1000
);

Store.subscribe(isPlaying => {
	console.log(timer);
	if (isPlaying) return timer.stop();
	if (!isPlaying) return timer.start();
}, Store.selectors.isPlaying);

function onSpotifyStoreChange() {
	try {
		const state = Store.getState();
		if (state.account?.accountId && state.account?.accessToken) return;
		const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
		if (!socket) return;
		state.setAccount(socket);

	} catch (e) {
		Logger.error(e);
	}
}

function onAccountsChanged() {
	try {
		/**
		 * This listener is used to make sure the current account is still connected
		 * SpotifyStore doesn't notify us about this information
		 */
		const state = Store.getState();

		if (!state.account) return;
		const connectedAccounts = ConnectedAccountsStore.getAccounts().filter(account => account.type === "spotify");

		if (connectedAccounts.some(a => a.id === state.account.accountId)) return;

		state.setAccount(undefined);
	} catch (e) {
		Logger.error(e);
	}
}

function getSocketConstructor() {
	const playableComputerDevices = SpotifyStore.getPlayableComputerDevices() || [];
	return playableComputerDevices[0]?.socket?.constructor;
}

function getSocket() {
	const socket = getSocketConstructor();
	if (socket) return Promise.resolve(socket);

	return new Promise(resolve => {
		function listener() {
			try {
				console.log("getSocket listener");
				const socket = getSocketConstructor();
				if (!socket) return;
				SpotifyStore.removeChangeListener(listener);
				resolve(socket);
			} catch (e) {
				Logger.error(e);
			}
		}
		SpotifyStore.addChangeListener(listener);
	});
}

async function patchSpotifySocket() {
	const socket = await getSocket();
	Patcher.after(socket.prototype, "handleEvent", function onSocketEvent(socket, [socketEvent]) {
		Logger.log("Spotify Socket", socketEvent, Date.now());
		const state = Store.getState();

		if (state.account?.accountId && socket.accountId !== state.account?.accountId) return;
		const { type, event } = socketEvent;

		switch (type) {
			case "PLAYER_STATE_CHANGED":
				state.setPlayerState(event.state);
				break;
			case "DEVICE_STATE_CHANGED": {
				const devices = event.devices;
				state.setDeviceState(!!(devices.find(d => d.is_active) || devices[0])?.is_active);
				break;
			}
		}
	});
}

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

const Button = TheBigBoyBundle.Button ||
	function ButtonComponentFallback(props) {
		return React.createElement('button', { ...props, });
	};

const SpotifyControls = ({ id, type, embed: { rawTitle, url } }) => {
	const isActive = Store(Store.selectors.isActive);
	if (!isActive) return null;

	const listenBtn = type !== "show" && (
		React.createElement(ControlBtn, {
			value: "play on spotify",
			onClick: () => SpotifyApi.listen(type, id, rawTitle),
		})
	);

	const queueBtn = (type === "track" || type === "episode") && (
		React.createElement(ControlBtn, {
			value: "add to queue",
			onClick: () => SpotifyApi.queue(type, id, rawTitle),
		})
	);

	return (
		React.createElement('div', { className: "spotify-no-embed-controls", }, listenBtn, queueBtn, React.createElement(ControlBtn, {
			value: "copy link",
			onClick: () => Store.copySpotifyLink(url),
		}))
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

function AddToQueueIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "-1 -1 18 18",
		}, React.createElement('path', { d: "M16 15H2v-1.5h14V15zm0-4.5H2V9h14v1.5zm-8.034-6A5.484 5.484 0 0 1 7.187 6H13.5a2.5 2.5 0 0 0 0-5H7.966c.159.474.255.978.278 1.5H13.5a1 1 0 1 1 0 2H7.966zM2 2V0h1.5v2h2v1.5h-2v2H2v-2H0V2h2z", }))
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

const SpotifyEmbed$1 = ({ id, type, embed: { thumbnail, rawTitle, rawDescription, url } }) => {
	const isPlaying = Store(Store.selectors.isPlaying);
	const isActive = Store(Store.selectors.isActive);
	const mediaId = Store(Store.selectors.mediaId, (n, o) => n === o || (n !== id && o !== id));
	const isThis = mediaId === id;

	const listenBtn = type !== "show" && (
		React.createElement(Tooltip$1, { note: `Play ${type}`, }, React.createElement('div', {
			onClick: () => SpotifyApi.listen(type, id, rawTitle),
			className: "spotifyEmbed-btn spotifyEmbed-btn-listen",
		}, React.createElement(ListenIcon, null)))
	);

	const queueBtn = (type === "track" || type === "episode") && (
		React.createElement(Tooltip$1, { note: `Add ${type} to queue`, }, React.createElement('div', {
			onClick: () => SpotifyApi.queue(type, id, rawTitle),
			className: "spotifyEmbed-btn spotifyEmbed-btn-addToQueue",
		}, React.createElement(AddToQueueIcon, null)))
	);

	let className = "spotifyEmbed-Container";
	if (isThis && isPlaying) className += " playing";

	return (
		React.createElement('div', {
				className: className,
				style: { "--thumbnail": `url(${thumbnail?.proxyURL || thumbnail?.url})` },
			}, React.createElement(Tooltip$1, { note: "View", }, React.createElement('div', {
				onClick: () => {
					let { proxyURL, url, width, height } = thumbnail;
					width = width > 650 ? 650 : width;
					height = height > 650 ? 650 : height;
					openModal(React.createElement('div', { className: "spotify-banner-modal", }, getImageModalComponent(proxyURL || url, { width, height })));
				},
				className: "spotifyEmbed-thumbnail",
			})), React.createElement('h2', { className: "spotifyEmbed-title", }, rawTitle), React.createElement('p', { className: "spotifyEmbed-description", }, rawDescription)

			, type && id && (
				React.createElement('div', { className: "spotifyEmbed-controls", }, !isThis && isActive && [listenBtn, queueBtn], React.createElement(Tooltip$1, { note: "Copy link", }, React.createElement('div', {
					onClick: () => Store.Utils.copySpotifyLink(url),
					className: "spotifyEmbed-btn spotifyEmbed-btn-copy",
				}, React.createElement(CopyIcon, null))))
			), React.createElement(Tooltip$1, { note: "Play on Spotify", }, React.createElement('div', {
				onClick: () => Store.Utils.openSpotifyLink(url),
				className: "spotifyEmbed-spotifyIcon",
			}, React.createElement(SpotifyIcon, null)))
		)
	);
};

function SpotifyEmbedWrapper({ id, type, embedObject, embedComponent }) {
	const spotifyEmbed = useSettings("spotifyEmbed");
	switch (spotifyEmbed) {
		case EmbedStyleEnum.KEEP:
			return [
				embedComponent,

				React.createElement(SpotifyControls, {
					id: id,
					type: type,
					embed: embedObject,
				})
			];
		case EmbedStyleEnum.REPLACE:
			return (
				React.createElement(SpotifyEmbed$1, {
					id: id,
					type: type,
					embed: embedObject,
				})
			);
		case EmbedStyleEnum.HIDE:
			return (
				React.createElement(SpotifyControls, {
					id: id,
					type: type,
					embed: embedObject,
				})
			);
	}
	return embedComponent;
}

const ALLOWD_TYPES = ["track", "playlist", "album", "show", "episode"];
const SpotifyEmbed = getModule(Filters.byStrings("open.spotify.com", "/playlist/"), { defaultExport: false });

const patchSpotifyEmbed = () => {
	if (SpotifyEmbed)
		Patcher.after(SpotifyEmbed, "default", (_, [{ embed }], ret) => {
			const [type, id] = parseSpotifyUrl(embed.url) || [];
			if (!ALLOWD_TYPES.includes(type)) {
				Logger.log(`Spotify ${type}`, embed.url);
				return;
			}

			return (
				React.createElement(ErrorBoundary, {
					id: "SpotifyEmbed",
					plugin: config.info.name,
					fallback: ret,
				}, React.createElement(SpotifyEmbedWrapper, {
					id: id,
					type: type,
					embedComponent: ret,
					embedObject: embed,
				}))
			);
		});
	else Logger.patch("SpotifyEmbed");
};

const { Popout } = TheBigBoyBundle;

const Popout$1 = ({ delay, spacing, forceShow, position, animation, align, className, renderPopout, children }) => {
	const [show, setShow] = React.useState(false);
	const leaveRef = React.useRef();
	const enterRef = React.useRef();

	return (
		React.createElement('div', {
			className: `${config.info.name}-popout-container ${className ? className : ""}`,
			onMouseLeave: () => {
				clearTimeout(enterRef.current);
				enterRef.current = null;
				leaveRef.current = setTimeout(() => {
					setShow(false);
					leaveRef.current = null;
				}, 150);
			},
			onMouseEnter: () => {
				if (leaveRef.current) {
					clearTimeout(leaveRef.current);
					leaveRef.current = null;
					return;
				}

				enterRef.current = setTimeout(() => {
					console.log("onMouseEnter delayed setShow setTimeout");
					setShow(true);
				}, delay || 150);
			},
		}, React.createElement(Popout, {
			renderPopout: renderPopout,
			shouldShow: forceShow || show,
			onRequestClose: () => console.log("onRequestClose"),
			onRequestOpen: () => console.log("onRequestOpen"),
			position: position ?? "top",
			align: align ?? "left",
			animation: animation ?? "1",
			spacing: spacing ?? 8,
		}, () => children))
	);
};

function MuteVolumeIcon() {
	return (
		React.createElement('svg', {
			fill: "currentColor",
			width: "24",
			height: "24",
			viewBox: "0 0 16 16",
		}, React.createElement('path', { d: "M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z", }), React.createElement('path', { d: "M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z", }), " ")
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

const { MenuItem, Menu } = TheBigBoyBundle;

const SpotifyPlayerControls = ({ banner, media }) => {
	const isPlaying = Store(Store.selectors.isPlaying);
	const shuffle = Store(Store.selectors.shuffle);
	const repeat = Store(Store.selectors.repeat);
	const volume = Store(Store.selectors.volume);
	const actions = Store(Store.selectors.actions);

	const url = media?.external_urls?.spotify;
	const { toggling_shuffle, toggling_repeat_track, skipping_next, skipping_prev } = actions || {};

	const { repeatTooltip, repeatActive, repeatIcon, repeatArg } = {
		off: {
			repeatTooltip: "Repeat",
			repeatArg: "context",
			repeatIcon: React.createElement(RepeatIcon, null),
			repeatActive: false
		},
		context: {
			repeatTooltip: "Repeat track",
			repeatArg: "track",
			repeatIcon: React.createElement(RepeatIcon, null),
			repeatActive: true
		},
		track: {
			repeatTooltip: "Repeat off",
			repeatArg: "off",
			repeatIcon: React.createElement(RepeatOneIcon, null),
			repeatActive: true
		}
	} [repeat || "off"];

	const shuffleHandler = () => SpotifyApi.shuffle(!shuffle);
	const previousHandler = () => SpotifyApi.previous();
	const nextHandler = () => SpotifyApi.next();
	const repeatHandler = () => SpotifyApi.repeat(repeatArg);
	const pauseHandler = () => SpotifyApi.pause();
	const playHandler = () => SpotifyApi.play();

	const shareSongHandler = () => Store.Utils.share(url);
	const sharePosterHandler = () => Store.Utils.share(banner);

	const copySongHandler = () => Store.Utils.copySpotifyLink(url);
	const copyPosterHandler = () => Store.Utils.copySpotifyLink(banner);

	const { playPauseTooltip, playPauseHandler, playPauseIcon, playPauseClassName } = {
		true: {
			playPauseTooltip: "Pause",
			playPauseClassName: "spotify-player-controls-pause",
			playPauseHandler: pauseHandler,
			playPauseIcon: React.createElement(PauseIcon, null)
		},
		false: {
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
						className: "spotify-player-share-menuitem",
						id: "copy-song-link",
						key: "copy-song-link",
						icon: CopyIcon,
						action: copySongHandler,
						label: "Copy song url",
					}), React.createElement(MenuItem, {
						className: "spotify-player-share-menuitem",
						id: "copy-poster-link",
						key: "copy-poster-link",
						action: copyPosterHandler,
						icon: CopyIcon,
						label: "Copy poster url",
					}), React.createElement(MenuItem, {
						className: "spotify-player-share-menuitem",
						id: "share-song-link",
						key: "share-song-link",
						action: shareSongHandler,
						icon: ShareIcon,
						label: "Share song in current channel",
					}), React.createElement(MenuItem, {
						className: "spotify-player-share-menuitem",
						id: "share-poster-link",
						key: "share-poster-link",
						action: sharePosterHandler,
						icon: ShareIcon,
						label: "Share poster in current channel",
					}))
				),
				align: "left",
				position: "top",
				animation: "1",
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

			, React.createElement(Volume, { volume: volume, })
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

function Volume({ volume }) {
	const [val, setVal] = React.useState(volume);
	const [active, setActive] = React.useState(false);
	const volumeRef = React.useRef(volume || 25);

	React.useEffect(() => {
		if (volume) volumeRef.current = volume;
		if (!active) setVal(volume);
	}, [volume]);

	const volumeMuteHandler = () => {
		const target = val ? 0 : volumeRef.current;
		SpotifyApi.volume(target).then(() => {
			setVal(target);
		});
	};

	const volumeOnChange = e => setVal(Math.round(e.target.value));
	const volumeOnMouseDown = () => setActive(true);
	const volumeOnMouseUp = () => {
		setActive(false);
		SpotifyApi.volume(val).then(() => (volumeRef.current = val));
	};

	return (
		React.createElement(Popout$1, {
			renderPopout: () => (
				React.createElement('div', { className: "spotify-player-controls-volume-slider-wrapper", }, React.createElement('input', {
					value: val,
					onChange: volumeOnChange,
					onMouseUp: volumeOnMouseUp,
					onMouseDown: volumeOnMouseDown,
					type: "range",
					step: "1",
					min: "0",
					max: "100",
					className: "spotify-player-controls-volume-slider",
				}))
			),
			position: "top",
			align: "center",
			animation: "1",
			spacing: 8,
		}, React.createElement(SpotifyPlayerButton, {
			className: "spotify-player-controls-volume",
			onClick: volumeMuteHandler,
			value: val ? React.createElement(VolumeIcon, null) : React.createElement(MuteVolumeIcon, null),
		}))
	);
}

const { Anchor } = TheBigBoyBundle;

const TrackMediaDetails = ({ media, mediaType }) => {
	if (mediaType !== "track" || !media) {
		return (
			React.createElement('div', { className: "spotify-player-media", }, React.createElement('div', { className: "spotify-player-title", }, "Playing ", mediaType || "Unknown"))
		);
	}

	const albumName = media.album.name;
	const albumUrl = media.album.external_urls.spotify;
	const url = media.external_urls.spotify;
	const name = media.name;
	const artists = media.artists;

	const { bannerSm, bannerLg } = {
		bannerSm: media.album.images[2],
		bannerLg: media.album.images[0]
	};

	return (
		React.createElement('div', { className: "spotify-player-media", }, React.createElement(TrackBanner, {
			bannerSm: bannerSm,
			bannerLg: bannerLg,
		}), React.createElement(Tooltip$1, { note: name, }, React.createElement(Anchor, {
			href: url,
			className: "spotify-player-title",
		}, name)), React.createElement(Artist, { artists: artists, }), React.createElement(Tooltip$1, { note: albumName, }, React.createElement('div', { className: "spotify-player-album", }, "on ", React.createElement(Anchor, { href: albumUrl, }, albumName))))
	);
};

function transformArtist(artist) {
	return (
		React.createElement(Anchor, {
			className: "spotify-player-artist-link",
			href: `https://open.spotify.com/artist/${artist.id}`,
		}, artist.name)
	);
}

function Artist({ artists }) {
	const first = React.createElement('div', { className: "spotify-player-artist", }, "by ", transformArtist(artists[0]));

	if (artists.length === 1) return first;
	return (
		React.createElement(Popout$1, {
			renderPopout: () => React.createElement('div', { className: "spotify-player-artists-popout", }, " ", artists.map(transformArtist)),
			position: "top",
			align: "center",
			animation: "1",
			className: "spotify-player-multiple-artists",
			spacing: 0,
		}, first)
	);
}

function TrackBanner({ bannerLg }) {
	const thumbnailClickHandler = () => {
		if (!bannerLg.url) return Toast.error("Could not open banner");
		const { url, ...rest } = bannerLg;
		openModal(React.createElement('div', { className: "spotify-banner-modal", }, getImageModalComponent(url, rest)));
	};

	return (
		React.createElement(Tooltip$1, { note: "View", }, React.createElement('div', {
			onClick: thumbnailClickHandler,
			className: "spotify-player-banner",
		}))
	);
}

function formatMsToTime(ms) {
	const time = new Date(ms);
	return [time.getUTCHours(), String(time.getUTCMinutes()), String(time.getUTCSeconds()).padStart(2, "0")].filter(Boolean).join(":");
}

const TrackTimeLine = ({ mediaType }) => {
	const isPlaying = Store(Store.selectors.isPlaying);
	const progress = Store(Store.selectors.progress);
	const duration = Store(Store.selectors.duration);

	const [position, setPosition] = React.useState(progress);
	const sliderRef = React.useRef();
	const intervalRef = React.useRef();

	React.useEffect(() => {
		if (!sliderRef.current?.state?.active) setPosition(progress);
	}, [progress]);

	React.useEffect(() => {
		if (isPlaying) return;
		if (position < duration) return;
		clearInterval(intervalRef.current);
		setPosition(duration || progress);
	}, [position, isPlaying]);

	React.useEffect(() => {
		if (!isPlaying) return;
		intervalRef.current = setInterval(() => setPosition(p => p + 1000), 1000);
		return () => clearInterval(intervalRef.current);
	}, [progress, isPlaying]);

	const rangeChangeHandler = e => {
		if (!sliderRef.current?.state?.active) return;
		clearInterval(intervalRef.current);
		const pos = Math.floor(e);
		setPosition(pos);
		SpotifyApi.seek(pos);
	};

	if (mediaType !== "track")
		return (
			React.createElement('div', { className: "spotify-player-timeline", }, React.createElement('div', { className: "spotify-player-timeline-progress", }, formatMsToTime(position)))
		);
	return (
		React.createElement('div', { className: "spotify-player-timeline", }, React.createElement(TheBigBoyBundle.Slider, {
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

const SpotifyPlayer = React.memo(function SpotifyPlayer() {
	const player = useSettings("player");

	console.log("SpotifyPlayer");

	const isActive = Store(Store.selectors.isActive);
	const media = Store(Store.selectors.media);
	const mediaType = Store(Store.selectors.mediaType);

	if (!player || !isActive || !mediaType) return;

	const { bannerMd, bannerSm, bannerLg } = {
		bannerSm: media?.album?.images[2],
		bannerMd: media?.album?.images[1],
		bannerLg: media?.album?.images[0]
	};

	return (
		React.createElement('div', {
				style: {
					"--banner-sm": `url(${bannerSm?.url})`,
					"--banner-md": `url(${bannerMd?.url})`,
					"--banner-lg": `url(${bannerLg?.url})`
				},
				className: "spotify-player-container",
			}

			, React.createElement(TrackMediaDetails, {
				mediaType: mediaType,
				media: media,
			})

			, React.createElement(TrackTimeLine, {
				mediaType: mediaType,
				media: media,
			})

			, React.createElement(SpotifyPlayerControls, {
				banner: bannerLg,
				media: media,
			})
		)
	);
});

const patchSpotifyPlayer = async () => {
	const fluxContainer = await getFluxContainer();
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

const { useSpotifyPlayAction, useSpotifySyncAction } = getModule(Filters.byProps("useSpotifyPlayAction"));

const SpotifyActivityControls = ({ activity, user, source }) => {
	const isActive = Store(Store.selectors.isActive);

	const userSyncActivityState = useSpotifySyncAction(activity, user, source);
	const userPlayActivityState = useSpotifyPlayAction(activity, user, source);

	return (
		React.createElement('div', { className: "spotify-activity-controls", }, React.createElement(Play, { userPlayActivityState: userPlayActivityState, }), React.createElement(Tooltip$1, { note: "Add to queue", }, React.createElement(ActivityControlButton, {
			className: "activity-controls-queue",
			value: React.createElement(AddToQueueIcon, null),
			disabled: !isActive,
			onClick: () => SpotifyApi.queue("track", activity.sync_id, activity.details),
		})), React.createElement(Tooltip$1, { note: "Share in current channel", }, React.createElement(ActivityControlButton, {
			className: "activity-controls-share",
			onClick: () => Store.Utils.share(`https://open.spotify.com/track/${activity.sync_id}`),
			value: React.createElement(ShareIcon, null),
		})), React.createElement(ListenAlong, { userSyncActivityState: userSyncActivityState, }))
	);
};

function Play({ userPlayActivityState }) {
	const { label, disabled, onClick, tooltip } = userPlayActivityState;

	return (
		React.createElement(Tooltip$1, { note: tooltip || label, }, React.createElement(ActivityControlButton, {
			disabled: disabled,
			fullWidth: true,
			grow: true,
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

function ActivityControlButton({ grow, value, onClick, ...rest }) {
	return (
		React.createElement(Button, {
			size: Button.Sizes.NONE,
			color: Button.Colors.PRIMARY,
			look: Button.Colors.OUTLINED,
			onClick: onClick,
			grow: grow || false,
			...rest,
		}, value)
	);
}

const ActivityComponent = getModule(a => a.prototype.isStreamerOnTypeActivityFeed);

const patchSpotifyActivity = () => {
	if (ActivityComponent)
		Patcher.before(ActivityComponent.prototype, "render", ({ props }) => {
			if (!Settings.get("activity")) return;
			if (!props.activity) return;
			if (props.activity.name.toLowerCase() !== "spotify") return;

			props.renderActions = () => (
				React.createElement(ErrorBoundary, {
					id: "SpotifyEmbed",
					plugin: config.info.name,
				}, React.createElement(SpotifyActivityControls, {
					...props,
				}))
			);
		});
	else Logger.patch("SpotifyActivityComponent");
};

const Switch = TheBigBoyBundle.FormSwitch ||
	function SwitchComponentFallback(props) {
		return (
			React.createElement('div', { style: { color: "#fff" }, }, props.children, React.createElement('input', {
				type: "checkbox",
				checked: props.value,
				onChange: e => props.onChange(e.target.checked),
			}))
		);
	};

const { Heading, RadioGroup } = TheBigBoyBundle;

function useSetting(setting) {
	return {
		get: React.useCallback(() => Settings.get(setting), []),
		set: React.useCallback(e => Settings.set(setting, e), [])
	};
}

function SpotifyEmbedOptions() {
	const { get, set } = useSetting("spotifyEmbed");
	const [selected, setSelected] = React.useState(get());
	return (
		React.createElement(React.Fragment, null, React.createElement(Heading, {
				style: { marginBottom: 15 },
				tag: "h5",
			}, "spotify embed style"

		), React.createElement(RadioGroup, {
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
			value: selected,
			onChange: e => {
				set(e.value);
				setSelected(e.value);
			},
		}))
	);
}

function PlayerState() {
	const { get, set } = useSetting("player");
	const [enabled, setEnabled] = React.useState(get());
	return (
		React.createElement(Switch, {
				value: enabled,
				hideBorder: false,
				onChange: e => {
					set(e);
					setEnabled(e);
				},
			}, "Enable/Disable player"

		)
	);
}

function ActivityState() {
	const { get, set } = useSetting("activity");
	const [enabled, setEnabled] = React.useState(get());
	return (
		React.createElement(Switch, {
				value: enabled,
				hideBorder: false,
				onChange: e => {
					set(e);
					setEnabled(e);
				},
			}, "Modify activity"

		)
	);
}

const SettingComponent = [React.createElement(PlayerState, null), React.createElement(ActivityState, null), React.createElement(SpotifyEmbedOptions, null)];

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
	cursor: pointer;
	width: 80px;
	height: 80px;
	background: var(--thumbnail) center/cover no-repeat;
	border-radius: var(--radius);
}

.spotifyEmbed-Container.playing .spotifyEmbed-thumbnail {
	border-radius: 50%;
	position: relative;
	box-shadow: 0 0 0 0 #0008;
	animation:
		r 10s linear infinite,
		b 1.5s infinite linear;
	position: relative;
}

.spotifyEmbed-Container.playing .spotifyEmbed-thumbnail:after {
	content: "";
	position: absolute;
	inset: 0;
	border-radius: inherit;
	box-shadow: 0 0 0 0 #0004;
	animation: inherit;
	animation-delay: -0.5s;
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
	margin-top: 12px;
	gap: 8px;
}

.spotify-activity-controls button {
	padding: 0px;
	height: 32px;
	width: 32px;
	flex: 0 0 32px;
}

.spotify-activity-controls button > div {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.spotify-activity-controls .activity-controls-listen {
	flex: 1;
}

/* Spotify Player */
.spotify-player-container {
	padding: 10px 10px;
color:white;
	display: flex;
	flex-direction: column;
}

.spotify-player-media {
	color: white;
	font-size: 0.9rem;
	overflow:hidden;
	display: grid;
	column-gap: 10px;
	z-index:5;
	grid-template-columns: 64px minmax(0, 1fr);
	grid-template-rows: repeat(3, 1fr);
	align-items: center;
	justify-items: flex-start;
	grid-template-areas:
		"banner title"
		"banner artist"
		"banner album";
}

div:has(> .spotify-banner-modal) {
	background: #0000;
}

.spotify-player-banner {
	grid-area: banner;
	cursor: pointer;
	width: 64px;
	height: 64px;
	background:
		var(--banner-sm) center/cover no-repeat,
		lime;
	border-radius: 5px;
}

.spotify-player-title {
	grid-area: title;
	font-weight: bold;
	color: #fff;
	font-size: 1.05rem;
	max-width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.spotify-player-title:first-child {
	grid-column: 1/-1;
	grid-row: 1/-1;
	margin-bottom: 5px;
}

.spotify-player-artist {
	grid-area: artist;
	font-size: 0.8rem;
	--text-link: var(--text-sub);
	max-width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.spotify-player-multiple-artists{
	display:contents;
}

.spotify-player-artists-popout {
	background: var(--background-secondary-alt);
	padding: 10px;
	gap: 2px;
	border-radius: 5px;
	display: flex;
	flex-direction: column;
}

.spotify-player-artists-popout .spotify-player-artist-link {
	font-size: 0.9rem;
	--text-link: var(--text-sub);
	counter-increment: p;
}

.spotify-player-artists-popout .spotify-player-artist-link:before {
	content: counter(p) ") ";
}
.spotify-player-album {
	grid-area: album;
	--text-link: var(--text-sub);
	max-width: 100%;
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
	flex: 1;
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
	height: 120px;
	width: 20px;
	background: var(--background-floating);
	padding: 5px 1px;
	border-radius: 99px;
}

.spotify-player-controls-volume-slider {
	margin: 0;
	width: 100%;
	height: 100%;
	accent-color: var(--spotify-green);
	appearance: slider-vertical;
}

.spotify-player-share-menuitem svg{
	width:16px;
	height:16px;
}

.spotify-no-embed-controls{
	display:flex;
	min-width:400px;
	max-width: 400px;
	gap:5px;
}
.spotify-no-embed-controls > button{
	flex:1 0 0;
	text-transform: capitalize;
}`;

window.SpotifyStore = Store;
window.SpotifyAPI = SpotifyAPI;
window.SpotSettings = Settings;

class SpotifyEnhance {
	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			Store.init();
			patchListenAlong();
			patchSpotifyEmbed();
			patchSpotifySocket();
			patchSpotifyActivity();

			patchSpotifyPlayer();
		} catch (e) {
			Logger.error(e);
		}
	}

	async stop() {
		try {
			Store.dispose();
			DOM.removeStyle();
			Patcher.unpatchAll();

			const fluxContainer = await getFluxContainer();
			if (fluxContainer) fluxContainer.stateNode.forceUpdate();
		} catch (e) {
			Logger.error(e);
		}
	}

	getSettingsPanel() {
		return SettingComponent;
	}
}

module.exports = SpotifyEnhance;
