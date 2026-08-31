/**
 * @runAt idle
 * @name NoConfirmPin
 * @description Disables Conrimation prompt when pinning/unpinning messages
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/NoConfirmPin
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/NoConfirmPin/NoConfirmPin.plugin.js
 */

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getByKeys = /* @__PURE__ */ (() => Webpack.getByKeys)();

// src/NoConfirmPin/index.js
var ConfirmPinActions = getByKeys("confirmPin");
var PinActions = getByKeys("pinMessage");
module.exports = () => ({
	start() {
		BdApi.Patcher.instead("NoConfirmPin", ConfirmPinActions, "confirmPin", (_, [channel, message]) => {
			PinActions.pinMessage.apply(PinActions, [channel, message.id]);
		});
		BdApi.Patcher.instead("NoConfirmPin", ConfirmPinActions, "confirmUnpin", (_, [channel, message]) => {
			PinActions.unpinMessage.apply(PinActions, [channel, message.id]);
		});
	},
	stop: () => BdApi.Patcher.unpatchAll("NoConfirmPin")
});
