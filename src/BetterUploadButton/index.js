import React from "@React";
import { getModule, reactRefMemoFilter } from "@Webpack";

const UploadButton = getModule(reactRefMemoFilter("type", "CHAT_INPUT_BUTTON_NOTIFICATION,"));
module.exports = () => ({
	stop: () => {},
	start() {
		if (!UploadButton) return console.error("[BetterUploadButton] Could not patch UploadButton");

		this.stop = BdApi.Patcher.after("BetterUploadButton", UploadButton, "type", (_, __, ret) => {
			if (!ret.props?.className?.includes("attachButton")) return ret;
			// eslint-disable-next-line @eslint-react/no-clone-element
			return React.cloneElement(ret, {
				onClick: ret.props.onDoubleClick,
				onContextMenu: ret.props.onClick
			});
		});
	}
});
