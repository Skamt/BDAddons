/**
 * @runAt idle
 * @name NoNitroUpsell
 * @description Removes all of Discord's nitro upsells by tricking the client into thinking you have nitro.
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/NoNitroUpsell
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/NoNitroUpsell/NoNitroUpsell.plugin.js
 * @credit https://github.com/Equicord/Equicord/tree/main/src/equicordplugins/noNitroUpsell
 */

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

// MODULES-AUTO-LOADER:@Stores/OverridePremiumTypeStore
var OverridePremiumTypeStore_default = getStore("OverridePremiumTypeStore");

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true });

// src/NoNitroUpsell/index.js
function onConnectionOpen() {
	const state = OverridePremiumTypeStore_default.getState();
	if (state.premiumTypeActual !== 2 || state.premiumTypeOverride === 2) return;
	state.premiumTypeOverride = 2;
}
module.exports = () => ({
	start() {
		OverridePremiumTypeStore_default.getState().premiumTypeOverride = 2;
		Dispatcher_default.subscribe("CONNECTION_OPEN", onConnectionOpen);
	},
	stop() {
		Dispatcher_default.unsubscribe("CONNECTION_OPEN", onConnectionOpen);
		OverridePremiumTypeStore_default.getState().premiumTypeOverride = void 0;
	}
});
