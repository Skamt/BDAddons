import { getModule, reactRefMemoFilter } from "@Webpack";
import React from "@React";

const UploadButton = getModule(reactRefMemoFilter("type", "CHAT_INPUT_BUTTON_NOTIFICATION,"));

module.exports = () => ({
	stop: () => BdApi.Patcher.unpatchAll("BetterUploadButton"),
	start() {
		if (!UploadButton) return Logger.patchError("UploadButton");
		BdApi.Patcher.after("BetterUploadButton", UploadButton, "type", (_, __, ret) => {
			return React.cloneElement(ret, {
				onClick: ret.props.onDoubleClick,
				onContextMenu: ret.props.onClick
			});
		});
	}
});
