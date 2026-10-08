/**
 * @runAt idle
 * @name MessagePopover
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/MessagePopover
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/MessagePopover/MessagePopover.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "MessagePopover",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/MessagePopover/MessagePopover.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/MessagePopover",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"quickReactsAmount": 5,
		"showAll": true
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();

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

// common/React.jsx
var React2 = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React2;

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
var after = (...args) => patch("after", ...args);

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target2) => target2[type] && filter(target2[type]);
}

function findKey(obj, filter) {
	const key = getObjectKey(obj, filter);
	return key ? [obj, key] : [];
}

function getDeclarationAndKey(moduleFilter, declarationFilter, options = {}) {
	const module2 = getModule(moduleFilter, { ...options, raw: true });
	return findKey(module2.declarations, declarationFilter);
}

// common/Components/ErrorBoundary/index.jsx
var ErrorBoundary_default = (props) => /* @__PURE__ */ React_default.createElement(BdApi.Components.ErrorBoundary, { ...props, name: Config_default?.info?.name });

// src/MessagePopover/patches/allButtons.jsx
var $$ = getModule(Filters.bySource("__unsupportedReactNodeAsText", ".me", "onTooltipShow"), { declarationFilter: Filters.byStrings(".me") });
var useShiftKey = findKey(getModule(Filters.bySource(`addEventListener("mousemove"`, "delete", "size", "shiftKey")), () => true);
var MiniPopover = getDeclarationAndKey(BdApi.Webpack.Filters.bySource("reply-self", "mark-unread"), Filters.byStrings("isExpanded", "isModeratorReportChannel"));
var NP = getModule(Filters.bySource("reply-self", "mark-unread"), { declarationFilter: reactRefMemoFilter("type", "isEmojiFilteredOrLocked") });
Plugin_default.onStart(() => {
	after(...useShiftKey, () => true);
	after(...MiniPopover, ({ args: [props], ret }) => {
		ret.props.children.unshift(
			/* @__PURE__ */
			React_default.createElement(ErrorBoundary_default, null, /* @__PURE__ */ React_default.createElement(NP, { ...props }), /* @__PURE__ */ React_default.createElement($$, null))
		);
	});
});

// MODULES-AUTO-LOADER:@Stores/EmojiStore
var EmojiStore_default = /* @__PURE__ */ (() => getStore("EmojiStore"))();

// common/Discord/zustand.js
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

// src/MessagePopover/patches/moreReacts.js
var DisambiguatedEmojiContexPrototype = EmojiStore_default.getDisambiguatedEmojiContext()?.constructor.prototype;
Plugin_default.onStart(() => {
	after(DisambiguatedEmojiContexPrototype, "getFrequentlyUsedReactionEmojisWithoutFetchingLatest", ({ ret }) => {
		ret.filter = function() {
			const filtered = Array.prototype.filter.apply(this, arguments);
			filtered.slice = () => Array.prototype.slice.call(filtered, 0, Settings_default.state.quickReactsAmount);
			return filtered;
		};
		return ret;
	});
});

// MODULES-AUTO-LOADER:@Modules/Slider
var Slider_default = /* @__PURE__ */ (() => getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true }))();

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

// common/Components/SettingSlider/index.jsx
function SettingSlider({ setting, border, processValue = Math.round, label, description, ...props }) {
	const val = Settings_default(setting.get);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Slider_default, {
			...props,
			mini: true,
			label,
			description,
			initialValue: val,
			onValueChange: (e) => setting.set(processValue(e))
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, null));
}

// src/MessagePopover/index.js
var sizes = [0, 5, 10, 15, 20];
Plugin_default.getSettingsPanel = () => () => {
	return /* @__PURE__ */ React.createElement(
		SettingSlider, {
			setting: Settings_default.quickReactsAmount,
			label: "Amount of Quick Reacts",
			description: "Switching channels may be required to see changes.",
			stickToMarkers: true,
			sortedMarkers: true,
			equidistant: true,
			markers: sizes,
			minValue: sizes[0],
			maxValue: sizes[sizes.length - 1],
			onValueRender: Math.round
		}
	);
};
module.exports = () => Plugin_default;
