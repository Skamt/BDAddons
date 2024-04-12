/**
 * @name Devtools
 * @description Helpful devtools for discord modules
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Devtools
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Devtools/Devtools.plugin.js
 */

const config = {
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
}

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
const React = Api.React;
const Patcher = Api.Patcher;

const getModule$1 = Api.Webpack.getModule;
const Filters = Api.Webpack.Filters;

const getOwnerInstance = Api.ReactUtils.getOwnerInstance;

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule$1((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return undefined;
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return undefined;
	return { module, key };
}

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

const ImageModalVideoModal = getModule$1(Filters.byProps("ImageModal"), { searchExports: false });

const RenderLinkComponent = getModule$1(m => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });

const TheBigBoyBundle = getModule$1(Filters.byProps("openModal", "FormSwitch", "Anchor"), { searchExports: false });

const { ModalRoot, ModalSize } = TheBigBoyBundle;
const ImageModal = ImageModalVideoModal.ImageModal;

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

function getNestedProp(obj, path) {
	return path.split(".").reduce((ob, prop) => ob?.[prop], obj);
}

class BrokenAddon {
	stop() {}
	start() {
		BdApi.alert(config.info.name, "Plugin is broken, Notify the dev.");
	}
}

class Disposable {
	constructor() {
		this.patches = [];
	}

	Dispose() {
		this.patches?.forEach(p => p?.());
		this.patches = [];
	}
}

function reRender(selector) {
	const target = document.querySelector(selector)?.parentElement;
	if (!target) return;
	const instance = getOwnerInstance(target);
	const unpatch = Patcher.instead(instance, "render", () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}

const nop = () => {};

function sleep(delay) {
	return new Promise(done => setTimeout(() => done(), delay * 1000));
}

function prettyfiyBytes(bytes, si = false, dp = 1) {
	const thresh = si ? 1000 : 1024;

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
	return snowflake / 4194304 + 1420070400000;
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
		img.onload = () =>
			resolve({
				width: img.width,
				height: img.height
			});
		img.onerror = reject;
		img.src = url;
	});
}

const Utils = /*#__PURE__*/ Object.freeze({
	__proto__: null,
	BrokenAddon,
	Disposable,
	buildUrl,
	copy,
	genUrlParamsFromArray,
	getImageDimensions,
	getImageModalComponent,
	getNestedProp,
	nop,
	openModal,
	parseSnowflake,
	prettyfiyBytes,
	promiseHandler,
	reRender,
	sleep
});

const chunkName = Object.keys(window).find(key => key.startsWith("webpackChunk"));
const chunk = window[chunkName];
let webpackreq;
chunk.push([
	[Symbol()], {},
	r => webpackreq = r
]);
chunk.pop();
const webpackRequire = webpackreq;

class Source {
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
}

function sourceById(id) {
	return new Source(id, webpackRequire.m[id]);
}

