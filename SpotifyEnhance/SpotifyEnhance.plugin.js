/**
 * @runAt idle
 * @name SpotifyEnhance
 * @description All in one better spotify-discord experience.
 * @version 1.1.17
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/SpotifyEnhance
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/SpotifyEnhance/SpotifyEnhance.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "SpotifyEnhance",
		"version": "1.1.17",
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
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var UI = /* @__PURE__ */ (() => BdApi.UI)();

// common/Utils/Logger.js
var Logger_default = Logger;

// common/Plugin.js
var target = /* @__PURE__ */ (() => new EventTarget())();

function wrap(handler) {
	return (e) => {
		try {
			handler.apply(null, e);
		} catch (err) {
			Logger_default.error(`Could not run [${e.type}] handler`, { handler }, "\n", err);
		}
	};
}
var Plugin_default = {
	onStart: (handler, props) => target.addEventListener("START", wrap(handler), props),
	onStop: (handler, props) => target.addEventListener("STOP", wrap(handler), props),
	start() {
		target.dispatchEvent(new Event("START"));
	},
	stop() {
		target.dispatchEvent(new Event("STOP"));
	}
};

// common/Utils/StylesLoader.js
var styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};
Plugin_default.onStart(() => DOM.addStyle(styleLoader._styles.join("\n")));
Plugin_default.onStop(() => DOM.removeStyle());
var StylesLoader_default = styleLoader;

// src/SpotifyEnhance/styles.css
StylesLoader_default.push(`:root {
	--SpotifyEnhance-spotify-green: #1ed760;
	--SpotifyEnhance-text-sub: #a7a7a7;
	--SpotifyEnhance-radius: 8px;
	--SpotifyEnhance-gutter: 10px;
	--SpotifyEnhance-font: gg sans, Helvetica Neue, helvetica, arial, Hiragino Kaku Gothic Pro, Meiryo, MS Gothic;
}

.pointer:hover{
	cursor: pointer;
}

.outline:hover{
	text-decoration: underline;
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
}`);

// common/React.jsx
var useState = /* @__PURE__ */ (() => BdApi.React.useState)();
var useEffect = /* @__PURE__ */ (() => BdApi.React.useEffect)();
var useRef = /* @__PURE__ */ (() => BdApi.React.useRef)();
var useCallback = /* @__PURE__ */ (() => BdApi.React.useCallback)();
var useMemo = /* @__PURE__ */ (() => BdApi.React.useMemo)();
var Children = /* @__PURE__ */ (() => BdApi.React.Children)();
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;

// common/Components/Icon/index.jsx
function svg(svgProps, ...paths) {
	return (comProps) => (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		/* @__PURE__ */
		React_default.createElement(
			"svg", {
				fill: "currentColor",
				width: "24",
				height: "24",
				viewBox: "0 0 24 24",
				...svgProps,
				...comProps
			},
			paths.map((p) => typeof p === "string" ? /* @__PURE__ */ path(null, p) : p)
		)
	);
}

function path(props, d) {
	return /* @__PURE__ */ React_default.createElement(
		"path", {
			...props,
			d
		}
	);
}
var AddToQueueIcon = /* @__PURE__ */ svg({ viewBox: "-1 -1 18 18" }, "M16 15H2v-1.5h14V15zm0-4.5H2V9h14v1.5zm-8.034-6A5.484 5.484 0 0 1 7.187 6H13.5a2.5 2.5 0 0 0 0-5H7.966c.159.474.255.978.278 1.5H13.5a1 1 0 1 1 0 2H7.966zM2 2V0h1.5v2h2v1.5h-2v2H2v-2H0V2h2z");
var ArrowIcon = /* @__PURE__ */ svg(null, "M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z");
var CopyIcon = /* @__PURE__ */ svg(null, "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z", "M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z");
var ExternalLinkIcon = /* @__PURE__ */ svg({ viewBox: "0 0 16 16" }, "M1 2.75A.75.75 0 0 1 1.75 2H7v1.5H2.5v11h10.219V9h1.5v6.25a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75V2.75z", "M15 1v4.993a.75.75 0 1 1-1.5 0V3.56L8.78 8.28a.75.75 0 0 1-1.06-1.06l4.72-4.72h-2.433a.75.75 0 0 1 0-1.5H15z");
var ImageIcon = /* @__PURE__ */ svg({ viewBox: "-50 -50 484 484" }, "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z");
var ListenAlongIcon = /* @__PURE__ */ svg(null, "M11.8 14a6.1 6.1 0 0 0 0 6H3v-2c0-2.7 5.3-4 8-4h.8zm-.8-2c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm6 1c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm-1 6.2l3-2.2-3-2.2v4.4z");
var ListenIcon = /* @__PURE__ */ svg(null, "M22 16.53C22 18.3282 20.2485 19.7837 18.089 19.7837C15.9285 19.7837 14.5396 18.3277 14.5396 16.53C14.5396 14.7319 15.9286 13.2746 18.089 13.2746C18.7169 13.2746 19.3089 13.4013 19.8353 13.6205V5.814L9.46075 7.32352V18.7449C9.46075 20.5424 7.70957 22 5.54941 22C3.38871 22 2 20.5443 2 18.7456C2 16.9481 3.3892 15.4898 5.54941 15.4898C6.17823 15.4898 6.76966 15.6162 7.29604 15.836C7.29604 11.3608 7.29604 8.5366 7.29604 4.1395L21.9996 2L22 16.53Z");
var MuteVolumeIcon = /* @__PURE__ */ svg({ viewBox: "0 0 16 16" }, "M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z", "M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z");
var NextIcon = /* @__PURE__ */ svg({ viewBox: "0 0 16 16" }, "M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z");
var PauseIcon = /* @__PURE__ */ svg({ viewBox: "0 0 16 16" }, "M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z");
var PlayIcon = /* @__PURE__ */ svg({ viewBox: "0 0 16 16" }, "M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z");
var PreviousIcon = /* @__PURE__ */ svg({ viewBox: "0 0 16 16" }, "M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z");
var RepeatPath = "M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z";
var RepeatIcon = /* @__PURE__ */ svg({ viewBox: "0 0 16 16" }, RepeatPath);
var RepeatOneIcon = /* @__PURE__ */ svg({ viewBox: "0 0 16 16" }, RepeatPath, "M9.12 8V1H7.787c-.128.72-.76 1.293-1.787 1.313V3.36h1.57V8h1.55z");
var ShareIcon = /* @__PURE__ */ svg(null, "M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z");
var ShuffleIcon = /* @__PURE__ */ svg({ viewBox: "0 0 16 16" }, "M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z", "m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z");
var SpotifyIcon = /* @__PURE__ */ svg(
	null,
	"M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2ZM16.5625 16.4375C16.3791 16.7161 16.0145 16.8107 15.7188 16.6562C13.375 15.2188 10.4062 14.9062 6.9375 15.6875C6.71979 15.7377 6.49182 15.668 6.33945 15.5046C6.18709 15.3412 6.13348 15.1089 6.19883 14.8952C6.26417 14.6816 6.43854 14.519 6.65625 14.4688C10.4688 13.5938 13.7188 13.9688 16.375 15.5938C16.5149 15.6781 16.6141 15.816 16.6495 15.9755C16.685 16.1349 16.6535 16.3019 16.5625 16.4375ZM17.8125 13.6875C17.7053 13.8622 17.5328 13.9869 17.3333 14.0338C17.1338 14.0807 16.9238 14.0461 16.75 13.9375C14.0625 12.2812 9.96875 11.8125 6.78125 12.7812C6.5133 12.8594 6.22401 12.7887 6.02236 12.5957C5.8207 12.4027 5.73731 12.1168 5.80361 11.8457C5.8699 11.5746 6.0758 11.3594 6.34375 11.2812C9.96875 10.1875 14.5 10.7188 17.5625 12.625C17.9134 12.8575 18.0229 13.3229 17.8125 13.6875ZM17.9062 10.875C14.6875 8.96875 9.375 8.78125 6.28125 9.71875C5.81691 9.79284 5.36952 9.5115 5.23513 9.0609C5.10074 8.61031 5.32093 8.12986 5.75 7.9375C9.28125 6.875 15.1562 7.0625 18.875 9.28125C19.0893 9.40709 19.2434 9.61436 19.3023 9.85577C19.3612 10.0972 19.3198 10.3521 19.1875 10.5625C18.9054 10.9822 18.3499 11.1177 17.9062 10.875Z"
);
var VolumeIcon = /* @__PURE__ */ svg({ viewBox: "0 0 16 16" }, "M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z", "M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z");

