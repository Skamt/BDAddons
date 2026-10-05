/**
 * @runAt idle
 * @name Devtools
 * @description Helpful devtools for discord modules
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Devtools
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Devtools/Devtools.plugin.js
 */

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target2, all) => {
	for (var name2 in all)
		__defProp(target2, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames(from))
			if (!__hasOwnProp.call(to, key) && key !== except)
				__defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
	}
	return to;
};
var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
	// If the importer is in node compatibility mode or this is not an ESM
	// file that has been converted to a CommonJS file using a Babel-
	// compatible transform (i.e. "__esModule" has not been set), then set
	// "default" to the CommonJS "module.exports" for node compatibility.
	isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
	mod
));

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
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var UI = /* @__PURE__ */ (() => BdApi.UI)();
var findInTree = /* @__PURE__ */ (() => BdApi.Utils.findInTree)();
var getInternalInstance = /* @__PURE__ */ (() => BdApi.ReactUtils.getInternalInstance.bind(BdApi.ReactUtils))();

// common/React.jsx
var ReactDOM = /* @__PURE__ */ (() => BdApi.ReactDOM)();
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;
var NoopComponent = () => null;
var LazyComponent = (get) => {
	const Comp = (props) => {
		const Component = get() ?? NoopComponent;
		return /* @__PURE__ */ React.createElement(Component, { ...props });
	};
	return Comp;
};

// common/Utils/Object.js
function getObjectKey(object = {}, filter) {
	for (const key in object)
		if (filter(object[key])) return key;
}

// common/Webpack.jsx
var Webpack_exports = {};
__export(Webpack_exports, {
	Filters: () => Filters,
	Webpack: () => Webpack,
	_waitForComponent: () => _waitForComponent,
	filterModuleAndExport: () => filterModuleAndExport,
	findKey: () => findKey,
	getById: () => getById,
	getByKeys: () => getByKeys,
	getByPrototypeKeys: () => getByPrototypeKeys,
	getBySource: () => getBySource,
	getDeclarationAndKey: () => getDeclarationAndKey,
	getMangled: () => getMangled,
	getModule: () => getModule,
	getModuleAndKey: () => getModuleAndKey,
	getStore: () => getStore,
	lazy: () => lazy,
	modules: () => modules,
	reactRefMemoFilter: () => reactRefMemoFilter,
	waitForComponent: () => waitForComponent,
	waitForModule: () => waitForModule
});

// common/Utils/Logger.js
var Logger_default = Logger;

// common/consts.js
var UNDEFINED_OBJECT_OR_KEY = "Undefined object or key";
var PATCH_ERROR = "Could not perform a patch";
var MISSING_ARGUMENTS = "Missing arguments";
var LAZY_DISCORD_COMPONENT_WRAPPER = "LazyDiscordComponentWrapper";

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

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var modules = /* @__PURE__ */ (() => Webpack.modules)();
var getBySource = /* @__PURE__ */ (() => Webpack.getBySource)();
var getByPrototypeKeys = /* @__PURE__ */ (() => Webpack.getByPrototypeKeys)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getById = /* @__PURE__ */ (() => Webpack.getById)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();
var getByKeys = /* @__PURE__ */ (() => Webpack.getByKeys)();
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
	}).catch((cause) => Logger_default.warn(new Error(PATCH_ERROR, { cause })));
	return promise;
}

function Suspended({ promise, fallback, ...props }) {
	const comp = React_default.use(promise);
	if (comp) return React_default.createElement(comp, props);
	return fallback;
}

function waitForComponent(filter, options, Fallback = NoopComponent) {
	const promise = waitForModule(filter, options);
	const placeHolderComponent = (props) => /* @__PURE__ */ React_default.createElement(React_default.Suspense, { fallback: /* @__PURE__ */ React_default.createElement(Fallback, null) }, /* @__PURE__ */ React_default.createElement(
		Suspended, {
			...props,
			fallback: /* @__PURE__ */ React_default.createElement(Fallback, null),
			promise
		}
	));
	placeHolderComponent.displayName = LAZY_DISCORD_COMPONENT_WRAPPER;
	return placeHolderComponent;
}

function _waitForComponent(filter, options) {
	let myValue = () => {};
	const lazyComponent = LazyComponent(() => myValue);
	waitForModule(filter, options).then((v) => {
		myValue = v;
		Object.assign(lazyComponent, v);
	});
	return lazyComponent;
}

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target2) => target2[type] && filter(target2[type]);
}

