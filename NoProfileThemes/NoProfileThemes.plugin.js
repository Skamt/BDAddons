/**
 * @runAt idle
 * @name NoProfileThemes
 * @description Completely removes Nitro profile themes from everyone but yourself
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/NoProfileThemes
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/NoProfileThemes/NoProfileThemes.plugin.js
 * @credit https://github.com/Vendicated/Vencord/tree/main/src/plugins/noProfileThemes
 */

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();

// src/NoProfileThemes/index.js
var NitroManager = getModule(Filters.bySource("hasThemeColors(){"), {
	declarationFilter: (a) => a.prototype.getLegacyUsername
});
module.exports = () => ({
	stop() {},
	start() {
		if (!NitroManager) return Logger.patchError("NitroManager");
		let propertyDescriptor = null;
		propertyDescriptor = Object.getOwnPropertyDescriptor(NitroManager.prototype, "canUsePremiumProfileCustomization");
		Object.defineProperty(NitroManager.prototype, "canUsePremiumProfileCustomization", {
			get() {
				return BdApi.Webpack.Stores.UserStore.getCurrentUser().id === this.userId;
			}
		});
		this.stop = () => Object.defineProperty(NitroManager.prototype, "canUsePremiumProfileCustomization", propertyDescriptor);
	}
});