// common/Utils/index.js
function hasOwn(object, key) {
	return object && key && key in object;
}

function getObjectKey(object = {}, filter) {
	for (const key in object) {
		if (!filter(object[key])) continue;
		return key;
	}
}
var openLink = (link) => link && window.open(link, "_blank");

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
var getPathName = (url) => {
	try {
		return new URL(url).pathname;
	} catch {}
};

function shallow(objA, objB) {
	if (Object.is(objA, objB)) return true;
	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null)
		return false;
	const keysA = Object.keys(objA);
	if (keysA.length !== Object.keys(objB).length) return false;
	for (let i = 0; i < keysA.length; i++)
		if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]]))
			return false;
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

function buildUrl(endpoint, path2, params) {
	const uri = endpoint + path2;
	if (params) {
		params = genUrlParamsFromArray(params);
		return `${uri}?${params}`;
	}
	return uri;
}

function preventDefault(handler = nop) {
	return (e) => {
		e.preventDefault();
		e.stopPropagation();
		handler.apply(null, [e]);
	};
}

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
	setPath(path2) {
		this.path = path2;
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
		let body;
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

// common/consts.js
var UNDEFINED_OBJECT_OR_KEY = "Undefined object or key";
var PATCH_ERROR = "Could not perform a patch";
var MISSING_ARGUMENTS = "Missing arguments";

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();
var abortController = /* @__PURE__ */ (() => {
	Plugin_default.onStart(() => abortController = new AbortController());
	Plugin_default.onStop(() => abortController.abort());
	return new AbortController();
})();

function lazy(filter, { decFilter, ...options } = {}) {
	if (!filter) return Logger_default.error(`[Webpack lazy] ${MISSING_ARGUMENTS}`);
	const { promise, resolve } = Promise.withResolvers();
	waitForModule(filter, {
		...options,
		raw: true,
		fatal: false,
		signal: abortController.signal
	}).then((module2) => {
		if (!module2) throw "waitForModule resolved with undefined";
		const object = decFilter ? module2.declarations : module2.exports;
		const key = getObjectKey(object, decFilter || filter);
		if (!object || !key) throw UNDEFINED_OBJECT_OR_KEY;
		resolve([object, key]);
	}).catch((err) => Logger_default.error(PATCH_ERROR, err));
	return promise;
}

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target2) => target2[type] && filter(target2[type]);
}

function getDeclarationAndKey(moduleFilter, declarationFilter, options = {}) {
	const module2 = getModule(moduleFilter, { ...options, raw: true });
	if (!module2?.declarations) return;
	const key = getObjectKey(module2.declarations, declarationFilter);
	return key ? [module2.declarations, key] : void 0;
}

// MODULES-AUTO-LOADER:@Modules/RefreshToken
var RefreshToken_default = /* @__PURE__ */ (() => getModule(Filters.byStrings("CONNECTION_ACCESS_TOKEN"), { searchExports: true }))();

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
Plugin_default.onStart(() => {
	DB.init();
});
Plugin_default.onStop(() => {
	DB.dispose();
});
var DB_default = DB;

// MODULES-AUTO-LOADER:@Modules/MessageActions
var MessageActions_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("jumpToMessage", "_sendMessage"), { searchExports: false }))();

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true }))();

// MODULES-AUTO-LOADER:@Stores/PendingReplyStore
var PendingReplyStore_default = /* @__PURE__ */ (() => getStore("PendingReplyStore"))();

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = /* @__PURE__ */ (() => getStore("SelectedChannelStore"))();

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

function sendMessageDirectly(content, channelId) {
	if (!MessageActions_default?.sendMessage || typeof MessageActions_default.sendMessage !== "function") return;
	if (!channelId) channelId = SelectedChannelStore_default.getChannelId();
	return MessageActions_default.sendMessage(
		channelId, {
			validNonShortcutEmojis: [],
			content
		},
		void 0,
		getReply(channelId)
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

// src/SpotifyEnhance/utils.js
function spotifyCopy(content) {
	if (!content) return Toast_default.error("Copy failed!");
	copy(content);
	Toast_default.success("Copied!");
}
var copySpotifyUrl = (url) => spotifyCopy(sanitizeSpotifyLink(url));
var openSpotifyUrl = (url) => openLink(sanitizeSpotifyLink(url));

function spotifyShare(content) {
	if (!content) return Toast_default.error("Share failed");
	const id = SelectedChannelStore_default.getCurrentlySelectedChannelId();
	if (!id) return Toast_default.info("There is no Selected Channel");
	sendMessageDirectly(content, id).catch(() => {
		insertText(content);
	});
}

function parseSpotifyUrl(url) {
	const path2 = getPathName(url);
	if (!path2) return void 0;
	const urlFrags = path2.split("/");
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

function useGetRessource(type, id) {
	const [state, setState] = React_default.useState(null);
	React_default.useEffect(() => {
		(async () => {
			const data = await store_default.Api.getRessource(type, id);
			if (data) setState(data);
		})();
	}, [id, type]);
	return state;
}
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

// src/SpotifyEnhance/store/store.js
var getters = {
	getAlbum() {
		const media = this.state.media;
		return {
			...media.album,
			url: media.album.external_urls.spotify
		};
	},
	getFullSongName() {
		const state = this.state;
		if (!state.media) return "";
		const { artists, album } = state.media;
		return `Name: ${state.media.name}
Artist${artists.length > 1 ? "s" : ""}: ${artists.map((a) => a.name).join(" ,")}
Album: ${album.name}`;
	},
	getSongUrl() {
		return sanitizeSpotifyLink(this.state.media?.external_urls?.spotify);
	},
	getPlaylistUrl() {
		return sanitizeSpotifyLink(this.state.ontext?.external_urls?.spotify);
	},
	getSongBanners() {
		const media = this.state.media;
		return {
			bannerSm: media?.album?.images[2],
			bannerMd: media?.album?.images[1],
			bannerLg: media?.album?.images[0]
		};
	}
};
var setters = {
	setAccount(account) {
		if (account === this.state.account) return;
		this.setState({ account, isActive: !!account });
	},
	setPlayerState(playerState) {
		if (!playerState || playerState.currently_playing_type === "ad")
			return this.setState({ isPlaying: false });
		const state = this.state;
		const newId = playerState.item?.linked_from?.id || playerState.item?.id;
		const media = newId === state.media?.id ? state.media : playerState.item;
		this.setState({
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
	setPosition(position) {
		this.setState({ position });
	},
	setDeviceState(isActive) {
		this.setState({ isActive });
	},
	incrementPosition() {
		let sum = this.state.position + 1e3;
		if (sum > this.state.duration) sum = this.state.duration;
		this.setState({ position: sum });
	}
};
var store_default2 = {
	state: {
		account: void 0,
		isActive: false,
		media: {},
		mediaType: void 0,
		volume: void 0,
		progress: void 0,
		isPlaying: void 0,
		mediaId: void 0,
		repeat: void 0,
		shuffle: void 0,
		actions: void 0,
		position: 0
	},
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
	},
	actions: {
		...getters,
		...setters,
		async fetchPlayerState() {
			const [err, playerState] = await promiseHandler(SpotifyAPIWrapper_default.getPlayerState());
			if (err) return Logger_default.error("Could not fetch player state", err);
			this.setPlayerState(playerState);
		}
	}
};

// MODULES-AUTO-LOADER:@Stores/ConnectedAccountsStore
var ConnectedAccountsStore_default = /* @__PURE__ */ (() => getStore("ConnectedAccountsStore"))();

// MODULES-AUTO-LOADER:@Stores/SpotifyStore
var SpotifyStore_default = /* @__PURE__ */ (() => getStore("SpotifyStore"))();

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

// common/DiscordModules/zustand.js
var zustand = /* @__PURE__ */ (() => getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
})?.zustand)();
var subscribeWithSelector = /* @__PURE__ */ (() => getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), {
	searchExports: true
}))();

function create(initialState) {
	const Store2 = /* @__PURE__ */ zustand(initialState);
	/* @__PURE__ */
	Object.defineProperty(Store2, "state", {
		configurable: false,
		get: () => Store2.getState()
	});
	return Store2;
}

// src/SpotifyEnhance/store/index.js
var Store = create(subscribeWithSelector(() => store_default2));
var store_default = Store;
Object.assign(Store, {
	Api: SpotifyAPIWrapper_default,
	selectors: store_default2.selectors,
	idleTimer: new Timer(() => Store.setDeviceState(false), 5 * 60 * 1e3, Timer.TIMEOUT),
	positionInterval: new Timer(() => Store.incrementPosition(), 1e3, Timer.INTERVAL)
});
Object.assign(Store, store_default2.actions);
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
	if (position < Store.state.duration) return;
	Store.positionInterval.stop();
	Store.setPosition(Store.state.duration || 0);
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
		if (Store.account?.accountId && Store.account?.accessToken) return;
		const { socket } = SpotifyStore_default.getActiveSocketAndDevice() || {};
		if (!socket) return;
		Store.setAccount(socket);
		Store.fetchPlayerState();
	} catch (e) {
		Logger_default.error(e);
	}
}