function findKey(obj, filter) {
	const key = getObjectKey(obj, filter);
	return key ? [obj, key] : [];
}

function getModuleAndKey(filter, options) {
	const { exports: exports2 } = getModule(filter, { ...options, raw: true }) || {};
	return findKey(exports2, filter);
}

function getDeclarationAndKey(moduleFilter, declarationFilter, options = {}) {
	const module2 = getModule(moduleFilter, { ...options, raw: true });
	return findKey(module2.declarations, declarationFilter);
}

function filterModuleAndExport(moduleFilter, exportFilter, options) {
	const module2 = getModule(moduleFilter, { ...options, raw: true });
	if (!module2) return;
	const { exports: exports2 } = module2;
	const key = Object.keys(exports2).find((k) => exportFilter(exports2[k]));
	if (!key) return {};
	return { module: exports2, key, target: exports2[key] };
}

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
	getPathName: () => getPathName,
	hook: () => hook,
	isSnowflake: () => isSnowflake,
	memoize: () => memoize,
	nop: () => nop,
	openLink: () => openLink,
	parseSnowflake: () => parseSnowflake,
	prettyfiyBytes: () => prettyfiyBytes,
	preventDefault: () => preventDefault,
	promiseHandler: () => promiseHandler,
	random: () => random,
	shallow: () => shallow,
	sleep: () => sleep
});
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

function clsx(prefix) {
	return (...args) => args.filter(Boolean).map((a) => `${prefix}-${a}`).join(" ");
}
var getPathName = (url) => {
	try {
		return new URL(url).pathname;
	} catch {}
};

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
	root.render(React_default.createElement(() => (v = hook2(...args), null)));
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

function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function preventDefault(handler = nop) {
	return (e) => {
		e.preventDefault();
		e.stopPropagation();
		handler.apply(null, [e]);
	};
}
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

// common/Patcher/contextmenu.js
var contextmenuUnPatches = [];
Plugin_default.onStop(() => {
	contextmenuUnPatches.filter(Boolean).forEach((a) => a());
	contextmenuUnPatches = [];
});
var patch = (id, callback) => {
	const undo = ContextMenu.patch(id, callback);
	contextmenuUnPatches.push(undo);
};

// src/Devtools/patches/contextmenus.js
Plugin_default.onStart(() => {
	patch("*", (ret) => {
		const target2 = findInTree(ret, (a) => a.navId, { walkable: ["children", "props"] });
		if (!target2) return console.error("ContextmenusNavId", ret);
		const MenuItem = BdApi.ContextMenu.buildItem({
			label: target2.navId,
			action() {
				copy(target2.navId);
			}
		});
		if (Array.isArray(target2.children)) target2.children.push(MenuItem);
		else target2.children = [target2.children, MenuItem];
	});
});

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary_default = (props) => /* @__PURE__ */ React_default.createElement(BdApi.Components.ErrorBoundary, { ...props, name: Config_default?.info?.name });

