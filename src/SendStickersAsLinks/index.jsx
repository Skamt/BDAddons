import css from "./styles";
import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import { React, DOM, Patcher } from "@Api";
import SettingComponent from "./components/SettingComponent";
import patchStickerClickability from "./patches/patchStickerClickability";
import patchSendSticker from "./patches/patchSendSticker";
import patchStickerComponent from "./patches/patchStickerComponent";
import patchStickerAttachement from "./patches/patchStickerAttachement";
import patchStickerSuggestion from "./patches/patchStickerSuggestion";
import patchChannelGuildPermissions from "./patches/patchChannelGuildPermissions";

export default class SendStickersAsLinks {
	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			patchStickerClickability();
			patchSendSticker();
			patchStickerComponent();
			patchStickerAttachement();
			patchStickerSuggestion();
			patchChannelGuildPermissions();
			
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}

	getSettingsPanel() {
		return <SettingComponent />;
	}
}