function onAccountsChanged() {
	try {
		if (!Store.account) return;
		const connectedAccounts = ConnectedAccountsStore_default.getAccounts().filter(
			(account) => account.type === "spotify"
		);
		if (connectedAccounts.some((a) => a.id === Store.account.accountId)) return;
		Store.setAccount(void 0);
	} catch (e) {
		Logger_default.error(e);
	}
}
Plugin_default.onStart(() => {
	SpotifyStore_default.addChangeListener(onSpotifyStoreChange);
	ConnectedAccountsStore_default.addChangeListener(onAccountsChanged);
	const account = ConnectedAccountsStore_default.getAccount(null, "spotify") || {};
	SpotifyAPIWrapper_default.setAccount(account.accessToken, account.id);
	const { socket } = SpotifyStore_default.getActiveSocketAndDevice() || {};
	if (!socket) return;
	Store.setAccount(socket);
	Store.fetchPlayerState();
});
Plugin_default.onStop(() => {
	SpotifyStore_default.removeChangeListener(onSpotifyStoreChange);
	ConnectedAccountsStore_default.removeChangeListener(onAccountsChanged);
	Store.setAccount();
	Store.setPlayerState({});
	Store.idleTimer.stop();
});

// src/SpotifyEnhance/contextmenu.js
var copyMenu = (songUrl, bannerUrl) => {
	return {
		className: "spotify-menuitem",
		id: "copy",
		label: "copy",
		type: "submenu",
		leadingAccessory: { type: "icon", icon: CopyIcon },
		items: [{
				className: "spotify-menuitem",
				id: "copy-song-link",
				action: () => copySpotifyUrl(songUrl),
				leadingAccessory: { type: "icon", icon: ListenIcon },
				label: "Copy song url"
			},
			{
				className: "spotify-menuitem",
				id: "copy-poster-link",
				action: () => spotifyCopy(bannerUrl),
				leadingAccessory: { type: "icon", icon: ImageIcon },
				label: "Copy poster url"
			}
		]
	};
};
var shareMenu = (songUrl, bannerUrl) => {
	return {
		className: "spotify-menuitem",
		id: "share",
		label: "share",
		leadingAccessory: { type: "icon", icon: ShareIcon },
		type: "submenu",
		items: [{
				className: "spotify-menuitem",
				id: "share-song-link",
				action: () => spotifyShare(songUrl),
				leadingAccessory: { type: "icon", icon: ListenIcon },
				label: "Share song in current channel"
			},
			{
				className: "spotify-menuitem",
				id: "share-poster-link",
				action: () => spotifyShare(bannerUrl),
				leadingAccessory: { type: "icon", icon: ImageIcon },
				label: "Share poster in current channel"
			}
		]
	};
};
var storeContextMenu = (...args) => {
	const copyContextMenu = copyMenu(...args);
	const shareContextMenu = shareMenu(...args);
	copyContextMenu.items.push({
		className: "spotify-menuitem",
		id: "copy-song-name",
		action: () => spotifyCopy(store_default.getFullSongName()),
		leadingAccessory: { type: "icon", icon: CopyIcon },
		label: "Copy name"
	});
	if (store_default.state.context?.type === "playlist")
		shareContextMenu.items.push({
			className: "spotify-menuitem",
			id: "share-playlist-link",
			action: () => spotifyShare(store_default.getPlaylistUrl()),
			leadingAccessory: { type: "icon", icon: AddToQueueIcon },
			label: "Share playlist in current channel"
		});
	return [copyContextMenu, shareContextMenu];
};

// common/Patcher/shared.js
Plugin_default.onStop(() => Patcher.unpatchAll());

function patchOnce(type, object, key, callback) {
	const unpatch = Patcher[type](object, key, (...args) => {
		unpatch();
		callback.apply(null, args);
	});
}

function patch(type, object, key, callback, once) {
	if (!hasOwn(object, key))
		return Logger.error("Could not perform a patch, missing arguments", arguments);
	const caller = {
		after: (context2, args, ret) => callback({ context: context2, args, ret }),
		before: (context2, args) => callback({ context: context2, args }),
		instead: (context2, args, fn) => callback({ context: context2, args, fn })
	} [type];
	return once ? patchOnce(type, object, key, caller) : Patcher[type](object, key, caller);
}

// common/Patcher/index.js
var after = (...args) => patch("after", ...args);
var before = (...args) => patch("before", ...args);

// src/SpotifyEnhance/patches/patchChannelAttach.jsx
Plugin_default.onStart(() => {
	lazy(Filters.bySource("Plus Button"), { decFilter: Filters.byStrings("Plus Button") }).then(
		(ChannelAttachMenu) => {
			after(...ChannelAttachMenu, ({ ret }) => {
				if (!store_default.state.isActive) return;
				if (!store_default.state.mediaId) return;
				if (!Array.isArray(ret?.props?.children)) return;
				ret.props.children.push(
					ContextMenu.buildItem({ type: "separator" }),
					...storeContextMenu(
						store_default.getSongUrl(),
						store_default.getSongBanners().bannerLg.url,
						store_default.state.context?.type
					).map(ContextMenu.buildItem.bind(ContextMenu))
				);
			});
		}
	);
});

// common/Utils/Settings.js
var Settings_default = /* @__PURE__ */ (() => {
	const SettingsStore = create(
		subscribeWithSelector(() => Object.assign(Config_default.settings || {}, Data.load("settings") || {}))
	);
	const state = SettingsStore.getInitialState();
	const selectors = {};
	const actions = {};
	for (const key of Object.keys(state)) {
		actions[`set${key}`] = (newValue) => SettingsStore.setState({
			[key]: newValue });
		selectors[key] = (state2) => state2[key];
	}
	Object.defineProperty(SettingsStore, "selectors", { value: Object.assign(selectors) });
	Object.assign(SettingsStore, actions);
	SettingsStore.subscribe(
		(state2) => state2,
		() => Data.save("settings", SettingsStore.state)
	);
	Object.assign(SettingsStore, {
		useSetting: (key) => {
			const val = SettingsStore((state2) => state2[key]);
			return [val, SettingsStore[`set${key}`]];
		}
	});
	return SettingsStore;
})();

// src/SpotifyEnhance/patches/patchListenAlong.js
Plugin_default.onStart(() => {
	after(SpotifyStore_default, "getActiveSocketAndDevice", ({ ret }) => {
		if (!Settings_default.getState().enableListenAlong) return;
		if (ret?.socket) ret.socket.isPremium = true;
		return ret;
	});
});