// MODULES-AUTO-LOADER:@Modules/all
var all_default = {
	ChannelTypeEnum: getModule(Filters.byKeys("GUILD_TEXT", "DM"), { searchExports: true }),
	ProfileTypeEnum: getModule(Filters.byKeys("POPOUT", "SETTINGS"), { searchExports: true }),
	StickerTypeEnum: getModule(Filters.byKeys("GUILD", "STANDARD"), { searchExports: true }),
	DiscordPermissionsEnum: getModule(Filters.byKeys("ADD_REACTIONS"), { searchExports: true }),
	EmojiIntentionEnum: getModule(Filters.byKeys("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true }),
	EmojiSendAvailabilityEnum: getModule(Filters.byKeys("GUILD_SUBSCRIPTION_UNAVAILABLE"), { searchExports: true }),
	GuildFeaturesEnum: getModule(Filters.byKeys("CLYDE_ENABLED"), { searchExports: true }),
	TheBigBoyBundle: getModule(Filters.byKeys("openModal", "FormSwitch", "Anchor"), { searchExports: false }),
	RenderLinkComponent: getModule((m) => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false }),
	ModalSize: getModule(Filters.byKeys("DYNAMIC", "SMALL", "LARGE"), { searchExports: true }),
	ModalRoot: getModule(Filters.byStrings("rootWithShadow", "MODAL"), { searchExports: true }),
	ModalCarousel: getModule(Filters.byPrototypeKeys("navigateTo", "preloadImage"), { searchExports: false }),
	ImageModal: getModule(Filters.byStrings("renderLinkComponent", "zoomThumbnailPlaceholder"), { searchExports: true }),
	Dispatcher: getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true }),
	Color: getModule(Filters.byKeys("Color", "hex", "hsl"), { searchExports: false }),
	ChannelActions: getModule(Filters.byKeys("actions", "fetchMessages"), { searchExports: true }),
	ChannelComponent: getModule(Filters.byStrings("hasActiveThreads", "channelTypeOverride"), { searchExports: true }),
	ChannelContent: getModule((m) => m.type && m.type.toString?.().includes("messageGroupSpacing"), { searchExports: false }),
	CreateChannel: getModule((m) => m.createChannel, { searchExports: false }),
	MessageActions: getModule(Filters.byKeys("jumpToMessage", "_sendMessage"), { searchExports: false }),
	ExpressionPickerInspector: getModule(Filters.byStrings("graphicPrimary", "titlePrimary"), { searchExports: false }),
	CloseExpressionPicker: getModule(Filters.byStrings("activeView:null,activeViewType:null"), { searchExports: true }),
	StickerSendability: getModule(Filters.byKeys("StickerSendability", "getStickerSendability"), { searchExports: false }),
	DiscordPermissions: getModule(Filters.byKeys("computePermissions"), { searchExports: false }),
	StickerModule: getModule(Filters.byStrings("sticker", "withLoadingIndicator"), { searchExports: false }),
	ChannelSettings: getModule(Filters.byKeys("updateChannelOverrideSettings"), { searchExports: false }),
	GuildTooltip: getModule(Filters.byStrings("includeActivity", "listItemTooltip"), { searchExports: false }),
	DiscordUtils: getModule(Filters.byKeys("getDiscordUtils"), { searchExports: false }),
	Analytics: getModule(Filters.byKeys("AnalyticEventConfigs"), { searchExports: false }),
	MessageHeader: getModule(Filters.byStrings("userOverride", "withMentionPrefix"), { searchExports: false }),
	EmojiFunctions: getModule(Filters.byKeys("getEmojiUnavailableReason"), { searchExports: true }),
	MentionComponent: getModule(Filters.byStrings("backgroundColor", "color", "interactive", "wrapper"), { searchExports: false }),
	FetchUser: getModule(Filters.byStrings("USER_UPDATE", "default.getUser", "oldFormErrors"), { searchExports: true }),
	ChannelLink: getModule((m) => m && m.render && Filters.byStrings("ENTER", "SPACE", "charCode")(m.render), { searchExports: false }),
	EmbedComponent: getModule((m) => m.prototype.getSpoilerStyles, { searchExports: false }),
	RefreshToken: getModule(Filters.byStrings("CONNECTION_ACCESS_TOKEN"), { searchExports: true }),
	TimeBar: getModule((a) => a.prototype.render && a.defaultProps.themed === false, { searchExports: false }),
	useStateFromStores: getModule(Filters.byStrings("getStateFromStores"), { searchExports: true }),
	TreadComponent: getModule((a) => a?.type?.toString().includes("GUILD_CHANNEL_LIST"), { searchExports: false }),
	zustand: getModule(Filters.byStrings("useStore, api"), { searchExports: false }),
	openModal: getModule(Filters.byStrings("onCloseCallback", "onCloseRequest", "modalKey", "backdropStyle"), { searchExports: true }),
	Tooltip: getModule(Filters.byPrototypeKeys("renderTooltip"), { searchExports: true }),
	Popout: getModule(Filters.byPrototypeKeys("shouldShowPopout", "toggleShow"), { searchExports: true }),
	Heading: getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true }),
	Button: getModule((a) => a && a.Link && a.Colors, { searchExports: true }),
	FormSwitch: getModule(Filters.byStrings("note", "tooltipNote"), { searchExports: true }),
	Spinner: getModule((a) => a?.Type?.CHASING_DOTS, { searchExports: true }),
	Slider: getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true }),
	FormText: getModule((a) => a?.Types?.LABEL_DESCRIPTOR, { searchExports: true }),
	RadioGroup: getModule((a) => a?.Sizes?.NOT_SET === "", { searchExports: true }),
	Anchor: getModule(Filters.byKeys("Anchor"), { searchExports: true })
};

