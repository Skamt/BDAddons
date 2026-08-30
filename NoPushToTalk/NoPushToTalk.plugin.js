/**
 * @runAt idle
 * @name NoPushToTalk
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/NoPushToTalk
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/NoPushToTalk/NoPushToTalk.plugin.js
 * @credit https://github.com/Equicord/Equicord/tree/main/src/equicordplugins/noPushToTalk
 */

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

// MODULES-AUTO-LOADER:@Stores/PermissionVADStore
var PermissionVADStore_default = getStore("PermissionVADStore");

// MODULES-AUTO-LOADER:@Modules/DiscordPermissions
var DiscordPermissions_default = getModule(Filters.byKeys("computePermissions"), { searchExports: false });

// MODULES-AUTO-LOADER:@Enums/DiscordPermissionsEnum
var DiscordPermissionsEnum_default = getModule(Filters.byKeys("ADD_REACTIONS"), { searchExports: true }) || void 0;

// src/NoPushToTalk/index.js
module.exports = () => ({
	start() {
		PermissionVADStore_default && BdApi.Patcher.instead("NoPushToTalk", PermissionVADStore_default, "shouldShowWarning", () => false);
		PermissionVADStore_default && BdApi.Patcher.instead("NoPushToTalk", PermissionVADStore_default, "canUseVoiceActivity", () => true);
		DiscordPermissions_default && BdApi.Patcher.after("NoPushToTalk", DiscordPermissions_default, "can", (_, [p], ret) => ret || DiscordPermissionsEnum_default.USE_VAD === p);
	},
	stop: () => BdApi.Patcher.unpatchAll("NoPushToTalk")
});
