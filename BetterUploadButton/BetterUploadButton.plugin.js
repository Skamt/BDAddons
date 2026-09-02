/**
 * @runAt idle
 * @name BetterUploadButton
 * @description Upload with a single click, open menu with right click
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/BetterUploadButton
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/BetterUploadButton/BetterUploadButton.plugin.js
 * @credit https://github.com/Vendicated/Vencord/tree/main/src/plugins/betterUploadButton
 */

// common/React.jsx
var React_default = /* @__PURE__ */ (() => BdApi.React)();

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();

function reactRefMemoFilter(type, ...args) {
	const filter = Filters.byStrings(...args);
	return (target) => target[type] && filter(target[type]);
}

// src/BetterUploadButton/index.js
var UploadButton = getModule(reactRefMemoFilter("type", "CHAT_INPUT_BUTTON_NOTIFICATION,"));
module.exports = () => ({
	stop() {
		BdApi.Patcher.unpatchAll("BetterUploadButton");
	},
	start() {
		if (!UploadButton) return Logger.patchError("UploadButton");
		BdApi.Patcher.after("BetterUploadButton", UploadButton, "type", (_, __, ret) => {
			return React_default.cloneElement(ret, {
				onClick: ret.props.onDoubleClick,
				onContextMenu: ret.props.onClick
			});
		});
	}
});
