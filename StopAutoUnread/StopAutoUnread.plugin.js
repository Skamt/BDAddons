/**
 * @runAt idle
 * @name StopAutoUnread
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/StopAutoUnread
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/StopAutoUnread/StopAutoUnread.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "StopAutoUnread",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/StopAutoUnread/StopAutoUnread.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/StopAutoUnread",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var Webpack = /* @__PURE__ */ (() => Api.Webpack)();

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
	stopped = true;
	start() {
		this.emit(Events.START);
		this.stopped = false;
	}
	stop() {
		this.emit(Events.STOP);
		this.stopped = true;
	}
}();

// common/Webpack.js
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

// MODULES-AUTO-LOADER:@Stores/UnreadSettingNoticeStore2
var UnreadSettingNoticeStore2_default = getStore("UnreadSettingNoticeStore2");

// src/StopAutoUnread/index.js
Plugin_default.on(Events.START, () => {
	Patcher.instead(UnreadSettingNoticeStore2_default, "maybeAutoUpgradeChannel", () => false);
});
Plugin_default.on(Events.STOP, () => {
	Patcher.unpatchAll();
});
module.exports = () => Plugin_default;
