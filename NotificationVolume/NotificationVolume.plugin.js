/**
 * @runAt idle
 * @name NotificationVolume
 * @description Save your ears and set a separate volume for notifications and in-app sounds
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/NotificationVolume
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/NotificationVolume/NotificationVolume.plugin.js
 * @credit https://github.com/Vendicated/Vencord/tree/main/src/plugins/notificationVolume
 */

// common/React.jsx
var React = /* @__PURE__ */ (() => BdApi.React)();
var React_default = /* @__PURE__ */ (() => React)();

// config:@Config
var Config_default = {
	"info": {
		"name": "NotificationVolume",
		"version": "1.0.0",
		"description": "Save your ears and set a separate volume for notifications and in-app sounds",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/NotificationVolume/NotificationVolume.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/NotificationVolume",
		"credit": "https://github.com/Vendicated/Vencord/tree/main/src/plugins/notificationVolume",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"notificationVolume": 100
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();

// common/DiscordModules/zustand.js
var { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});
var subscribeWithSelector = getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), { searchExports: true });

function create(initialState) {
	const Store = zustand(initialState);
	Object.defineProperty(Store, "state", {
		configurable: false,
		get: () => Store.getState()
	});
	return Store;
}

// common/Utils/Settings.js
var SettingsStore = create(subscribeWithSelector(() => Object.assign(Config_default.settings, Data.load("settings") || {})));
((state) => {
	const selectors = {};
	const actions = {};
	for (const [key, value] of Object.entries(state)) {
		actions[`set${key}`] = (newValue) => SettingsStore.setState({
			[key]: newValue });
		selectors[key] = (state2) => state2[key];
	}
	Object.defineProperty(SettingsStore, "selectors", { value: Object.assign(selectors) });
	Object.assign(SettingsStore, actions);
})(SettingsStore.getInitialState());
SettingsStore.subscribe(
	(state) => state,
	() => Data.save("settings", SettingsStore.state)
);
Object.assign(SettingsStore, {
	useSetting: (key) => {
		const val = SettingsStore((state) => state[key]);
		return [val, SettingsStore[`set${key}`]];
	}
});
var Settings_default = SettingsStore;

// MODULES-AUTO-LOADER:@Modules/Slider
var Slider_default = getModule(Filters.byPrototypeKeys("renderMark"), { searchExports: true });

// src/NotificationVolume/index.jsx
var WebAudioSound = getModule((a) => a.WebAudioSound)?.WebAudioSound;

function SettingComponent() {
	const [val, set] = Settings_default.useSetting("notificationVolume");
	return /* @__PURE__ */ React_default.createElement(
		Slider_default, {
			label: "Notification volume",
			stickToMarkers: false,
			sortedMarkers: true,
			equidistant: true,
			markers: [0, 25, 50, 75, 100],
			initialValue: val,
			onValueChange: (e) => set(e)
		}
	);
}
module.exports = () => ({
	start() {
		if (!WebAudioSound) return Logger.patchError("WebAudioSound");
		Patcher.after(
			WebAudioSound.prototype,
			"ensureAudio",
			(_, __, ret) => {
				ret.then((audio) => {
					audio.volume *= Settings_default.state.notificationVolume / 100;
				});
			}
		);
	},
	stop: () => Patcher.unpatchAll(),
	getSettingsPanel: () => /* @__PURE__ */ React_default.createElement(SettingComponent, null)
});
