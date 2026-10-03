/**
 * @runAt idle
 * @name NoTrack
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/NoTrack
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/NoTrack/NoTrack.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "NoTrack",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/NoTrack/NoTrack.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/NoTrack",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();

// common/Utils/Array.js
var loop = (array, callback) => {
	for (let i = 0; i < array.length; i++) callback(array[i], i, array);
};

// common/Utils/index.js
function hasOwn(object, key) {
	return object && key && key in object;
}
var nop = () => {};

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

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true }))();

// common/Flux.js
var handlers = /* @__PURE__ */ new Set();

function intercept(event, fn) {
	function interceptor(...args) {
		if (args[0].type === event) fn.apply(null, args);
	}
	Dispatcher_default.addInterceptor(interceptor);
	const undo = () => {
		handlers.delete(undo);
		const index = Dispatcher_default._interceptors.indexOf(interceptor);
		Dispatcher_default._interceptors.splice(index, 1);
	};
	handlers.add(undo);
	return undo;
}

function unsubscribeAll() {
	handlers?.forEach?.(Reflect.apply);
	handlers.length = 0;
}
var blockEvent = (e) => intercept(e, () => false);
Plugin_default.onStop(unsubscribeAll);

// common/Patcher/shared.js
Plugin_default.onStop(() => Patcher.unpatchAll());

function patch(type, object, key, callback) {
	if (!hasOwn(object, key))
		return Logger.error("Could not perform a patch, missing arguments", arguments);
	const caller = {
		after: (context, args, ret) => callback({ context, args, ret }),
		before: (context, args) => callback({ context, args }),
		instead: (context, args, fn) => callback({ context, args, fn })
	} [type];
	return Patcher[type](object, key, caller);
}

// common/Patcher/index.js
var before = (...args) => patch("before", ...args);

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = /* @__PURE__ */ (() => getStore("UserStore"))();

// MODULES-AUTO-LOADER:@Modules/DiscordUtils
var DiscordUtils_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("getDiscordUtils"), { searchExports: false }))();

// MODULES-AUTO-LOADER:@Modules/Analytics
var Analytics_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("AnalyticEventConfigs"), { searchExports: false }))();

// MODULES-AUTO-LOADER:@Modules/MessageActions
var MessageActions_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("jumpToMessage", "_sendMessage"), { searchExports: false }))();

// src/NoTrack/index.js
var Anchor = getModule(Filters.byKeys("Anchor"));
var targets = ["spotify"];
var blockedEvents = ["FINGERPRINT", "TRACK"];

function urlRegex(name) {
	return new RegExp(`((?:https|http)\\:\\/\\/(?:.*\\.)?${name}\\..*\\/\\S+)`, "g");
}

function sanitizeUrls(content, filters) {
	filters.forEach((regex) => {
		content.match(regex).forEach((url) => content = content.replace(url, url.split("?")[0]));
	});
	return content;
}

function handleMessage(msgcontent) {
	if (!msgcontent) return;
	const filters = [];
	for (const target2 of targets) {
		const regex = urlRegex(target2);
		if (msgcontent.match(regex)) filters.push(regex);
	}
	if (filters.length > 0) return sanitizeUrls(msgcontent, filters);
	return msgcontent;
}

function once() {
	DiscordUtils_default.setObservedGamesCallback([], nop);
	DiscordUtils_default.setObservedGamesCallback = nop;
	DiscordUtils_default.submitLiveCrashReport = nop;
	Analytics_default.default.track = nop;
}
Plugin_default.onStart(once, { once: true });
Plugin_default.onStart(() => {
	before(Anchor, "Anchor", ({ args }) => args[0].href = handleMessage(args[0].href));
	before(MessageActions_default, "sendMessage", ({ args: [, message] }) => message.content = handleMessage(message.content));
	loop(blockedEvents, blockEvent);
	intercept("MESSAGE_CREATE", ({ type, message }) => {
		if (type === "MESSAGE_CREATE") {
			if (message.author.id !== UserStore_default.getCurrentUser().id) message.content = handleMessage(message.content);
		}
	});
});
module.exports = () => Plugin_default;