// src/SpotifyEnhance/patches/patchMessageComponentAccessories.jsx
var urlRegex = /((?:https?|steam):\/\/[^\s<]+[^<.,:;"'\]\s])/g;
var MessageStateContext = React_default.createContext(null);
Plugin_default.onStart(() => {
	lazy(Filters.byPrototypeKeys("renderPoll"), { searchExports: true }).then(
		([m, k]) => {
			const MessageComponentAccessories = m[k];
			before(MessageComponentAccessories.prototype, "renderEmbeds", ({ args }) => {
				const message = args[0];
				const urlMatches = message.content.match(urlRegex) || [];
				if (!urlMatches.length) return;
				const embeds = urlMatches.filter(isSpotifyUrl).map((url) => ({
					url,
					type: "link",
					provider: {
						name: "Spotify",
						url: "https://spotify.com/"
					}
				}));
				if (!embeds.length) return;
				args[0] = Object.assign(args[0], {
					embeds: [...message.embeds.filter((a) => a.provider.name !== "Spotify"), ...embeds]
				});
			});
			after(MessageComponentAccessories.prototype, "renderEmbeds", ({ args: [message], ret }) => {
				if (!ret || !message?.state) return;
				return /* @__PURE__ */ React_default.createElement(MessageStateContext, { value: message.state }, ret);
			});
		}
	);
});

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary_default = (props) => /* @__PURE__ */ React_default.createElement(BdApi.Components.ErrorBoundary, { ...props, name: Config_default?.info?.name });

// MODULES-AUTO-LOADER:@Modules/useStateFromStores
var useStateFromStores_default = /* @__PURE__ */ (() => getModule(Filters.byStrings("getStateFromStores"), { searchExports: true }))();

// MODULES-AUTO-LOADER:@Stores/PresenceStore
var PresenceStore_default = /* @__PURE__ */ (() => getStore("PresenceStore"))();

// MODULES-AUTO-LOADER:@Modules/Tooltip
var Tooltip_default = /* @__PURE__ */ (() => getModule(Filters.byPrototypeKeys("renderTooltip"), { searchExports: true }))();

// common/Components/Tooltip/index.jsx
var Tooltip_default2 = ({ note, position, children }) => {
	return /* @__PURE__ */ React_default.createElement(
		Tooltip_default, {
			text: note,
			position: position || "top"
		},
		(props) => (
			// eslint-disable-next-line @eslint-react/no-clone-element
			React_default.cloneElement(children, {
				...props,
				...children.props
			})
		)
	);
};

// src/SpotifyEnhance/patches/patchMessageHeader.jsx
function SpotifyActivityIndicator({ userId }) {
	const activityIndicator = Settings_default(Settings_default.selectors.activityIndicator);
	const spotifyActivity = useStateFromStores_default(
		[PresenceStore_default],
		() => PresenceStore_default.getActivities(userId).find(
			(activity) => activity?.name?.toLowerCase() === "spotify"
		)
	);
	if (!activityIndicator || !spotifyActivity) return null;
	return /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: `${spotifyActivity.details} - ${spotifyActivity.state}` }, /* @__PURE__ */ React_default.createElement(SpotifyIcon, { width: "20", height: "20", class: "spotifyActivityIndicatorIcon" }));
}
Plugin_default.onStart(() => {
	lazy(Filters.byStrings("userOverride", "withMentionPrefix"), { searchExports: false }).then(
		(MessageHeader) => {
			after(...MessageHeader, ({ args: [{ message }], ret }) => {
				const userId = message.author.id;
				ret.props.children.push(
					/* @__PURE__ */
					React_default.createElement(ErrorBoundary_default, { id: "SpotifyActivityIndicator" }, /* @__PURE__ */ React_default.createElement(SpotifyActivityIndicator, { userId }))
				);
			});
		}
	);
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

// MODULES-AUTO-LOADER:@Modules/Button
var Button_default = /* @__PURE__ */ (() => getModule((a) => a && a.Link && a.Colors, { searchExports: true }))();

// common/Components/Button/index.jsx
function ButtonComponentFallback(props) {
	return /* @__PURE__ */ React_default.createElement("button", { ...props });
}
var Button_default2 = Button_default || ButtonComponentFallback;

// src/SpotifyEnhance/components/ControlButton.jsx
function ControlButton({ className, ref, onClick, tooltip, value, ...rest }) {
	const btn = /* @__PURE__ */ React_default.createElement(
		Button_default2, {
			onClick: preventDefault(onClick),
			buttonRef: ref,
			innerClassName: "flexCenterCenter",
			className,
			size: Button_default2.Sizes.NONE,
			color: Button_default2.Colors.PRIMARY,
			look: Button_default2.Looks.BLANK,
			...rest
		},
		value
	);
	return !tooltip ? btn : /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: tooltip }, btn);
}

// common/DiscordModules/Modules.js
var DiscordPopout = /* @__PURE__ */ (() => getModule((a) => a?.prototype?.render && a.Animation, { searchExports: true }))();
var Anchor = /* @__PURE__ */ (() => getModule(Filters.byKeys("Anchor")).Anchor)();
var RadioGroup = /* @__PURE__ */ (() => getMangled('data-toggleable-component":"radiogroup', { radioGroup: Filters.byStrings("label", "required") }).radioGroup)();

// common/Components/Popout/index.jsx
var Popout_default = Object.assign(({ children, targetElementRef, ...props }) => {
	const ref = useRef();
	const helperRef = useCallback((e) => {
		if (e) ref.current = e.nextElementSibling;
	}, []);
	return /* @__PURE__ */ React_default.createElement(
		DiscordPopout, {
			position: "top",
			align: "center",
			nudgeAlignIntoViewport: true,
			animation: DiscordPopout.Animation.FADE,
			spacing: 4,
			...props,
			targetElementRef: targetElementRef || ref
		},
		(p) => {
			return targetElementRef ? children(p) : /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement("span", { ref: helperRef, style: { display: "contents" } }), children(p));
		}
	);
}, DiscordPopout);

// common/Utils/css.js
function transform(...args) {
	const classNames = /* @__PURE__ */ new Set();
	for (const arg of args) {
		if (arg && typeof arg === "string") classNames.add(arg);
		else if (Array.isArray(arg)) arg.forEach((name) => classNames.add(name));
		else if (arg && typeof arg === "object") Object.entries(arg).forEach(([name, value]) => value && classNames.add(name));
	}
	return classNames;
}
var classNameFactory = (prefix = "", connector = "-") => (...args) => Array.from(transform(...args), (name) => `${prefix}${connector}${name}`).join(" ");

// src/SpotifyEnhance/components/SpotifyActivityControls/index.jsx
var c = classNameFactory("spotify-activity");
var { useSpotifyPlayAction, useSpotifySyncAction } = getMangled(
	Filters.byStrings("USER_ACTIVITY_PLAY", "spotifyData", "tooltip"), {
		useSpotifyPlayAction: Filters.byStrings("USER_ACTIVITY_PLAY"),
		useSpotifySyncAction: Filters.byStrings("USER_ACTIVITY_SYNC")
	}, { searchExports: true, raw: true }
);
var SpotifyActivityControls_default = ({ activity, user }) => {
	const userSyncActivityState = useSpotifySyncAction(activity, user);
	const userPlayActivityState = useSpotifyPlayAction(activity, user);
	const isActive = store_default(store_default.selectors.isActive);
	const url = `https://open.spotify.com/track/${activity?.sync_id}`;
	const bannerUrl = React_default.useMemo(() => `https://i.scdn.co/image/${activity?.assets?.large_image?.replace("spotify:", "")}`, [activity?.assets?.large_image]);
	return /* @__PURE__ */ React_default.createElement("div", { className: c("controls") }, /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: userPlayActivityState.tooltip || userPlayActivityState.label,
			disabled: userPlayActivityState.disabled,
			fullWidth: true,
			className: c("btn", "btn-listen"),
			look: Button_default2.Colors.OUTLINED,
			value: /* @__PURE__ */ React_default.createElement(ListenIcon, null),
			onClick: userPlayActivityState.onClick
		}
	), /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: "Add to queue",
			className: c("btn", "btn-queue"),
			look: Button_default2.Colors.OUTLINED,
			value: /* @__PURE__ */ React_default.createElement(AddToQueueIcon, null),
			disabled: !isActive,
			onClick: () => store_default.Api.queue("track", activity.sync_id, activity.details)
		}
	), /* @__PURE__ */ React_default.createElement(
		Popout_default, {
			align: "right",
			renderPopout: (e) => /* @__PURE__ */ React_default.createElement("div", { onClick: preventDefault(nop) }, /* @__PURE__ */ React_default.createElement(ContextMenu.Menu, { onClose: e.closePopout }, ContextMenu.buildMenuChildren([copyMenu(url, bannerUrl), shareMenu(url, bannerUrl)])))
		},
		(e) => /* @__PURE__ */ React_default.createElement(
			ControlButton, {
				tooltip: "Share",
				onClick: e.onClick,
				look: Button_default2.Colors.OUTLINED,
				className: c("btn", "btn-share"),
				value: /* @__PURE__ */ React_default.createElement(ShareIcon, null)
			}
		)
	), /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: userSyncActivityState.tooltip,
			className: c("btn", "btn-listenAlong"),
			disabled: userSyncActivityState.disabled,
			onClick: userSyncActivityState.onClick,
			look: Button_default2.Colors.OUTLINED,
			value: /* @__PURE__ */ React_default.createElement(ListenAlongIcon, null)
		}
	));
};

// src/SpotifyEnhance/patches/patchSpotifyActivity.jsx
var ActivityComponent = getDeclarationAndKey(Filters.bySource("PRESS_LISTEN_ALONG_ON_SPOTIFY_BUTTON", "PRESS_PLAY_ON_SPOTIFY_BUTTON"), Filters.byStrings("PRESS_LISTEN_ALONG_ON_SPOTIFY_BUTTON", "PRESS_PLAY_ON_SPOTIFY_BUTTON"));
Plugin_default.onStart(() => {
	after(...ActivityComponent, ({ args: [{ user, activity }] }) => {
		if (!Settings_default.getState().activity) return;
		if (activity?.name.toLowerCase() !== "spotify") return;
		return /* @__PURE__ */ React_default.createElement(ErrorBoundary_default, { id: "SpotifyEmbed" }, /* @__PURE__ */ React_default.createElement(
			SpotifyActivityControls_default, {
				user,
				activity
			}
		));
	});
});

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
var ALLOWD_TYPES = ["track", "playlist", "album", "artist", "user", "show", "episode"];

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