// common/DiscordModules/Modules.js
var Modules_exports = {};
__export(Modules_exports, {
	Anchor: () => Anchor,
	ChannelComponent: () => ChannelComponent,
	ChannelUtils: () => ChannelUtils,
	Color: () => Color,
	ComponentDispatch: () => ComponentDispatch,
	DiscordApi: () => DiscordApi,
	DiscordPopout: () => DiscordPopout,
	Dispatcher: () => Dispatcher,
	DragSource: () => DragSource,
	DropTarget: () => DropTarget,
	FieldWrapper: () => FieldWrapper,
	FocusLock: () => FocusLock,
	GroupDmAvatar: () => GroupDmAvatar,
	I18n: () => I18n,
	IconsUtils: () => IconsUtils,
	Markdown: () => Markdown,
	MediaViewerModal: () => MediaViewerModal,
	MessageHeader: () => MessageHeader,
	RadioGroup: () => RadioGroup,
	SearchableSelect: () => SearchableSelect,
	Spinner: () => Spinner,
	UserProfileActions: () => UserProfileActions,
	transitionTo: () => transitionTo,
	useDrag: () => useDrag,
	useDrop: () => useDrop
});
var ComponentDispatch = /* @__PURE__ */ (() => {
	waitForModule((m) => m.dispatchToLastSubscribed, { searchExports: true }).then((a) => {
		ComponentDispatch = a;
	});
})();
var FocusLock = /* @__PURE__ */ (() => getModule(Filters.byStrings(".containerRef,{disableReturn"), { searchExports: true }))();
var Spinner = /* @__PURE__ */ (() => getModule((a) => a?.Type?.CHASING_DOTS, { searchExports: true }))();
var Color = /* @__PURE__ */ (() => getModule(Filters.byKeys("Color", "hex", "hsl"), { searchExports: false }))();
var SearchableSelect = /* @__PURE__ */ (() => getMangled(`"multiple":"single",required:`, { SearchableSelect: Filters.byStrings(`"multiple":"single",required:`) }).SearchableSelect)();
var I18n = /* @__PURE__ */ (() => getByKeys("intl", "t"))();
var DiscordPopout = /* @__PURE__ */ (() => getModule((a) => a?.prototype?.render && a.Animation, { searchExports: true }))();
var DiscordApi = /* @__PURE__ */ (() => getMangled("HTTPUtils", { api: Filters.byKeys("get", "del", "patch", "put") }))();
var Dispatcher = /* @__PURE__ */ (() => getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true }))();
var Markdown = /* @__PURE__ */ (() => getModule(Filters.byKeys("parseEmbedTitle", "defaultRules")))();
var Anchor = /* @__PURE__ */ (() => getModule(Filters.byKeys("Anchor")).Anchor)();
var UserProfileActions = /* @__PURE__ */ (() => getByKeys("openUserProfileModal", "closeUserProfileModal"))();
var transitionTo = /* @__PURE__ */ (() => getModule(Filters.byStrings("transitionTo - Transitioning to"), { searchExports: true }))();
var GroupDmAvatar = /* @__PURE__ */ (() => getModule(reactRefMemoFilter("type", "channel", "recipients", "isTyping", "status"), { searchExports: true }))();
var DragSource = /* @__PURE__ */ (() => getModule(Filters.byStrings("drag-source", "collect"), { searchExports: true }))();
var DropTarget = /* @__PURE__ */ (() => getModule(Filters.byStrings("drop-target", "collect"), { searchExports: true }))();
var useDrag = /* @__PURE__ */ (() => getModule(Filters.byStrings("useDrag::"), { searchExports: true }))();
var useDrop = /* @__PURE__ */ (() => getModule(Filters.byStrings(".options);return(0,"), { searchExports: true }))();
var FieldWrapper = /* @__PURE__ */ (() => getModule(reactRefMemoFilter("render", "fieldWrapper", "title", "titleId"), { searchExports: true }))();
var IconsUtils = /* @__PURE__ */ (() => getModule((a) => a.getChannelIconURL))();
var ChannelUtils = /* @__PURE__ */ (() => getModule((m) => m.openPrivateChannel))();
var RadioGroup = /* @__PURE__ */ (() => getMangled('data-toggleable-component":"radiogroup', { radioGroup: Filters.byStrings("label", "required") }).radioGroup)();
var MediaViewerModal = /* @__PURE__ */ (() => getMangled("Media Viewer Modal", { MediaViewerModal: (a) => typeof a !== "string" }).MediaViewerModal)();
var ChannelComponent = () => getModule(reactRefMemoFilter("render", "hasActiveThreads"), { searchExports: true });
var MessageHeader = /* @__PURE__ */ (() => lazy(Filters.byStrings("userOverride", "withMentionPrefix"), { searchExports: false }))();

