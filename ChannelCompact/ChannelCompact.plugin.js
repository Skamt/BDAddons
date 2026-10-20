/**
 * @runAt idle
 * @name ChannelCompact
 * @description Enable compact messages per channel
 * @version 1.0.1
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/ChannelCompact
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/ChannelCompact/ChannelCompact.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "ChannelCompact",
		"version": "1.0.1",
		"description": "Enable compact messages per channel",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/ChannelCompact/ChannelCompact.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/ChannelCompact",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();

// common/Utils/Array.js
var add = (array, item, index) => array.toSpliced(index ?? array.length, 0, item);

// common/React.jsx
function insertChild(el, child, index) {
	if (!el?.props?.children || !child) return;
	const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
	el.props.children = add(children, child, index);
}

// common/Utils/async.js
var Defer = class {
	dispose() {
		this.caller = null;
	}
	then(fn = nop) {
		this.caller = fn;
	}
	success(payload) {
		this.caller(payload);
	}
};

// common/Utils/object.js
function getObjectKey(object = {}, filter) {
	for (const key in object)
		if (filter(object[key])) return key;
}

function hasOwn(object, key) {
	return object && key && key in object;
}

// common/Utils/utils.js
function shallow(objA, objB) {
	if (Object.is(objA, objB)) return true;
	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;
	const keysA = Object.keys(objA);
	if (keysA.length !== Object.keys(objB).length) return false;
	for (let i = 0; i < keysA.length; i++)
		if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;
	return true;
}

// common/consts.js
var UNDEFINED_OBJECT_OR_KEY = "Undefined object or key";
var PATCH_ERROR = "Could not perform a patch";
var MISSING_ARGUMENTS = "Missing arguments";

// common/Plugin.js
var target = /* @__PURE__ */ (() => new EventTarget())();

function wrap(handler) {
	return (e) => {
		try {
			handler.apply(null, e);
		} catch (err) {
			Logger.error(`Could not run [${e.type}] handler`, { handler }, "\n", err);
		}
	};
}
var Plugin_default = {
	onStart: (handler, props) => target.addEventListener("START", wrap(handler), props),
	onStop: (handler, props) => target.addEventListener("STOP", wrap(handler), props),
	start() {
		setTimeout(target.dispatchEvent(new Event("START")));
	},
	stop() {
		setTimeout(target.dispatchEvent(new Event("STOP")));
	}
};

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var abortController = /* @__PURE__ */ (() => {
	Plugin_default.onStart(() => abortController = new AbortController());
	Plugin_default.onStop(() => abortController.abort());
	return new AbortController();
})();

function lazy(filter, { sourceFilter, decFilter, ...options } = {}) {
	if (!filter) return Logger.error(`[Webpack lazy] ${MISSING_ARGUMENTS}`);
	const defer = new Defer();
	waitForModule(filter, {
		...options,
		raw: true,
		fatal: false,
		signal: abortController.signal
	}).then((module2) => {
		if (!module2) throw "waitForModule resolved with undefined";
		const object = decFilter ? module2.declarations : module2.exports;
		const key = getObjectKey(object, decFilter || sourceFilter || filter);
		if (!object || !key) throw UNDEFINED_OBJECT_OR_KEY;
		defer.success([object, key]);
		defer.dispose();
	}).catch((cause) => {
		defer.dispose();
		Logger.warn(new Error(PATCH_ERROR, { cause }));
	});
	return { then: defer.then.bind(defer) };
}

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
var instead = (...args) => patch("instead", ...args);

// common/Patcher/contextmenu.js
var contextmenuUnPatches = [];
Plugin_default.onStop(() => {
	contextmenuUnPatches.filter(Boolean).forEach((a) => a());
	contextmenuUnPatches = [];
});
var patch2 = (id, callback) => {
	const undo = ContextMenu.patch(id, callback);
	contextmenuUnPatches.push(undo);
};
var contextmenu_default = ContextMenu;

// common/Discord/zustand.js
var zustand = /* @__PURE__ */ (() => getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
})?.zustand)();
var subscribeWithSelector = /* @__PURE__ */ (() => getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), {
	searchExports: true
}))();

function create(initialState2) {
	const Store2 = zustand(initialState2);
	Object.defineProperty(Store2, "state", {
		configurable: false,
		get: () => Store2.getState()
	});
	return Store2;
}

// src/ChannelCompact/store.js
var initialState = { channels: /* @__PURE__ */ new Set() };
var Store = create(subscribeWithSelector(() => initialState));
var store_default = Store;
Object.assign(Store, {
	add(channelId) {
		this.setState({
			channels: new Set(this.state.channels.add(channelId))
		});
	},
	delete(channelId) {
		if (!this.state.channels.delete(channelId)) return;
		this.setState({
			channels: new Set(this.state.channels)
		});
	},
	has(channelId) {
		return this.state.channels.has(channelId);
	}
});
Store.subscribe(
	(state) => state,
	() => Data.save("channels", Store.state.channels),
	shallow
);
Plugin_default.onStart(() => {
	const channels = Data.load("channels") || [];
	Store.setState({ channels: new Set(channels) });
});

// src/ChannelCompact/index.jsx
Plugin_default.onStart(() => {
	lazy(Filters.bySource("useConversationScroll"), { decFilter: Filters.byStrings("customUserThemeSettings") }).then(
		(ChannelContent) => instead(...ChannelContent, ({ context, args: [props], fn }) => {
			const compact = store_default(() => store_default.has(props.channel.id));
			return fn.apply(context, [Object.assign(props, { messageDisplayCompact: compact })]);
		})
	);
	patch2("channel-context", (retVal, { channel }) => {
		if (!channel) return;
		const enabled = store_default.has(channel.id);
		const MenuItem = contextmenu_default.buildItem({
			id: `channel-compact`,
			type: "toggle",
			label: `Force compact`,
			active: enabled,
			action: () => {
				if (enabled) store_default.delete(channel.id);
				else store_default.add(channel.id);
			}
		});
		insertChild(retVal, MenuItem, 0);
	});
});
module.exports = () => Plugin_default;