.spotify-embed-plus {
	display: flex;
	gap: 5px;
	overflow: hidden;
}`);

// MODULES-AUTO-LOADER:@Stores/AccessibilityStore
var AccessibilityStore_default = /* @__PURE__ */ (() => getStore("AccessibilityStore"))();

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

// common/Utils/ImageModal/index.jsx
var RenderLinkComponent = getModule((m) => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });
var ImageModal = getModule(reactRefMemoFilter("type", "renderLinkComponent"), { searchExports: true });

function h(e, t) {
	const n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
	true === n || AccessibilityStore_default.useReducedMotion ? e.set(t) : e.start(t);
}
var useSomeScalingHook = getModule(Filters.byStrings("reducedMotion.enabled", "useSpring", "respect-motion-settings"), { searchExports: true });
var context = getModule((a) => a?._currentValue?.scale, { searchExports: true });
var ImageComponent = ({ url, ...rest }) => {
	const [x, P] = useState(false);
	const [M] = useSomeScalingHook(() => ({
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

// common/Utils/Modals/index.jsx
var ModalActions = getModule((a) => a.useModalsStore);
var Modals = /* @__PURE__ */ getMangled( /* @__PURE__ */ Filters.bySource("MODAL_ROOT", "transitionState"), {
	ModalRoot: /* @__PURE__ */ Filters.byStrings("transitionState"),
	ModalFooter: /* @__PURE__ */ Filters.byStrings(".HORIZONTAL_REVERSE"),
	ModalContent: /* @__PURE__ */ Filters.byStrings("scrollbarType", "scrollerRef"),
	ModalHeader: /* @__PURE__ */ Filters.byStrings("headerIdIsManaged", "headerId", ".HORIZONTAL"),
	Animations: (a) => a.SUBTLE,
	Sizes: (a) => a.DYNAMIC,
	ModalCloseButton: Filters.byStrings("withCircleBackground")
});
var openModal = (children, tag, { className, ...modalRootProps } = {}) => {
	const id = `${tag ? `${tag}-` : ""}modal`;
	return ModalActions.openModal((props) => {
		return /* @__PURE__ */ React_default.createElement(
			ErrorBoundary_default, {
				id,
				plugin: Config_default.info.name
			},
			/* @__PURE__ */
			React_default.createElement(
				Modals.ModalRoot, {
					onClick: props.onClose,
					transitionState: props.transitionState,
					className: concateClassNames("transparent-background", className),
					size: Modals.Sizes.DYNAMIC,
					...modalRootProps
				},
				React_default.cloneElement(children, { ...props })
			)
		);
	});
};

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
		const props = {
			true: {
				tooltip: "Pause preview",
				className: "spotify-embed-btn spotify-embed-preview-pause",
				onClick: this.pauseHandler,
				value: /* @__PURE__ */ React_default.createElement(PauseIcon, null)
			},
			false: {
				tooltip: "Play preview",
				className: "spotify-embed-btn spotify-embed-preview-play",
				onClick: this.playHandler,
				value: /* @__PURE__ */ React_default.createElement(PlayIcon, null)
			}
		} [this.state.isPlaying];
		return /* @__PURE__ */ React_default.createElement(ControlButton, { ...props });
	}
};

// src/SpotifyEnhance/components/TrackTimeLine/styles.css
StylesLoader_default.push(`.spotify-player-timeline {
	user-select: none;
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

.spotify-player-timeline > :first-child {
	flex: 1 0 100%;
}

.spotify-player-timeline-trackbar {
	cursor: pointer;
}

.spotify-player-timeline:hover .spotify-player-timeline-trackbar-grabber {
	opacity: 1;
}

.spotify-player-timeline .spotify-player-timeline-trackbar-grabber {
	opacity: 0;
	--grabber-size: 12px;
	cursor: grab;
}

.spotify-player-timeline .spotify-player-timeline-trackbar-bar {
	background: hsl(0deg 0% 100% / 30%);
}

.spotify-player-timeline .spotify-player-timeline-trackbar-bar > div {
	background: #fff;
	border-radius: 4px;
	box-sizing: border-box;
}

.spotify-player-timeline:hover .spotify-player-timeline-trackbar-bar > div {
	background: var(--SpotifyEnhance-spotify-green);
}
`);

// MODULES-AUTO-LOADER:@Modules/Slider
var Slider_default = /* @__PURE__ */ (() => getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true }))();

// src/SpotifyEnhance/components/TrackTimeLine/index.jsx
function formatMsToTime(ms) {
	const time = new Date(ms);
	return [time.getUTCHours(), String(time.getUTCMinutes()), String(time.getUTCSeconds()).padStart(2, "0")].filter(Boolean).join(":");
}
var TrackTimeLine_default = () => {
	const [position, duration] = store_default((_) => [_.position, _.duration], shallow);
	const sliderRef = React_default.useRef();
	React_default.useEffect(() => {
		if (sliderRef.current?.state?.active) return;
		sliderRef.current?.setState({ value: position < 1e3 ? 0 : position });
	}, [position]);
	const rangeChangeHandler = BdApi.Utils.debounce((e) => {
		if (sliderRef.current?.state?.active) return;
		const pos = Math.floor(e);
		store_default.positionInterval.stop();
		store_default.setPosition(pos);
		store_default.Api.seek(pos);
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

// common/Components/FieldSet/styles.css
StylesLoader_default.push(`.fieldset-container {
	display: flex;
	flex-direction: column;
	gap: 16px;
}


.fieldset-label {
	margin-bottom: 12px;
}

.fieldset-description {
	margin-bottom: 12px;
}

.fieldset-label + .fieldset-description{
	margin-top:-8px;
	margin-bottom: 0;
}

.fieldset-content {
	display: flex;
	width: 100%;
	justify-content: flex-start;
}

.fieldset-content.fieldset-horizontal {
	flex-direction: row;
}

.fieldset-content.fieldset-vertical {
	flex-direction: column;
}`);

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = /* @__PURE__ */ (() => getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true }))();

// common/Components/FieldSet/index.jsx
var c2 = classNameFactory("fieldset");

function FieldSet({ label, description, children, gap = 15, direction = FieldSet.direction.VERTICAL }) {
	return /* @__PURE__ */ React_default.createElement("fieldset", { className: c2("container") }, label && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c2("label"),
			tag: "legend",
			variant: "text-lg/medium"
		},
		label
	), description && /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			className: c2("description"),
			variant: "text-sm/normal",
			color: "text-secondary"
		},
		description
	), /* @__PURE__ */ React_default.createElement(
		"div", {
			className: c2("content", direction),
			style: { gap }
		},
		children
	));
}
FieldSet.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// src/SpotifyEnhance/components/SpotifyEmbed/SpotifyEmbedControls.jsx
var SpotifyEmbedControls_default = ({ id, type, embed: { thumbnail, rawTitle, url } }) => {
	const isActive = store_default(store_default.selectors.isActive);
	const { preview_url } = useGetRessource(type, id) || {};
	const listenBtn = type !== "show" && /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: `Play ${type}`,
			className: "spotify-embed-btn",
			onClick: () => store_default.Api.listen(type, id, rawTitle),
			disabled: !isActive,
			value: /* @__PURE__ */ React_default.createElement(ListenIcon, null)
		}
	);
	const queueBtn = (type === "track" || type === "episode") && /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: `Add ${type} to queue`,
			className: "spotify-embed-btn",
			disabled: !isActive,
			value: /* @__PURE__ */ React_default.createElement(AddToQueueIcon, null),
			onClick: () => store_default.Api.queue(type, id, rawTitle)
		}
	);
	return /* @__PURE__ */ React_default.createElement(FieldSet, { gap: 5, direction: FieldSet.direction.HORIZONTAL }, listenBtn, queueBtn, /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: "Copy link",
			className: "spotify-embed-btn",
			value: /* @__PURE__ */ React_default.createElement(CopyIcon, null),
			onClick: () => copySpotifyUrl(url)
		}
	), /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: "Copy banner",
			className: "spotify-embed-btn",
			value: /* @__PURE__ */ React_default.createElement(ImageIcon, null),
			onClick: () => spotifyCopy(thumbnail?.url || thumbnail?.proxyURL)
		}
	), preview_url && /* @__PURE__ */ React_default.createElement(PreviewPlayer_default, { src: preview_url }), /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: "Play on Spotify",
			onClick: () => openSpotifyUrl(url),
			className: "spotify-embed-btn",
			value: /* @__PURE__ */ React_default.createElement(SpotifyIcon, null)
		}
	));
};

// src/SpotifyEnhance/components/SpotifyEmbed/index.jsx
var c3 = classNameFactory("spotify-embed");
var SpotifyEmbed_default = ({ id, type }) => {
	const data = useGetRessource(type, id);
	const { thumbnail, rawTitle, rawDescription, url, preview_url } = data || {};
	const embedBannerBackground = Settings_default(Settings_default.selectors.embedBannerBackground);
	const useReducedMotion = useStateFromStores_default(
		[AccessibilityStore_default],
		() => AccessibilityStore_default.useReducedMotion
	);
	const [isPlaying, isActive] = store_default((_) => [_.isPlaying, _.isActive], shallow);
	const mediaId = store_default(store_default.selectors.mediaId, (n, o) => n === o || n !== id && o !== id);
	const isThis = mediaId === id;
	const listenBtn = type !== "show" && /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: `Play ${type}`,
			onClick: () => store_default.Api.listen(type, id, rawTitle),
			className: c3("btn", "btn-listen"),
			value: /* @__PURE__ */ React_default.createElement(ListenIcon, null)
		}
	);
	const queueBtn = (type === "track" || type === "episode") && /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: `Add ${type} to queue`,
			onClick: () => store_default.Api.queue(type, id, rawTitle),
			className: c3("btn", "btn-addToQueue"),
			value: /* @__PURE__ */ React_default.createElement(AddToQueueIcon, null)
		}
	);
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
	return /* @__PURE__ */ React_default.createElement("div", { className, style: bannerStyleObj }, /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: "View" }, /* @__PURE__ */ React_default.createElement(
		"div", {
			onClick: () => {
				const { url: url2, ...rest } = banner.bannerLg;
				openModal(
					/* @__PURE__ */
					React_default.createElement("div", { className: "spotify-banner-modal" }, /* @__PURE__ */ React_default.createElement(ImageComponent, { url: url2, ...fit(rest) }))
				);
			},
			className: "spotify-embed-thumbnail"
		}
	)), /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: rawTitle }, /* @__PURE__ */ React_default.createElement("h2", { className: "spotify-embed-title" }, rawTitle)), /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: rawDescription }, /* @__PURE__ */ React_default.createElement("p", { className: "spotify-embed-description" }, rawDescription)), type && id && /* @__PURE__ */ React_default.createElement("div", { className: "spotify-embed-controls" }, (isThis && isActive && !isPlaying || !isThis && isActive) && [listenBtn, queueBtn], isThis && isActive && isPlaying && /* @__PURE__ */ React_default.createElement(TrackTimeLine_default, null), /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: "Copy link",
			onClick: () => copySpotifyUrl(url),
			className: c3("btn", "btn-copy-url"),
			value: /* @__PURE__ */ React_default.createElement(CopyIcon, null)
		}
	), /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: "Copy banner",
			onClick: () => spotifyCopy(banner.bannerLg?.url),
			className: c3("btn", "btn-copy-banner"),
			value: /* @__PURE__ */ React_default.createElement(ImageIcon, null)
		}
	), preview_url && /* @__PURE__ */ React_default.createElement(PreviewPlayer_default, { src: preview_url })), /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			tooltip: "Play on Spotify",
			onClick: () => openSpotifyUrl(url),
			className: c3("spotifyIcon"),
			value: /* @__PURE__ */ React_default.createElement(SpotifyIcon, null)
		}
	));
};

// src/SpotifyEnhance/components/SpotifyEmbedWrapper/index.jsx
function SpotifyEmbedWrapper({ id, type, embedObject, embedComponent }) {
	const spotifyEmbed = Settings_default(Settings_default.selectors.spotifyEmbed);
	switch (spotifyEmbed) {
		case EmbedStyleEnum.KEEP:
			return [
				embedComponent,
				/* @__PURE__ */
				React_default.createElement(SpotifyEmbedControls_default, { id, type, embed: embedObject })
			];
		case EmbedStyleEnum.REPLACE:
			return /* @__PURE__ */ React_default.createElement(SpotifyEmbed_default, { id, type });
		case EmbedStyleEnum.HIDE:
			return /* @__PURE__ */ React_default.createElement(SpotifyEmbedControls_default, { id, type, embed: embedObject });
	}
	return embedComponent;
}

// src/SpotifyEnhance/patches/patchSpotifyEmbed.jsx
var SpotifyEmbed = getDeclarationAndKey(Filters.bySource("iframe", "playlist", "track"), Filters.byStrings("iframe", "playlist", "track"));
Plugin_default.onStart(() => {
	after(...SpotifyEmbed, ({ args: [{ embed }], ret }) => {
		const messageState = React_default.use(MessageStateContext);
		if (messageState !== "SENT") return null;
		const [id, type] = parseSpotifyUrl(embed.url) || [];
		if (!ALLOWD_TYPES.includes(type)) return;
		return /* @__PURE__ */ React_default.createElement(
			ErrorBoundary_default, {
				id: "SpotifyEmbed",
				fallback: ret
			},
			/* @__PURE__ */
			React_default.createElement(
				SpotifyEmbedWrapper, {
					id,
					type,
					embedComponent: ret,
					embedObject: embed
				}
			)
		);
	});
});

// src/SpotifyEnhance/components/SpotifyPlayer/styles.css
StylesLoader_default.push(`.spotify-player-container {
	background: hsl(228 8% 12%);
	border-bottom: 1px solid hsl(228deg 6% 33% / 48%);
	padding: 8px 8px;
	color: white;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	border-top-left-radius: inherit;
	border-top-right-radius: inherit;
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
	flex: 0 0 auto;
}

.spotify-player-minmax {
	position: absolute;
	top: 10px;
	left: 10px;
	z-index: 10;
	rotate: 90deg;
	box-sizing: bordr-box;
	width: 15px;
	height: 15px;
	cursor: pointer;
	display: none;
	background: #000a;
	border-radius: 50%;
}

.spotify-player-container:hover .spotify-player-minmax {
	display: flex;
}

.spotify-player-minmax svg {
	width: 100%;
	height: 100%;
}

.spotify-player-container.compact .spotify-player-minmax {
	top: 0px;
	left: 0px;
	rotate: -90deg;
}
`);

// src/SpotifyEnhance/components/SpotifyPlayer/SpotifyPlayerControls/styles.css
StylesLoader_default.push(`.spotify-player-controls {
	display: flex;
	justify-content: space-between;
	width: 100%;
}

.spotify-player-controls svg {
	width: 15px;
	height: 15px;
}

.spotify-player-controls-btn {
	padding: 5px !important;
	color: #ccc;
	transition: all 100ms linear;
	border-radius: 5px;
}

.spotify-player-controls-btn:hover {
	background: #ccc3;
	color: fff;
	scale: 1.1;
}

.spotify-player-controls-btn.spotify-player-controls-enabled {
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

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = /* @__PURE__ */ (() => getStore("UserStore"))();

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
	}, [delay, clear, fn]);
	useEffect(() => clear, [clear]);
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
		[clearEnter, clearLeave]
	);
	const child = Children.only(children);
	const content = () => (
		// eslint-disable-next-line @eslint-react/no-clone-element
		React_default.cloneElement(child, {
			onMouseEnter: (e) => {
				clearLeave();
				child.props.onMouseenter?.(e);
				mouseEnterHandler(e);
			},
			onMouseLeave: (e) => {
				clearEnter();
				child.props.onMouseLeave?.(e);
				mouseLeaveHandler(e);
			}
		})
	);
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