function* sourceLookup(...args) {
	const strArr = args;
	const invert = typeof args[args.length - 1] === "boolean" ? args.pop() : false;

	for (const [id, source] of Object.entries(webpackRequire.m)) {
		const sourceCode = source.toString();
		const result = strArr.every(str => sourceCode.includes(str));
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

const Sources = {
	getWebpackSources() {
		return webpackRequire.m;
	},
	sourceById,
	getSource,
	getSources
};

function defineModuleGetter(obj, id) {
	return Object.defineProperty(obj, id, {
		enumerable: true,
		get() {
			return Modules.moduleById(id);
		}
	});
}

class Module {
	constructor(id, module) {
		this.id = id;
		this.rawModule = module;
		this.exports = module.exports;
		const source = Sources.sourceById(id);
		this.loader = source.loader;
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
			fs.mkdirSync(`${path}\\imports`); {
				const modules = Object.entries(this.modulesUsingThisModule);
				for (let i = modules.length - 1; i >= 0; i--) {
					const [id, module] = modules[i];
					const code = module.code;
					fs.writeFileSync(`${path}\\modulesUsingThisModule\\${id}.js`, code, "utf8");
				}
			}

			{
				const modules = Object.entries(this.imports);
				for (let i = modules.length - 1; i >= 0; i--) {
					const [id, module] = modules[i];
					const code = module.code;
					fs.writeFileSync(`${path}\\imports\\${id}.js`, code, "utf8");
				}
			}
			return `Saved to: ${path}`;
		} catch (e) {
			return e;
		}
	}
}

function getWebpackModules() {
	return webpackRequire.c;
}

function moduleById(id) {
	return new Module(id, webpackRequire.c[id]);
}

function modulesImportedInModuleById(id) {
	const { code } = Sources.sourceById(id);
	const args = code.match(/\((.+?)\)/i)?.[1];
	if (args?.length > 5 || !args) return [];

	const req = args.split(",")[2];
	const re = new RegExp(`(?:\\s|\\(|,|=)${req}\\("?(\\d+)"?\\)`, "g");
	const imports = Array.from(code.matchAll(re));

	return imports.map(id => id[1]);
}

function modulesImportingModuleById(id) {
	return Object.keys(Sources.getWebpackSources()).filter(sourceId => modulesImportedInModuleById(sourceId).includes(`${id}`));
}

function noExports(filter, module, exports) {
	if (filter(exports)) return new Module(module.id, module);
}

function doExports(filter, module, exports, index) {
	if (typeof exports !== "object") return;
	for (const entryKey in exports) {
		let target = null;
		try {
			target = exports[entryKey];
		} catch {
			continue;
		}
		if (!target) continue;
		if (filter(target, module, index)) return { target, entryKey, module: new Module(module.id, module) };
	}
}

function sanitizeExports(exports) {
	if (!exports) return;
	const exportsExceptions = [exports => typeof exports === "boolean", exports => exports === window, exports => exports.TypedArray, exports => exports === document.documentElement, exports => exports[Symbol.toStringTag] === "DOMTokenList"];
	for (let index = exportsExceptions.length - 1; index >= 0; index--) {
		if (exportsExceptions[index](exports)) return true;
	}
}

function* moduleLookup(filter, options = {}) {
	const { searchExports = false } = options;
	const gauntlet = searchExports ? doExports : noExports;

	const modules = Object.values(webpackRequire.c);
	for (let index = modules.length - 1; index >= 0; index--) {
		const module = modules[index];
		const { exports } = module;
		if (sanitizeExports(exports)) continue;
		const match = gauntlet(filter, module, exports, index);
		if (match) yield match;
	}
}

function getModules(filter, options) {
	return [...moduleLookup(filter, options)];
}

function getModule(filter, options) {
	const b = moduleLookup(filter, options);
	const res = b.next().value;
	b.return();
	return res;
}

const Modules = {
	moduleById,
	moduleLookup,
	getWebpackModules,
	modulesImportedInModuleById,
	modulesImportingModuleById,
	getModules,
	getModule
};

const Dispatcher = getModule$1(Filters.byProps("dispatch", "subscribe"), { searchExports: false });

class Store {
	constructor(module) {
		this.module = module;
		this.name = this.store.getName();

		this.methods = {};
		const _this = this;

		Object.getOwnPropertyNames(this.store.__proto__).forEach(key => {
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
		return this.module.exports.default;
	}

	get events() {
		return Stores.getStoreListeners(this.name);
	}
}

const Zustand = Sources.getSource("/ServerSideRendering|^Deno\\//");

const Stores = {
	getStore(storeName) {
		const storeFilter = exp => exp?.default?._dispatchToken && exp?.default?.getName() === storeName;
		const module = Modules.getModule(storeFilter);
		if (!module) return undefined;
		return new Store(module);
	},
	getStoreFuzzy(str = "") {
		const storeFilter = exp => exp?.default?._dispatchToken && exp?.default?.getName().toLowerCase().includes(str.toLowerCase());
		return Modules.getModules(storeFilter).map(module => new Store(module));
	},
	getStoreListeners(storeName) {
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const storeHandlers = Object.values(nodes).filter(({ name }) => name === storeName);
		return storeHandlers[0];
	},
	getSortedStores: (() => {
		let stores = null;
		return function getSortedStores(force) {
			if (!stores || force) {
				stores = Modules.getModule(a => a?.Store).exports.Store.getAll()
					.map(store => [store.getName(), store])
					.sort((a, b) => a[0].localeCompare(b[0]))
					.map(([a, b]) => ({
						[a]: b }));
			}
			return stores;
		};
	})(),
	getZustanStores() {
		return Zustand.module.modulesUsingThisModule;
	}
};

const Misc = {
	getAllAssets() {
		return Modules.getModules(a => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/))
			.map(a => a.exports);
	},
	getEventListeners(eventName) {
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const subs = Dispatcher._subscriptions;
		return {
			stores: Object.values(nodes)
				.map(a => a.actionHandler[eventName] && a)
				.filter(Boolean),
			subs: [eventName, subs[eventName]]
		};
	},
	getEventListenersFuzzy(str = "") {
		str = str.toLowerCase();
		const nodes = Dispatcher._actionHandlers._dependencyGraph.nodes;
		const subs = Dispatcher._subscriptions;
		return {
			stores: Object.values(nodes).filter(a => Object.keys(a.actionHandler).some(key => key.toLowerCase().includes(str))),
			subs: Object.entries(subs)
				.filter(([key]) => key.toLowerCase().includes(str))
				.map(a => a)
		};
	},
	getGraph: (() => {
		let graph = null;
		return function getGraph(refresh = false) {
			if (graph === null || refresh) graph = Object.keys(Modules.getWebpackModules()).map(a => ({ id: a, modules: Modules.modulesImportedInModuleById(a) }));
			return graph;
		};
	})()
};

function init() {
	["Filters", "getModule", "getModules"].forEach(a => (window[a] = BdApi.Webpack[a]));
	window.getModuleAndKey = getModuleAndKey;

	window.s = Object.assign(id => Modules.moduleById(id), {
		Utils: {
			ErrorBoundary,
			...Utils
		},
		r: webpackRequire,
		...Misc,
		...Stores,
		...Sources,
		...Modules,
		DiscordModules: {
			Dispatcher,
			TheBigBoyBundle
		}
	});
}

class Devtools {
	start() {
		try {
			init();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		"s" in window && delete window.s;
	}
}

module.exports = Devtools;
