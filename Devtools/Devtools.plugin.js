/**
 * @name Devtools
 * @description Helpful devtools for discord modules
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Devtools
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Devtools/Devtools.plugin.js
 */

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
	for (var name in all)
		__defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames(from))
			if (!__hasOwnProp.call(to, key) && key !== except)
				__defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
	}
	return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/Devtools/index.jsx
var index_exports = {};
__export(index_exports, {
	default: () => Devtools
});
module.exports = __toCommonJS(index_exports);

// config:@Config
var Config_default = {
	"info": {
		"name": "Devtools",
		"version": "1.0.0",
		"description": "Helpful devtools for discord modules",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/Devtools/Devtools.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/Devtools",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var React = /* @__PURE__ */ (() => Api.React)();
var ReactDOM = /* @__PURE__ */ (() => Api.ReactDOM)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var Webpack = /* @__PURE__ */ (() => Api.Webpack)();
var getOwnerInstance = /* @__PURE__ */ (() => Api.ReactUtils.getOwnerInstance.bind(Api.ReactUtils))();

// common/React.jsx
var React_default = /* @__PURE__ */ (() => React)();

// common/Utils/Logger.js
Logger.patchError = (patchId) => {
	console.error(`%c[${Config_default.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};
var Logger_default = Logger;

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary = class extends React_default.Component {
	state = { hasError: false, error: null, info: null };
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `
	${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${Config_default?.info?.name || "Unknown Plugin"}] %cthrew an exception at %c[${this.props.id}]
`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}
	renderErrorBoundary() {
		return /* @__PURE__ */ React_default.createElement("div", { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" } }, /* @__PURE__ */ React_default.createElement("b", { style: { color: "#e0e1e5" } }, "An error has occured while rendering ", /* @__PURE__ */ React_default.createElement("span", { style: { color: "orange" } }, this.props.id)));
	}
	renderFallback() {
		if (React_default.isValidElement(this.props.fallback)) {
			if (this.props.passMetaProps)
				this.props.fallback.props = {
					id: this.props.id,
					plugin: Config_default?.info?.name || "Unknown Plugin",
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return /* @__PURE__ */ React_default.createElement(
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

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();

function getModuleAndKey(filter, options) {
	let module2;
	const target = getModule((entry, m) => filter(entry) ? module2 = m : false, options);
	module2 = module2?.exports;
	if (!module2) return;
	const key = Object.keys(module2).find((k) => module2[k] === target);
	if (!key) return;
	return { module: module2, key };
}

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: false });

// MODULES-AUTO-LOADER:@Modules/TheBigBoyBundle
var TheBigBoyBundle_default = getModule(Filters.byKeys("openModal", "FormSwitch", "Anchor"), { searchExports: false });

// common/Utils/index.js
var Utils_exports = {};
__export(Utils_exports, {
	BrokenAddon: () => BrokenAddon,
	Disposable: () => Disposable,
	animate: () => animate,
	buildUrl: () => buildUrl,
	clsx: () => clsx,
	concateClassNames: () => concateClassNames,
	copy: () => copy,
	debounce: () => debounce,
	exceptionWrapper: () => exceptionWrapper,
	fit: () => fit,
	genUrlParamsFromArray: () => genUrlParamsFromArray,
	getImageDimensions: () => getImageDimensions,
	getNestedProp: () => getNestedProp,
	getPathName: () => getPathName,
	hook: () => hook,
	isSnowflake: () => isSnowflake,
	nop: () => nop,
	parseSnowflake: () => parseSnowflake,
	prettyfiyBytes: () => prettyfiyBytes,
	promiseHandler: () => promiseHandler,
	reRender: () => reRender,
	shallow: () => shallow,
	sleep: () => sleep
});

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

function clsx(prefix) {
	return (...args) => args.filter(Boolean).map((a) => `${prefix}-${a}`).join(" ");
}

function getPathName(url) {
	try {
		return new URL(url).pathname;
	} catch {}
}

function easeInOutSin(time) {
	return (1 + Math.sin(Math.PI * time - Math.PI / 2)) / 2;
}

function animate(property, element, to, options = {}, cb = () => {}) {
	const {
		ease = easeInOutSin,
			duration = 300
		// standard
	} = options;
	let start = null;
	const from = element[property];
	let cancelled = false;
	const cancel = () => {
		cancelled = true;
	};
	const step = (timestamp) => {
		if (cancelled) {
			cb(new Error("Animation cancelled"));
			return;
		}
		if (start === null) {
			start = timestamp;
		}
		const time = Math.min(1, (timestamp - start) / duration);
		element[property] = ease(time) * (to - from) + from;
		if (time >= 1) {
			requestAnimationFrame(() => {
				cb(null);
			});
			return;
		}
		requestAnimationFrame(step);
	};
	if (from === to) {
		cb(new Error("Element already at target position"));
		return cancel;
	}
	requestAnimationFrame(step);
	return cancel;
}

function debounce(func, wait = 166) {
	let timeout;

	function debounced(...args) {
		const later = () => {
			func.apply(this, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	}
	debounced.clear = () => {
		clearTimeout(timeout);
	};
	return debounced;
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

function getNestedProp(obj, path) {
	return path.split(".").reduce((ob, prop) => ob?.[prop], obj);
}
var BrokenAddon = class {
	stop() {}
	start() {
		BdApi.alert(Config_default.info.name, "Plugin is broken, Notify the dev.");
	}
};
var Disposable = class {
	constructor() {
		this.patches = [];
	}
	Dispose() {
		this.patches?.forEach((p) => p?.());
		this.patches = [];
	}
};

function reRender(selector) {
	const target = document.querySelector(selector)?.parentElement;
	if (!target) return;
	const instance = getOwnerInstance(target);
	const unpatch = Patcher.instead(instance, "render", () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}
var nop = () => {};

function sleep(delay) {
	return new Promise((done) => setTimeout(() => done(), delay * 1e3));
}

function prettyfiyBytes(bytes, si = false, dp = 1) {
	const thresh = si ? 1e3 : 1024;
	if (Math.abs(bytes) < thresh) {
		return `${bytes} B`;
	}
	const units = si ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	let u = -1;
	const r = 10 ** dp;
	do {
		bytes /= thresh;
		++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
	return `${bytes.toFixed(dp)} ${units[u]}`;
}

function parseSnowflake(snowflake) {
	return snowflake / 4194304 + 14200704e5;
}

function isSnowflake(id) {
	try {
		return BigInt(id).toString() === id;
	} catch {
		return false;
	}
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

function getImageDimensions(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve({
			width: img.width,
			height: img.height
		});
		img.onerror = reject;
		img.src = url;
	});
}

function hook(hook2, ...args) {
	let v;
	const b = document.createElement("div");
	const root = ReactDOM.createRoot(b);
	root.render(React.createElement(() => (v = hook2(...args), null)));
	root.unmount(b);
	return v;
}

function exceptionWrapper(fn, exp, fin) {
	return () => {
		try {
			fn?.();
		} catch (e) {
			exp?.(e);
		} finally {
			fin?.();
		}
	};
}

// MODULES-AUTO-LOADER:@Enums/DiscordPermissionsEnum
var DiscordPermissionsEnum_default = getModule(Filters.byKeys("ADD_REACTIONS"), { searchExports: true }) || {
	"EMBED_LINKS": "16384n",
	"USE_EXTERNAL_EMOJIS": "262144n"
};

// src/Devtools/webpackRequire.js
var chunkName = Object.keys(window).find((key) => key.startsWith("webpackChunk"));
var chunk = window[chunkName];
var webpackreq;
chunk.push([
	[Symbol()], {}, (r) => webpackreq = r.b ? r : webpackreq
]);
chunk.pop();
var webpackRequire_default = webpackreq;

// src/Devtools/Sources.js
var Source = class {
	constructor(id, loader) {
		this.id = id;
		this.loader = loader;
	}
	get module() {
		return Modules.moduleById(this.id);
	}
	get code() {
		return this.loader.toString();
	}
	get saveSourceToDesktop() {
		try {
			const fs = require("fs");
			const path = `${process.env.USERPROFILE}\\Desktop\\${this.id}.js`;
			fs.writeFileSync(path, this.code, "utf8");
			return `Saved to: ${path}`;
		} catch (e) {
			return e;
		}
	}
};

function sourceById(id) {
	return new Source(id, webpackRequire_default.m[id]);
}

function* sourceLookup(...args) {
	const strArr = args;
	const invert = typeof args[args.length - 1] === "boolean" ? args.pop() : false;
	for (const [id, source] of Object.entries(webpackRequire_default.m)) {
		const sourceCode = source.toString();
		const result = strArr.every((str) => sourceCode.includes(str));
		if (invert ^ result) yield new Source(id, source);
	}
}

function getSources(...args) {
	return [...sourceLookup(...args)];
}

function getSource(...args) {
	const b = sourceLookup(...args);
	const res = b.next().value;
	b.return();
	return res;
}
var Sources = {
	getWebpackSources() {
		return webpackRequire_default.m;
	},
	sourceById,
	getSource,
	getSources
};

// src/Devtools/Modules.js
var defineModuleGetter = (obj, id) => Object.defineProperty(obj, id, {
	enumerable: true,
	get() {
		return Modules.moduleById(id);
	}
});
var Module = class {
	constructor(id, module2) {
		this.id = id;
		this.rawModule = module2;
		this.exports = module2.exports;
		const source = Sources.sourceById(id);
		this.loader = source.loader;
	}
	get exportsUses() {
		const keys = Object.keys(this.exports);
		const t = this;
		const ret = {};
		for (let i = keys.length - 1; i >= 0; i--) {
			const key = keys[i];
			Object.defineProperty(ret, key, {
				enumerable: true,
				get() {
					return Object.keys(t.modulesUsingThisModule).filter((id) => {
						const code = t.modulesUsingThisModule[id].code;
						return exportInModule(code, t.id, key);
					}).reduce((acc, id) => defineModuleGetter(acc, id), {});
				}
			});
		}
		return ret;
	}
	get code() {
		return this.loader.toString();
	}
	get imports() {
		return Modules.modulesImportedInModuleById(this.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}
	get modulesUsingThisModule() {
		return Modules.modulesImportingModuleById(this.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}
	get saveSourceToDesktop() {
		try {
			const fs = require("fs");
			const path = `${process.env.USERPROFILE}\\Desktop\\${this.id}.js`;
			fs.writeFileSync(path, this.code, "utf8");
			return `Saved to: ${path}`;
		} catch (e) {
			return e;
		}
	}
	get saveAllToDesktop() {
		try {
			const fs = require("fs");
			const path = `${process.env.USERPROFILE}\\Desktop\\${this.id}`;
			if (!fs.existsSync(path)) fs.mkdirSync(path);
			fs.writeFileSync(`${path}\\__MAIN-${this.id}.js`, this.code, "utf8");
			fs.mkdirSync(`${path}\\modulesUsingThisModule`);
			fs.mkdirSync(`${path}\\imports`);
			{
				const modules = Object.entries(this.modulesUsingThisModule);
				for (let i = modules.length - 1; i >= 0; i--) {
					const [id, module2] = modules[i];
					const code = module2.code;
					fs.writeFileSync(`${path}\\modulesUsingThisModule\\${id}.js`, code, "utf8");
				}
			} {
				const modules = Object.entries(this.imports);
				for (let i = modules.length - 1; i >= 0; i--) {
					const [id, module2] = modules[i];
					const code = module2.code;
					fs.writeFileSync(`${path}\\imports\\${id}.js`, code, "utf8");
				}
			}
			return `Saved to: ${path}`;
		} catch (e) {
			return e;
		}
	}
};

function getWebpackModules() {
	return webpackRequire_default.c;
}

function moduleById(id) {
	const module2 = webpackRequire_default.c[id];
	if (!module2) return;
	return new Module(id, module2);
}

function modulesImportedInModuleById(id) {
	const { code } = Sources.sourceById(id);
	const args = code.match(/\((.+?)\)/i)?.[1];
	if (args?.length > 5 || !args) return [];
	const req = args.split(",")[2];
	const re = new RegExp(`(?:\\s|\\(|,|=)${req}\\("?(\\d+)"?\\)`, "g");
	const imports = Array.from(code.matchAll(re));
	return imports.map((id2) => id2[1]);
}

function exportInModule(code, id, key) {
	const args = code.match(/\((.+?)\)/i)?.[1];
	if (args?.length > 5 || !args) return [];
	const req = args.split(",")[2];
	const re = new RegExp(`([a-zA-Z_$][a-zA-Z_$0-9]*)=${req}\\(${id}\\)`);
	const [, identifier] = Array.from(code.match(re));
	return code.includes(`${identifier}.${key}`);
}

function modulesImportingModuleById(id) {
	return Object.keys(Sources.getWebpackSources()).filter((sourceId) => modulesImportedInModuleById(sourceId).includes(`${id}`));
}

function noExports(filter, module2, exports) {
	if (filter(exports, module2, module2.id)) return new Module(module2.id, module2);
}

function doExports(filter, module2, exports) {
	if (typeof exports !== "object" && typeof exports !== "function") return;
	for (const entryKey in exports) {
		let target = null;
		try {
			target = exports[entryKey];
		} catch {
			continue;
		}
		if (sanitizeExports(target)) continue;
		if (filter(target, module2, module2.id)) return { target, entryKey, module: new Module(module2.id, module2) };
	}
}

function sanitizeExports(exports) {
	if (!exports) return true;
	if (exports === Symbol) return true;
	if (exports.TypedArray) return true;
	if (exports === window) return true;
	if (exports instanceof Window) return true;
	if (exports === document.documentElement) return true;
	if (exports[Symbol.toStringTag] === "DOMTokenList") return true;
	return false;
}

function* moduleLookup(filter, options = {}) {
	const { searchExports = false } = options;
	const gauntlet = searchExports ? doExports : noExports;
	const keys = Object.keys(webpackRequire_default.c);
	for (let index = keys.length - 1; index >= 0; index--) {
		const module2 = webpackRequire_default.c[keys[index]];
		const { exports } = module2;
		if (sanitizeExports(exports)) continue;
		const match = gauntlet(filter, module2, exports);
		if (match) yield match;
	}
}

function getModules(filter, options) {
	return [...moduleLookup(filter, options)];
}

function getModule2(filter, options) {
	const b = moduleLookup(filter, options);
	const res = b.next().value;
	b.return();
	return res;
}
var Modules = {
	moduleById,
	moduleLookup,
	getWebpackModules,
	modulesImportedInModuleById,
	modulesImportingModuleById,
	getModules,
	getModule: getModule2
};

// src/Devtools/Misc.js
var Misc = {
	// getAllCssModules(){
	// 	return cssModulesId.map(Modules.moduleById);
	// },
	getAllAssets() {
		return Modules.getModules((a) => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/)).map((a) => a.exports);
	},
	getEventListeners(eventName) {
		const nodes = Dispatcher_default._actionHandlers._dependencyGraph.nodes;
		const subs = Dispatcher_default._subscriptions;
		return {
			stores: Object.values(nodes).map((a) => a.actionHandler[eventName] && a).filter(Boolean),
			subs: [eventName, subs[eventName]]
		};
	},
	getEventListenersFuzzy(str = "") {
		str = str.toLowerCase();
		const nodes = Dispatcher_default._actionHandlers._dependencyGraph.nodes;
		const subs = Dispatcher_default._subscriptions;
		return {
			stores: Object.values(nodes).filter((a) => Object.keys(a.actionHandler).some((key) => key.toLowerCase().includes(str))),
			subs: Object.entries(subs).filter(([key]) => key.toLowerCase().includes(str)).map((a) => a)
		};
	},
	getGraph: /* @__PURE__ */ (() => {
		let graph = null;
		return function getGraph(refresh = false) {
			if (graph === null || refresh) graph = Object.keys(Modules.getWebpackModules()).map((a) => ({ id: a, modules: Modules.modulesImportedInModuleById(a) }));
			return graph;
		};
	})()
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

// src/Devtools/SettingComponent.jsx
function SettingComponent_default({ settings: settings2, enableExp: enableExp2 }) {
	const [enabled, setEnabled] = React_default.useState(settings2.expEnabled);
	return /* @__PURE__ */ React_default.createElement(
		Switch_default, {
			value: enabled,
			hideBorder: false,
			onChange: (e) => {
				settings2.expEnabled = e;
				setEnabled(e);
				enableExp2(e);
			}
		},
		"enableExperiments"
	);
}

// src/Devtools/Stores.js
var Store = class {
	constructor(module2) {
		this.module = module2;
		this.name = this.store.getName();
		this.methods = {};
		const _this = this;
		Object.getOwnPropertyNames(this.store.__proto__).forEach((key) => {
			if (key === "constructor") return;
			const func = this.store[key];
			if (typeof func !== "function") return;
			if (func.length === 0)
				return Object.defineProperty(this.methods, key, {
					get() {
						return _this.store[key]();
					}
				});
			this.methods[key] = func;
		});
	}
	get store() {
		for (const key of ["Z", "ZP", "default"])
			if (key in this.module.exports) return this.module.exports[key];
	}
	// get localVars() {
	// 	return this.store.__getLocalVars();
	// }
	get events() {
		return Stores.getStoreListeners(this.name);
	}
};
var Zustand = Sources.getSource("/ServerSideRendering|^Deno\\//");
var Stores = {
	getStore(storeName) {
		const storeFilter = (exp) => exp && ["Z", "ZP", "default"].some((k) => exp[k]?._dispatchToken && exp[k]?._changeCallbacks && exp[k]?.getName() === storeName);
		const module2 = Modules.getModule(storeFilter);
		if (!module2) return void 0;
		return new Store(module2);
	},
	getStoreFuzzy(str = "") {
		const storeFilter = (exp) => exp && ["Z", "ZP", "default"].some((k) => exp[k]?._dispatchToken && exp[k]?._changeCallbacks && exp[k]?.getName()?.toLowerCase?.().includes(str));
		return Modules.getModules(storeFilter).map((module2) => new Store(module2));
	},
	getStoreListeners(storeName) {
		const nodes = Dispatcher_default._actionHandlers._dependencyGraph.nodes;
		const storeHandlers = Object.values(nodes).filter(({ name }) => name === storeName);
		return storeHandlers[0];
	},
	getSortedStores: /* @__PURE__ */ (() => {
		let stores = null;
		return function getSortedStores(force) {
			if (!stores || force) {
				stores = Modules.getModule((a) => a?.Store, { searchExports: true }).target.Store.getAll().map((store) => [store.getName(), store]).sort((a, b) => a[0].localeCompare(b[0])).map(([a, b]) => ({
					[a]: b }));
			}
			return stores;
		};
	})(),
	getZustanStores() {
		return Zustand.module.modulesUsingThisModule;
	}
};

// src/Devtools/index.jsx
var d = (() => {
	const cache = /* @__PURE__ */ new WeakMap();
	const emptyDoc = document.createDocumentFragment();

	function isValidCSSSelector(selector) {
		try {
			emptyDoc.querySelector(selector);
		} catch {
			return false;
		}
		return true;
	}

	function getElement(target) {
		if (typeof target === "string" && isValidCSSSelector(target)) return document.querySelector(target);
		if (target instanceof HTMLElement) return target;
		return void 0;
	}

	function getCssRules(el) {
		const output = {};
		for (let i = 0; i < document.styleSheets.length; i++) {
			const stylesheet = document.styleSheets[i];
			const { rules } = stylesheet;
			const ID = stylesheet.href || stylesheet.ownerNode.id || i;
			output[ID] = {};
			el.classList.forEach((c) => {
				output[ID][c] = [];
				for (let j = 0; j < rules.length; j++) {
					const rule = rules[j];
					if (rule.cssText.includes(c)) output[ID][c].push(rule);
				}
				if (output[ID][c].length === 0) delete output[ID][c];
			});
			if (Object.keys(output[ID]).length === 0) delete output[ID];
		}
		return output;
	}

	function getCssRulesForElement(target, noCache) {
		const el = getElement(target);
		if (!el) return;
		if (!noCache && cache.has(el)) return cache.get(el);
		const data = getCssRules(el);
		cache.set(el, data);
		return data;
	}

	function scrollerStylesForElement(el) {
		const output = [];
		const styles = getCssRulesForElement(el);
		for (const cssStyleRules of Object.values(styles)) {
			for (const rules of Object.values(cssStyleRules)) {
				for (let i = 0; i < rules.length; i++) {
					const rule = rules[i];
					if (rule.selectorText?.includes("-webkit-scrollbar")) output.push(rule);
				}
			}
		}
		return output;
	}
	return {
		getCssRulesForElement,
		scrollerStylesForElement
	};
})();

function dispatcherEventInterceptor(eventName, fn) {
	const index = Dispatcher_default._interceptors.length;
	Dispatcher_default.addInterceptor((e) => {
		if (e.type !== eventName) return;
		try {
			fn(e);
		} catch {}
	});
	return () => Dispatcher_default._interceptors.splice(index, 1);
}

function init() {
	window.s = Object.assign((id) => Modules.moduleById(id), {
		bd: {
			...BdApi.Webpack,
			getModuleAndKey
		},
		Utils: {
			ErrorBoundary,
			...Utils_exports,
			...d,
			dispatcherEventInterceptor
		},
		r: webpackRequire_default,
		...Misc,
		...Stores,
		...Sources,
		...Modules,
		DiscordModules: {
			Dispatcher: Dispatcher_default,
			TheBigBoyBundle: TheBigBoyBundle_default,
			DiscordPermissionsEnum: DiscordPermissionsEnum_default
		}
	});
}
var settings = {
	expEnabled: false
};
var DeveloperExperimentStore = Stores.getStore("DeveloperExperimentStore");
var ExperimentStore = Stores.getStore("ExperimentStore");
var UserStore = Stores.getStore("UserStore").store;

function updateStores() {
	try {
		DeveloperExperimentStore.events.actionHandler.CONNECTION_OPEN();
		ExperimentStore.events.actionHandler.OVERLAY_INITIALIZE({
			user: UserStore.getCurrentUser()
		});
		ExperimentStore.events.storeDidChange();
	} catch {}
}
var enableExp = /* @__PURE__ */ (() => {
	let unpatch = () => {};
	return function enableExp2(b) {
		if (!b) {
			unpatch?.();
			UserStore.getCurrentUser().flags = 256;
		} else {
			unpatch = Patcher.after(UserStore, "getCurrentUser", (_, __, ret) => {
				if (!ret) return;
				ret.flags = 1;
			});
		}
		updateStores();
	};
})();
var Devtools = class {
	start() {
		try {
			init();
		} catch (e) {
			Logger_default.error(e);
		}
	}
	stop() {
		"s" in window && delete window.s;
		enableExp(false);
	}
	getSettingsPanel() {
		return /* @__PURE__ */ React.createElement(
			SettingComponent_default, {
				settings,
				enableExp
			}
		);
	}
};