// src/SpotifyEnhance/components/SpotifyPlayer/SpotifyPlayerControls/index.jsx
var c4 = classNameFactory("spotify-player-controls");
var pauseHandler = () => store_default.Api.pause();
var playHandler = () => store_default.Api.play();
var previousHandler = () => store_default.Api.previous();
var nextHandler = () => store_default.Api.next();
var playpause = {
	true: {
		playPauseTooltip: "Pause",
		playPauseClassName: c4("btn", "pause"),
		playPauseHandler: pauseHandler,
		playPauseIcon: /* @__PURE__ */ React_default.createElement(PauseIcon, null)
	},
	false: {
		playPauseTooltip: "Play",
		playPauseClassName: c4("btn", "play"),
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
	const [isPlaying, shuffle, repeat] = store_default((_) => [_.isPlaying, _.shuffle, _.repeat], shallow);
	const actions = store_default(store_default.selectors.actions, shallow);
	const { bannerLg } = store_default.getSongBanners();
	const { toggling_shuffle, toggling_repeat_track, skipping_next, skipping_prev } = actions || {};
	const { repeatTooltip, repeatActive, repeatIcon, repeatArg } = repeatObj[repeat || "off"];
	const shuffleHandler = () => store_default.Api.shuffle(!shuffle);
	const repeatHandler = () => store_default.Api.repeat(repeatArg);
	const { playPauseTooltip, playPauseHandler, playPauseIcon, playPauseClassName } = playpause[isPlaying];
	return /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-controls" }, playerButtons[PlayerButtonsEnum.SHARE] && /* @__PURE__ */ React_default.createElement(HoverPopout, { popout: (e) => /* @__PURE__ */ React_default.createElement(ContextMenu.Menu, { onClose: e.closePopout }, ContextMenu.buildMenuChildren(storeContextMenu(store_default.getSongUrl(), bannerLg.url))) }, /* @__PURE__ */ React_default.createElement(
		ControlButton, {
			className: c4("btn", "share"),
			value: /* @__PURE__ */ React_default.createElement(ShareIcon, null)
		}
	)), [
		playerButtons[PlayerButtonsEnum.SHUFFLE] && {
			tooltip: "Shuffle",
			value: /* @__PURE__ */ React_default.createElement(ShuffleIcon, null),
			className: c4("btn", "shuffle", { enabled: shuffle }),
			disabled: toggling_shuffle,
			onClick: shuffleHandler
		},
		playerButtons[PlayerButtonsEnum.PREVIOUS] && {
			tooltip: "Previous",
			value: /* @__PURE__ */ React_default.createElement(PreviousIcon, null),
			className: c4("btn", "previous"),
			disabled: skipping_prev,
			onClick: previousHandler
		},
		{
			tooltip: playPauseTooltip,
			value: playPauseIcon,
			className: playPauseClassName,
			disabled: false,
			onClick: playPauseHandler
		},
		playerButtons[PlayerButtonsEnum.NEXT] && {
			tooltip: "Next",
			value: /* @__PURE__ */ React_default.createElement(NextIcon, null),
			className: c4("btn", "next"),
			disabled: skipping_next,
			onClick: nextHandler
		},
		playerButtons[PlayerButtonsEnum.REPEAT] && {
			tooltip: repeatTooltip,
			value: repeatIcon,
			className: c4("btn", "repeat", { enabled: repeatActive }),
			disabled: toggling_repeat_track,
			onClick: repeatHandler
		}
	].filter(Boolean).map(ControlButton), playerButtons[PlayerButtonsEnum.VOLUME] && /* @__PURE__ */ React_default.createElement(Volume, null));
};