// common/Utils/Notification.js
function showNotification(title, content, options) {
	UI.showNotification({
		id: `${Config_default.info.name}-${Math.random().toString(36).slice(2)}`,
		title: title ? `[${Config_default.info.name}] ${title}` : Config_default.info.name,
		content,
		duration: Number.POSITIVE_INFINITY,
		...options
	});
}
var Notification_default = {
	success(title, content, options) {
		showNotification(title, content, { type: "success", ...options });
	},
	info(title, content, options) {
		showNotification(title, content, { type: "info", ...options });
	},
	warning(title, content, options) {
		showNotification(title, content, { type: "warning", ...options });
	},
	error(title, content, options) {
		showNotification(title, content, { type: "error", ...options });
	}
};

// src/Devtools/utils.js
var utils_exports = {};
__export(utils_exports, {
	d: () => d,
	dispatcherEventInterceptor: () => dispatcherEventInterceptor,
	getFiber: () => getFiber,
	walkFiber: () => walkFiber
});

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true }))();

// src/Devtools/utils.js
function walkFiber(filter = (a) => a, depth, el) {
	el ??= $0;
	depth = depth < 1 || !depth ? 1 : depth;
	let fiber = getInternalInstance(el);
	if (!fiber) return console.error("Can't find fiber");
	let res = [];
	while (fiber) {
		let match;
		try {
			if (filter(fiber)) match = fiber;
		} catch {}
		if (match) {
			if (depth === 1) return match;
			res.push(match);
			if (res.length === depth) return res;
		}
		fiber = fiber.return;
	}
	return res;
}

