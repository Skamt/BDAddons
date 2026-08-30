/**
 * @runAt idle
 * @name NoAutoUnread
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/NoAutoUnread
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/NoAutoUnread/NoAutoUnread.plugin.js
 * @credit https://github.com/Equicord/Equicord/tree/main/src/equicordplugins/stopAutoUnread
 */

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

// MODULES-AUTO-LOADER:@Stores/UnreadSettingNoticeStore2
var UnreadSettingNoticeStore2_default = getStore("UnreadSettingNoticeStore2");

// src/NoAutoUnread/index.js
module.exports = () => ({
	stop() {},
	start() {
		if (!UnreadSettingNoticeStore2_default) return;
		this.stop = BdApi.Patcher.instead("NoAutoUnread", UnreadSettingNoticeStore2_default, "maybeAutoUpgradeChannel", () => false);
	}
});
