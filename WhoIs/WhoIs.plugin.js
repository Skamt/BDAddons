/**
 * @runAt idle
 * @name WhoIs
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/WhoIs
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/WhoIs/WhoIs.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "WhoIs",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/WhoIs/WhoIs.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/WhoIs",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"autoload": false
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

// common/Utils/Array.js
var add = (array, item, index) => array.toSpliced(index ?? array.length, 0, item);

// common/React.jsx
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;

function insertChild(el, child, index) {
	if (!el?.props?.children || !child) return;
	const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
	el.props.children = add(children, child, index);
}

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
		setTimeout(target.dispatchEvent(new Event("START")));
	},
	stop() {
		setTimeout(target.dispatchEvent(new Event("STOP")));
	}
};

// common/Utils/Object.js
var map = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn({ value, key })]));

function getObjectKey(object = {}, filter) {
	for (const key in object)
		if (filter(object[key])) return key;
}

function hasOwn(object, key) {
	return object && key && key in object;
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
var before = (...args) => patch("before", ...args);

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

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function findKey(obj, filter) {
	const key = getObjectKey(obj, filter);
	return key ? [obj, key] : [];
}

function getModuleAndKey(filter, options) {
	const { exports: exports2 } = getModule(filter, { ...options, raw: true }) || {};
	return findKey(exports2, filter);
}

// MODULES-AUTO-LOADER:@Modules/FetchUser
var FetchUser_default = /* @__PURE__ */ (() => getModule(Filters.byStrings("USER_UPDATE", "default.getUser", "oldFormErrors"), { searchExports: true }))();

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

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = /* @__PURE__ */ (() => getStore("UserStore"))();

// common/Utils/index.js
var makeKey = (...args) => {
	return args.map((o) => JSON.stringify(o)).join("");
};
var memoize = (func) => {
	const cache = /* @__PURE__ */ new Map();
	return (...args) => {
		const key = makeKey(...args);
		if (!cache.has(key)) cache.set(key, func(...args));
		return cache.get(key);
	};
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
	const Store = zustand(initialState);
	Object.defineProperty(Store, "state", {
		configurable: false,
		get: () => Store.getState()
	});
	return Store;
}

// common/Settings.js
var Settings_default = /* @__PURE__ */ (() => {
	const SettingsStore = create(subscribeWithSelector(() => Object.assign(Config_default.settings || {}, Data.load("settings") || {})));
	Object.assign(
		SettingsStore,
		map(
			SettingsStore.getInitialState(),
			({ key }) => Object.assign(() => SettingsStore((state) => state[key]), {
				key,
				get: () => SettingsStore.state[key],
				set: (v) => SettingsStore.setState({
					[key]: v })
			})
		)
	);
	SettingsStore.subscribe(
		(a) => a,
		() => Data.save("settings", SettingsStore.state)
	);
	return SettingsStore;
})();

// common/Utils/Tasks.js
var queue = (fn, concurrent) => {
	const queue2 = [];
	let runningCount = 0;
	const next = async () => {
		if (runningCount >= concurrent || queue2.length === 0)
			return;
		const { resolve, reject, args } = queue2.shift();
		try {
			runningCount++;
			resolve(await fn(...args));
		} catch (error) {
			reject(error);
		} finally {
			runningCount--;
			next();
		}
	};
	return (...args) => {
		const { promise, resolve, reject } = Promise.withResolvers();
		queue2.push({ resolve, reject, args });
		next();
		return promise;
	};
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

// common/Components/Divider/index.jsx
var c = classNameFactory("divider");

function Divider({ gap = 15, gutter = 0, direction = Divider.direction.HORIZONTAL }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { "--divider-gap": `${gap}px`, "--divider-gutter": `${gutter}%` },
			className: c("base", direction)
		}
	);
}
Divider.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ setting, note, border = false, description, ...rest }) {
	const val = Settings_default(setting.get);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Switch_default, {
			...rest,
			hasIcon: true,
			checked: val,
			label: description || setting.key,
			description: note,
			onChange: setting.set
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, { gap: 15 }));
}

// src/WhoIs/index.js
var UserMention = getModuleAndKey(Filters.byStrings(".A.USER_MENTION),"));
var FetchUser = queue(memoize(FetchUser_default), 3);
Plugin_default.onStart(() => {
	before(...UserMention, ({ args: [props] }) => {
		if (props.userId) return;
		props.userId = props.parsedUserId;
		if (Settings_default.state.autoload) {
			if (!UserStore_default.getUser(props.userId)) FetchUser(props.userId);
		}
	});
	patch2("unknown-user-context", (retVal, { userId }) => {
		if (!userId) return;
		const MenuItem = BdApi.ContextMenu.buildItem({
			label: "Load User",
			action() {
				if (UserStore_default.getUser(userId)) return Toast_default.info("User alreayd loaded");
				FetchUser(userId).then(
					() => Toast_default.success("User Loaded!"),
					() => Toast_default.error(`Could not load user: ${userId}`)
				);
			}
		});
		insertChild(retVal, MenuItem, 0);
	});
});
Plugin_default.getSettingsPanel = () => () => [{
	description: "Auto load unknown users",
	setting: Settings_default.autoload
}].map(SettingSwtich);
module.exports = () => Plugin_default;
