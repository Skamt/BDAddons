import "./styles";
import "./patches/*";
import Plugin from "@Utils/Plugin";
import React from "@React";
import SettingComponent from "./components/SettingComponent";

Plugin.getSettingsPanel = () => <SettingComponent />;
module.exports = () => Plugin;



// import "./styles";
// import Logger from "@Utils/Logger";
// import { React, DOM, Patcher } from "@Api";
// import SettingComponent from "./components/SettingComponent";
// import patchStickerClickability from "./patches/patchStickerClickability";
// import patchSendSticker from "./patches/patchSendSticker";
// import patchStickerComponent from "./patches/patchStickerComponent";
// import patchStickerAttachement from "./patches/patchStickerAttachement";
// import patchStickerSuggestion from "./patches/patchStickerSuggestion";
// import patchChannelGuildPermissions from "./patches/patchChannelGuildPermissions";

// export default class SendStickersAsLinks {
// 	start() {
// 		try {
// 			DOM.addStyle(css);
// 			patchStickerClickability();
// 			patchSendSticker();
// 			patchStickerComponent();
// 			patchStickerAttachement();
// 			patchStickerSuggestion();
// 			patchChannelGuildPermissions();
			
// 		} catch (e) {
// 			Logger.error(e);
// 		}
// 	}

// 	stop() {
// 		DOM.removeStyle();
// 		Patcher.unpatchAll();
// 	}

// 	getSettingsPanel() {
// 		return <SettingComponent />;
// 	}
// }
