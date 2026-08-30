/**
 * @runAt idle
 * @name NoF1
 * @description Disables F1 help bind
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/NoF1
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/NoF1/NoF1.plugin.js
 */

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getByKeys = /* @__PURE__ */ (() => Webpack.getByKeys)();

// src/NoF1/index.js
var KeyBindManager = getByKeys("setLayout", "enable");
var KeyBinds = getByKeys("TOGGLE_HELP", "BROWSER_DEVTOOLS");
var keyBindsCopy = {
	...KeyBinds,
	TOGGLE_HELP: {
		...KeyBinds.TOGGLE_HELP,
		binds: KeyBinds.TOGGLE_HELP.binds.filter((a) => a !== "f1")
	}
};

function updateKeybinds(keybinds) {
	KeyBindManager.disable();
	KeyBindManager.setLayout(keybinds);
	KeyBindManager.enable();
}
module.exports = () => ({
	start: () => updateKeybinds(keyBindsCopy),
	stop: () => updateKeybinds(KeyBinds)
});