function getFiber() {
	return getInternalInstance($0);
}

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

	function getElement(target2) {
		if (typeof target2 === "string" && isValidCSSSelector(target2)) return document.querySelector(target2);
		if (target2 instanceof HTMLElement) return target2;
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

	function getCssRulesForElement(target2, noCache) {
		const el = getElement(target2);
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

// src/Devtools/webpack/webpackRequire.js
var chunkName = Object.keys(window).find((key) => key.startsWith("webpackChunk"));
var chunk = window[chunkName];
var webpackreq;
chunk.push([
	[ /* @__PURE__ */ Symbol()], {}, (r) => webpackreq = r.b ? r : webpackreq
]);
chunk.pop();
var webpackRequire_default = webpackreq;

// common/Utils/fs.js
var import_fs = __toESM(require("fs"));

function saveFile(path, content) {
	import_fs.default.writeFileSync(path, content, "utf8");
}

function mkdir(path) {
	if (!import_fs.default.existsSync(path)) import_fs.default.mkdirSync(path);
}

// src/Devtools/webpack/Modules.js
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
	get code() {
		return this.loader.toString().replace(/^\d+/, "function");
	}
	get imports() {
		return Modules.modulesImportedInModuleById(this.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}
	get modulesUsingThisModule() {
		return Modules.modulesImportingModuleById(this.id).reduce((acc, id) => defineModuleGetter(acc, id), {});
	}
	get saveSourceToDesktop() {
		try {
			const path = `${process.env.USERPROFILE}\\Desktop\\${this.id}.js`;
			saveFile(path, this.code);
			return `Saved to: ${path}`;
		} catch (e) {
			return e;
		}
	}
	get saveAllToDesktop() {
		try {
			const path = `${process.env.USERPROFILE}\\Desktop\\${this.id}`;
			saveFile(`${path}\\__MAIN-${this.id}.js`, this.code);
			mkdir(`${path}\\modulesUsingThisModule`);
			mkdir(`${path}\\imports`);
			{
				const modules2 = Object.entries(this.modulesUsingThisModule);
				for (let i = modules2.length - 1; i >= 0; i--) {
					const [id, module2] = modules2[i];
					const code = module2.code;
					saveFile(`${path}\\modulesUsingThisModule\\${id}.js`, code);
				}
			} {
				const modules2 = Object.entries(this.imports);
				for (let i = modules2.length - 1; i >= 0; i--) {
					const [id, module2] = modules2[i];
					const code = module2.code;
					saveFile(`${path}\\imports\\${id}.js`, code);
				}
			}
			return `Saved to: ${path}`;
		} catch (e) {
			return e;
		}
	}
};

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

function modulesImportingModuleById(id) {
	return Object.keys(Sources.getWebpackSources()).filter((sourceId) => modulesImportedInModuleById(sourceId).includes(`${id}`));
}

function noExports(filter, module2, exports2) {
	if (filter(exports2, module2, module2.id)) return new Module(module2.id, module2);
}

function doExports(filter, module2, exports2) {
	if (typeof exports2 !== "object" && typeof exports2 !== "function") return;
	for (const entryKey in exports2) {
		let target2;
		try {
			target2 = exports2[entryKey];
		} catch {
			continue;
		}
		if (sanitizeExports(target2)) continue;
		if (filter(target2, module2, module2.id)) return { target: target2, entryKey, module: new Module(module2.id, module2) };
	}
}

function sanitizeExports(exports2) {
	if (!exports2) return true;
	if (exports2 === Symbol) return true;
	if (exports2.TypedArray) return true;
	if (exports2 === window) return true;
	if (exports2 instanceof Window) return true;
	if (exports2 === document.documentElement) return true;
	if (exports2[Symbol.toStringTag] === "DOMTokenList") return true;
	return false;
}

function* moduleLookup(filter, options = {}) {
	const { searchExports = false } = options;
	const gauntlet = searchExports ? doExports : noExports;
	const keys = Object.keys(webpackRequire_default.c);
	for (let index = keys.length - 1; index >= 0; index--) {
		const module2 = webpackRequire_default.c[keys[index]];
		const { exports: exports2 } = module2;
		if (sanitizeExports(exports2)) continue;
		const match = gauntlet(filter, module2, exports2);
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
	modulesImportedInModuleById,
	modulesImportingModuleById,
	getModules,
	getModule: getModule2
};

// src/Devtools/webpack/Sources.js
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
			const path = `${process.env.USERPROFILE}\\Desktop\\${this.id}.js`;
			saveFile(path, this.code);
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
	for (const [id, source] of Object.entries(webpackRequire_default.m)) {
		const sourceCode = source.toString().replace(/^\d+/, "function");
		const result = strArr.every((str) => sourceCode.includes(str));
		if (!result) continue;
		yield new Source(id, source);
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

function getSourceByFunc(func) {
	return getSources(String(func));
}
var Sources = {
	getWebpackSources: () => webpackRequire_default.m,
	sourceById,
	getSource,
	getSources,
	getSourceByFunc
};

// src/Devtools/webpack/Decs.js
var Dec = class {
	constructor(mod, dec, key) {
		this.mod = mod;
		this.id = mod.id;
		this.dec = dec;
		this.key = key;
		this.decs = mod.declarations;
	}
};

function* decLookup(decFilter, ...args) {
	const strArr = args;
	for (const [id, source] of Object.entries(webpackRequire_default.m)) {
		const sourceCode = source.toString().replace(/^\d+/, "function");
		const result = strArr.every((str) => sourceCode.includes(str));
		if (!result) continue;
		const mod = webpackRequire_default.c[id];
		if (!mod || !mod.declarations) continue;
		const keys = Object.keys(mod.declarations);
		for (let i = keys.length - 1; i >= 0; i--) {
			const dec = mod.declarations[keys[i]];
			if (decFilter(dec)) yield new Dec(mod, dec, keys[i]);
		}
	}
}

function getDecs(...args) {
	return [...decLookup(...args)];
}

function getDec(...args) {
	const b = decLookup(...args);
	const res = b.next().value;
	b.return();
	return res;
}
var Decs = {
	getDec,
	getDecs
};

// src/Devtools/webpack/Stores.js
var Store = class {
	constructor(store) {
		this.store = store;
		this.module = Sources.getSourceByFunc(store.constructor)?.[0].module;
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
	get events() {
		return Stores.getStoreListeners(this.name);
	}
};
var FluxStore = Modules.getModule((a) => a.Store, { searchExports: true })?.target.Store;
var stores = FluxStore.getAll();
var Stores = {
	getStore(storeName) {
		const module2 = stores.find((a) => a.getName() === storeName);
		if (!module2) return void 0;
		return new Store(module2);
	},
	getStoreFuzzy(str = "") {
		return stores.filter((a) => a.getName().toLowerCase().includes(str)).map((store) => new Store(store));
	},
	getStoreListeners(storeName) {
		const nodes = Dispatcher_default._actionHandlers._dependencyGraph.nodes;
		const storeHandlers = Object.values(nodes).filter(({ name: name2 }) => name2 === storeName);
		return {
			get store() {
				return Stores.getStore(storeName);
			},
			events: storeHandlers[0]
		};
	},
	getSortedStores: /* @__PURE__ */ (() => {
		let stores2 = null;
		return function getSortedStores(force) {
			if (!stores2 || force) {
				stores2 = Modules.getModule((a) => a?.Store, { searchExports: true }).target.Store.getAll().map((store) => [store.getName(), store]).sort((a, b) => a[0].localeCompare(b[0])).map(([a, b]) => ({
					[a]: b }));
			}
			return stores2;
		};
	})(),
	getZustanStores() {
		const stores2 = Decs.getDecs((dec) => dec && typeof dec === "function" && dec.getState && dec.setState && dec.getInitialState);
		return Object.values(stores2).map((val) => {
			const state = val.dec.getState();
			return Object.assign({}, state, {
				get _mod() {
					return val;
				}
			});
		});
	}
};

// src/Devtools/webpack/Misc.js
var Misc = {
	getAllAssets() {
		return Modules.getModules((a) => typeof a.exports === "string" && a.exports.match(/\/assets\/.+/)).map((a) => a.exports);
	},
	getEventListeners(eventName) {
		const nodes = Dispatcher_default._actionHandlers._dependencyGraph.nodes;
		const subs = Dispatcher_default._subscriptions;
		return {
			stores: Object.values(nodes).map(
				(a) => a.actionHandler[eventName] && Object.assign({
						get store() {
							return Stores.getStore(a.name);
						}
					},
					a
				)
			).filter(Boolean),
			subs: [eventName, subs[eventName]]
		};
	},
	getEventListenersFuzzy(str = "") {
		str = str.toLowerCase();
		const nodes = Dispatcher_default._actionHandlers._dependencyGraph.nodes;
		const subs = Dispatcher_default._subscriptions;
		return {
			stores: Object.values(nodes).filter((a) => Object.keys(a.actionHandler).some((key) => key.toLowerCase().includes(str))).map(
				(a) => Object.assign({
						get store() {
							return Stores.getStore(a.name);
						}
					},
					a
				)
			),
			subs: Object.entries(subs).filter(([key]) => key.toLowerCase().includes(str)).map((a) => a)
		};
	},
	getGraph: /* @__PURE__ */ (() => {
		let graph = null;
		return function getGraph(refresh = false) {
			if (graph === null || refresh) graph = Object.keys(Modules.getCache()).map((a) => ({ id: a, modules: Modules.modulesImportedInModuleById(a) }));
			return graph;
		};
	})()
};

// src/Devtools/webpack/index.js
function s(a, ...args) {
	if (typeof a === "function") return Sources.getSourceByFunc(a);
	if (Number.isInteger(+a)) return Modules.moduleById(a);
	if (typeof a === "string" && a.endsWith("Store")) return Stores.getStore(name);
	return Sources.getSources(a, ...args);
}
var webpack_default = Object.assign(s, {
	r: webpackRequire_default,
	...Misc,
	...Stores,
	...Sources,
	...Decs,
	...Modules
});

// src/Devtools/index.jsx
if (console.context) console = console.context();

function init() {
	window.s = Object.assign(webpack_default, {
		Notification: Notification_default,
		Utils: {
			ErrorBoundary: ErrorBoundary_default,
			...Utils_exports,
			...utils_exports
		},
		Webpack: Webpack_exports,
		DiscordModules: { DiscordModules: all_default, modules: Modules_exports }
	});
}
Plugin_default.onStart(() => {
	init();
});
Plugin_default.onStop(() => {
	"s" in window && delete window.s;
});
module.exports = () => Plugin_default;
