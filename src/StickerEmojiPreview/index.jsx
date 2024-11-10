import "./styles";
import Logger from "@Utils/Logger";
import { DOM, React, Patcher } from "@Api";

import patchPickerInspector from "./patches/patchPickerInspector";
import patchCloseExpressionPicker from "./patches/patchCloseExpressionPicker";

import SettingComponent from "./components/SettingComponent";

export default class StickerEmojiPreview {
	
	start() {
		try {
			DOM.addStyle(css);
			patchPickerInspector();
			patchCloseExpressionPicker();
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
