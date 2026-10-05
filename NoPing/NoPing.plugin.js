/**
 * @runAt idle
 * @name NoPing
 * @description Let's you pick who not to ping
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/NoPing
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/NoPing/NoPing.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "NoPing",
		"version": "1.0.0",
		"description": "Let's you pick who not to ping",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/NoPing/NoPing.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/NoPing",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"silent": false,
		"mentionToggle": false
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var ContextMenu = /* @__PURE__ */ (() => Api.ContextMenu)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();
var findInTree = /* @__PURE__ */ (() => BdApi.Utils.findInTree)();

// src/NoPing/blacklist.js
var blacklist_default = new class extends Set {
	commit() {
		Data.save("blacklist", Array.from(this));
	}
	add(...args) {
		super.add.apply(this, args);
		this.commit();
	}
	delete(...args) {
		super.delete.apply(this, args);
		this.commit();
	}
	toggle(id) {
		if (this.has(id)) this.delete(id);
		else this.add(id);
	}
}(Data.load("blacklist") || []);

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
var contextmenu_default = ContextMenu;

// src/NoPing/patches/patchContextMenus.js
Plugin_default.onStart(() => {
	patch("user-context", (retVal, { user }) => {
		if (!user.id) return;
		retVal.props.children.splice(
			1,
			0,
			contextmenu_default.buildItem({
				type: "toggle",
				label: "Never ping",
				active: blacklist_default.has(user.id),
				action: () => blacklist_default.toggle(user.id)
			})
		);
	});
});

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

function patch2(type, object, key, callback) {
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
var after = (...args) => patch2("after", ...args);
var before = (...args) => patch2("before", ...args);

// common/React.jsx
var useState = /* @__PURE__ */ (() => BdApi.React.useState)();
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = React;

// common/Webpack.jsx
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();

function findKey(obj, filter) {
	const key = getObjectKey(obj, filter);
	return key ? [obj, key] : [];
}

function getModuleAndKey(filter, options) {
	const { exports: exports2 } = getModule(filter, { ...options, raw: true }) || {};
	return findKey(exports2, filter);
}

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

// src/NoPing/patches/patchCreatePendingReply.js
var ReplyFunctions = getModuleAndKey(Filters.byStrings("CREATE_PENDING_REPLY", "dispatch"), { searchExports: true });
Plugin_default.onStart(() => {
	before(...ReplyFunctions, ({ args: [props] }) => {
		if (blacklist_default.has(props.message.author.id)) props.shouldMention = false;
		if (Settings_default.state.mentionToggle) props.showMentionToggle = true;
	});
});

// MODULES-AUTO-LOADER:@Modules/MessageActions
var MessageActions_default = /* @__PURE__ */ (() => getModule(Filters.byKeys("jumpToMessage", "_sendMessage"), { searchExports: false }))();

// src/NoPing/patches/patchSendMessage.js
Plugin_default.onStart(() => {
	before(MessageActions_default, "_sendMessage", ({ args }) => {
		if (!Settings_default.state.silent) return;
		const shouldSilent = args[1].content.matchAll(/<@(\d+)>/gi).some((match) => blacklist_default.has(match[1]));
		if (!shouldSilent) return;
		args[2].flags = 4096;
	});
});

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

// MODULES-AUTO-LOADER:@Modules/Heading
var Heading_default = /* @__PURE__ */ (() => getModule((a) => a?.render?.toString().includes("data-excessive-heading-level"), { searchExports: true }))();

// src/NoPing/components/PingToggle.jsx
function PingToggle({ userId }) {
	const [has, setHas] = useState(blacklist_default.has(userId));
	const toggleHandler = () => {
		blacklist_default.toggle(userId);
		setHas(!has);
	};
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Heading_default, {
			style: {
				padding: "8px 12px"
			},
			onClick: toggleHandler,
			variant: "text-sm/bold",
			color: has ? "text-link" : "text-muted"
		},
		"Always OFF ?"
	), /* @__PURE__ */ React_default.createElement(
		Divider, {
			gap: 0,
			gutter: 4,
			direction: Divider.direction.VERTICAL
		}
	));
}

// src/NoPing/patches/replayComponent.jsx
var Module = getMangled("showMentionToggle", { replayComponent: (a) => true });
Plugin_default.onStart(() => {
	after(Module, "replayComponent", ({ args: [{ reply }], ret }) => {
		const target2 = findInTree(ret, (a) => a?.className?.includes("actions"), { walkable: ["children", "props"] });
		if (!target2 || !reply?.message?.author?.id) return ret;
		target2.children.splice(0, 0, /* @__PURE__ */ React_default.createElement(PingToggle, { userId: reply.message.author.id }));
	});
});

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

// src/NoPing/components/SettingComponent.jsx
var SettingComponent_default = () => {
	return /* @__PURE__ */ React_default.createElement(FieldSet, { contentGap: 8 }, [{
			setting: Settings_default.silent,
			description: "Prepend @silent",
			note: "Insert @silent tag in messages containing mentions of users marked as never ping. @silent prevent messages containing mentions from pinging users"
		},
		{
			setting: Settings_default.mentionToggle,
			description: "Always show mention toggle",
			note: "The mention toggle is usually hidden in DMs and probably other places."
		}
	].map(SettingSwtich));
};

// src/NoPing/index.jsx
Plugin_default.getSettingsPanel = () => /* @__PURE__ */ React_default.createElement(SettingComponent_default, null);
module.exports = () => Plugin_default;
