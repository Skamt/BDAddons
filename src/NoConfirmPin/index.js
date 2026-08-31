import { getByKeys } from "@Webpack";

const ConfirmPinActions = getByKeys("confirmPin");
const PinActions = getByKeys("pinMessage");

module.exports = () => ({
	start() {
		BdApi.Patcher.instead("NoConfirmPin", ConfirmPinActions, "confirmPin", (_, [channel, message]) => {
			PinActions.pinMessage.apply(PinActions, [channel, message.id]);
		});
		BdApi.Patcher.instead("NoConfirmPin", ConfirmPinActions, "confirmUnpin", (_, [channel, message]) => {
			PinActions.unpinMessage.apply(PinActions, [channel, message.id]);
		});
	},
	stop: () => BdApi.Patcher.unpatchAll("NoConfirmPin"),
});