function Volume() {
	const volume = store_default(store_default.selectors.volume, shallow);
	const [uiVolume, setUiVolume] = React_default.useState(volume);
	const volumeRef = React_default.useRef(volume || 25);
	const volumeMuteHandler = () => {
		const target2 = uiVolume ? 0 : volumeRef.current;
		store_default.Api.volume(target2).then(() => {
			setUiVolume(target2);
		});
	};
	const volumeOnChange = (e) => setUiVolume(Math.round(e.target.value));
	const volumeOnMouseUp = () => {
		store_default.Api.volume(uiVolume).then(() => {
			volumeRef.current = uiVolume;
		});
	};
	return /* @__PURE__ */ React_default.createElement(
		HoverPopout, {
			popout: () => /* @__PURE__ */ React_default.createElement("div", { className: c4("volume-slider-wrapper") }, /* @__PURE__ */ React_default.createElement(
				"input", {
					value: uiVolume,
					onChange: volumeOnChange,
					onMouseUp: volumeOnMouseUp,
					type: "range",
					step: "1",
					min: "0",
					max: "100",
					className: c4("volume-slider")
				}
			), /* @__PURE__ */ React_default.createElement("div", { className: c4("volume-label") }, uiVolume)),
			position: "top",
			align: "center",
			animation: "1",
			spacing: 8
		},
		/* @__PURE__ */
		React_default.createElement(
			ControlButton, {
				className: c4("btn", "volume"),
				onClick: volumeMuteHandler,
				value: uiVolume ? /* @__PURE__ */ React_default.createElement(VolumeIcon, null) : /* @__PURE__ */ React_default.createElement(MuteVolumeIcon, null)
			}
		)
	);
}

// src/SpotifyEnhance/components/SpotifyPlayer/TrackMediaDetails/styles.css
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

.spotify-player-album,
.spotify-player-artist {
	padding: 0;
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

// src/SpotifyEnhance/components/SpotifyPlayer/TrackMediaDetails/Artist.jsx
function Artist({ artists }) {
	const menu = artists.length === 1 ? getArtistContextMenu(artists[0]) : artists.map((artist) => ({
		type: "submenu",
		id: artist.id,
		label: artist.name,
		items: getArtistContextMenu(artist)
	}));
	return /* @__PURE__ */ React_default.createElement(Popout_default, { renderPopout: (e) => /* @__PURE__ */ React_default.createElement(ContextMenu.Menu, { onClose: e.closePopout }, ContextMenu.buildMenuChildren(menu)) }, (e) => /* @__PURE__ */ React_default.createElement(
		"div", {
			onClick: e.onClick,
			className: "outline pointer spotify-player-artist ellipsis"
		},
		`by ${artists[0].name}`
	));
}

function getArtistContextMenu(artist) {
	return [{
			className: "spotify-menuitem",
			id: "open-link",
			action: () => openSpotifyUrl(`https://open.spotify.com/artist/${artist.id}`),
			leadingAccessory: { type: "icon", icon: ExternalLinkIcon },
			label: "Open externally"
		},
		{
			className: "spotify-menuitem",
			id: "artist-play",
			action: () => store_default.Api.listen("artist", artist.id, artist.name),
			leadingAccessory: { type: "icon", icon: ListenIcon },
			label: "Play Artist"
		}
	];
}

// src/SpotifyEnhance/components/SpotifyPlayer/TrackMediaDetails/TrackBanner.jsx
function TrackBanner() {
	const { bannerLg } = store_default.getSongBanners();
	const thumbnailClickHandler = () => {
		if (!bannerLg.url) return Toast_default.error("Could not open banner");
		const { url, ...rest } = bannerLg;
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

// src/SpotifyEnhance/components/SpotifyPlayer/TrackMediaDetails/index.jsx
var TrackMediaDetails_default = ({ name, artists, mediaType }) => {
	if (mediaType !== "track") {
		return /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-media" }, /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-title" }, "Playing ", mediaType || "Unknown"));
	}
	const songUrl = store_default.getSongUrl();
	const { name: albumName, url: albumUrl, id: albumeId } = store_default.getAlbum();
	return /* @__PURE__ */ React_default.createElement("div", { className: "spotify-player-media" }, /* @__PURE__ */ React_default.createElement(TrackBanner, null), /* @__PURE__ */ React_default.createElement(Tooltip_default2, { note: name }, /* @__PURE__ */ React_default.createElement(Anchor, { href: songUrl, className: "spotify-player-title ellipsis" }, name)), /* @__PURE__ */ React_default.createElement(Artist, { artists }), /* @__PURE__ */ React_default.createElement(
		Popout_default, {
			renderPopout: (e) => /* @__PURE__ */ React_default.createElement(ContextMenu.Menu, { onClose: e.closePopout }, ContextMenu.buildMenuChildren([{
					className: "spotify-menuitem",
					id: "open-link",
					action: () => openSpotifyUrl(albumUrl),
					leadingAccessory: { type: "icon", icon: ExternalLinkIcon },
					label: "Open externally"
				},
				{
					className: "spotify-menuitem",
					id: "album-play",
					action: () => store_default.Api.listen("album", albumeId, albumName),
					leadingAccessory: { type: "icon", icon: ListenIcon },
					label: "Play Album"
				}
			]))
		},
		(e) => /* @__PURE__ */ React_default.createElement("div", { onClick: e.onClick, className: "outline pointer spotify-player-album ellipsis" }, `on ${albumName}`)
	));
};

// common/Components/icons/ArrowIcon/index.jsx
function Arrow() {
	return /* @__PURE__ */ React_default.createElement(
		"svg", {
			width: 24,
			height: 24,
			viewBox: "0 0 24 24",
			fill: "none",
			xmlns: "http://www.w3.org/2000/svg"
		},
		/* @__PURE__ */
		React_default.createElement(
			"path", {
				d: "M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z",
				fill: "#ccc"
			}
		)
	);
}

// src/SpotifyEnhance/components/SpotifyPlayer/index.jsx
var SpotifyPlayer_default = React_default.memo(function SpotifyPlayer() {
	const [isActive, media, mediaType] = store_default((_) => [_.isActive, _.media, _.mediaType], shallow);
	const [player, playerBannerBackground] = Settings_default((_) => [_.player, _.playerBannerBackground], shallow);
	const [playerCompactMode, setplayerCompactMode] = Settings_default.useSetting("playerCompactMode");
	if (!player || !isActive || !mediaType) return;
	const { bannerMd, bannerSm, bannerLg } = store_default.getSongBanners();
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

// src/SpotifyEnhance/patches/patchSpotifyPlayer.jsx
Plugin_default.onStart(() => {
	lazy(Filters.bySource("hasParty"), { decFilter: (a) => a?.prototype?.hasParty }).then(([m, k]) => {
		after(m[k].prototype, "render", ({ ret }) => {
			return [
				/* @__PURE__ */
				React_default.createElement(
					ErrorBoundary_default, {
						key: "SpotifyPlayer",
						id: "SpotifyPlayer"
					},
					/* @__PURE__ */
					React_default.createElement(SpotifyPlayer_default, null)
				),
				ret
			];
		});
		UserStore_default.emitChange();
	});
});

// src/SpotifyEnhance/patches/patchSpotifySocket.js
Plugin_default.onStart(() => {
	lazy(Filters.byKeys("getActiveSocketAndDevice"), {
		decFilter: Filters.byPrototypeKeys("handleEvent")
	}).then(([m, k]) => {
		after(m[k].prototype, "handleEvent", function onSocketEvent({ context: context2, args: [{ type, event }] }) {
			if (store_default.state.account?.accountId && context2.accountId !== store_default.state.account?.accountId)
				return;
			switch (type) {
				case "PLAYER_STATE_CHANGED":
					store_default.setPlayerState(event.state);
					break;
				case "DEVICE_STATE_CHANGED": {
					const devices = event.devices;
					const isActive = !!(devices.find((d) => d.is_active) || devices[0])?.is_active;
					store_default.setDeviceState(isActive);
					if (!isActive) store_default.setPlayerState({});
					break;
				}
			}
		});
	});
});

// common/Components/Collapsible/styles.css
StylesLoader_default.push(`.collapsible-container * {
	box-sizing: border-box;
}

.collapsible-container {
	gap: 0px 20px;
	display: grid;
	grid-template-rows: min-content 0fr;
	transition: grid-template-rows 200ms linear;
	user-select: none;
	color: var(--text-secondary);
	background: var(--background-mod-subtle);
	border-radius: 8px;
	margin-bottom: 5px;
}

.collapsible-open {
	grid-template-rows: min-content 1fr;
	color: var(--text-primary);
}

.collapsible-header {
	background: var(--background-mod-subtle);
	padding: 10px;
	gap: 8px;
	display: flex;
	border-radius: inherit;
	align-items: center;
	min-width: 0;
}

.collapsible-header:hover {
	background: var(--background-mod-normal);
}

.collapsible-header:active {
	background: var(--background-mod-faint);
}

.collapsible-icon {
	display: flex;
	flex: 0 0 auto;
	rotate: 0deg;
	transition: rotate 150ms linear;
	color: inherit;
}

.collapsible-title {
	flex: 1 1 0;
	text-transform: capitalize;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	pointer-events: none;
	color: inherit;
}

.collapsible-body {
	transition: padding 0ms 200ms;
	overflow: hidden;
}

.collapsible-open > .collapsible-header {
	border-radius: 8px 8px 0 0;
	background: var(--background-mod-strong);
}

.collapsible-open > .collapsible-body {
	padding: 15px;
	transition: none;
}

.collapsible-open > .collapsible-header > .collapsible-icon {
	rotate: 90deg;
}
`);

// common/Components/Collapsible/index.jsx
var c5 = classNameFactory("collapsible");

function Collapsible({ title, children }) {
	const [open, setOpen] = React_default.useState(false);
	return /* @__PURE__ */ React_default.createElement("div", { className: c5("container", { open }) }, /* @__PURE__ */ React_default.createElement(
		"div", {
			className: c5("header"),
			onClick: () => setOpen(!open)
		},
		/* @__PURE__ */
		React_default.createElement(
			Heading_default, {
				className: c5("title"),
				tag: "h5"
			},
			title
		),
		/* @__PURE__ */
		React_default.createElement("div", { className: c5("icon") }, /* @__PURE__ */ React_default.createElement(ArrowIcon, null))
	), /* @__PURE__ */ React_default.createElement("div", { className: c5("body") }, children));
}

// common/Components/Gap/styles.css
StylesLoader_default.push(`.gap-base {
	flex:1 0 0;
}

.gap-horizontal {
	width: 100%;
}

.gap-vertical {
	height: 100%;
}
`);

// common/Components/Gap/index.jsx
var c6 = classNameFactory("gap");

function Gap({ direction = Gap.direction.HORIZONTAL, gap = 8 }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { marginTop: gap },
			className: c6("base", direction)
		}
	);
}
Gap.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// common/Components/Switch/index.jsx
var Switch_default = getMangled(Filters.bySource("auxiliaryContentPosition", "hasIcon"), {
	Switch: () => true
})?.Switch || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React_default.createElement("div", { style: { color: "#fff" } }, props.label, /* @__PURE__ */ React_default.createElement(
		"input", {
			type: "checkbox",
			checked: props.checked,
			onChange: (e) => props.onChange(e.target.checked)
		}
	));
};

// common/Components/Divider/styles.css
StylesLoader_default.push(`.divider-horizontal {
	border-top: thin solid var(--border-subtle);
	align-self: stretch;
	margin:var(--divider-gap) var(--divider-gutter) var(--divider-gap) var(--divider-gutter) ;
}

.divider-vertical {
	border-left: thin solid var(--border-subtle);
	align-self: stretch;
	margin:var(--divider-gutter) var(--divider-gap) var(--divider-gutter) var(--divider-gap);
}
`);

// common/Components/Divider/index.jsx
var c7 = classNameFactory("divider");

function Divider({ gap = 15, gutter = 0, direction = Divider.direction.HORIZONTAL }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { "--divider-gap": `${gap}px`, "--divider-gutter": `${gutter}%` },
			className: c7("base", direction)
		}
	);
}
Divider.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ settingKey, note, border = false, onChange = nop, description, ...rest }) {
	const [val, set] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Switch_default, {
			...rest,
			hasIcon: true,
			checked: val,
			label: description || settingKey,
			description: note,
			onChange: (e) => {
				set(e);
				onChange?.(e);
			}
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, { gap: 15 }));
}

// src/SpotifyEnhance/components/SettingComponent/index.jsx
function SpotifyEmbedOptions() {
	const [val, set] = Settings_default.useSetting("spotifyEmbed");
	return /* @__PURE__ */ React_default.createElement(
		RadioGroup, {
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

function SettingComponent() {
	return /* @__PURE__ */ React_default.createElement("div", { className: `${Config_default.info.name}-settings` }, /* @__PURE__ */ React_default.createElement(Collapsible, { title: "miscellaneous" }, /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [{
			settingKey: "player",
			description: "Enable/Disable player."
		},
		{
			settingKey: "enableListenAlong",
			description: "Enables/Disable listen along without premium."
		},
		{
			settingKey: "activity",
			description: "Modify Spotify activity."
		},
		{
			settingKey: "activityIndicator",
			description: "Show user's Spotify activity in chat."
		},
		{
			settingKey: "playerCompactMode",
			description: "Player compact mode"
		},
		{
			settingKey: "playerBannerBackground",
			description: "Use the banner as background for the player."
		},
		{
			settingKey: "embedBannerBackground",
			description: "Use the banner as background for the embed."
		}
	].map(SettingSwtich))), /* @__PURE__ */ React_default.createElement(Gap, { gap: 15 }), /* @__PURE__ */ React_default.createElement(Collapsible, { title: "Show/Hide Player buttons" }, /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [
		{ settingKey: PlayerButtonsEnum.SHARE, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.SHUFFLE, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.PREVIOUS, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.PLAY, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.NEXT, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.REPEAT, hideBorder: true },
		{ settingKey: PlayerButtonsEnum.VOLUME, hideBorder: true, style: { marginBottom: 0 } }
	].map(SettingSwtich))), /* @__PURE__ */ React_default.createElement(Gap, { gap: 15 }), /* @__PURE__ */ React_default.createElement(Collapsible, { title: "Spotify embed style" }, /* @__PURE__ */ React_default.createElement(SpotifyEmbedOptions, null)));
}

// src/SpotifyEnhance/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent, null);
module.exports = () => Plugin_default;
