import css from "./styles";
import { React, DOM, Patcher } from "@Api";
import SettingComponent from "./components/SettingComponent";
import Settings from "@Utils/Settings";
import patchGetEmojiUnavailableReason from "./patches/patchGetEmojiUnavailableReason";
import patchIsEmojiFiltered from "./patches/patchIsEmojiFiltered";
import patchExpressionPicker from "./patches/patchExpressionPicker";
import patchIsEmojiDisabled from "./patches/patchIsEmojiDisabled";
import patchHighlightAnimatedEmoji from "./patches/patchHighlightAnimatedEmoji";
import patchEmojiUtils from "./patches/patchEmojiUtils";

export default class Emojis {
	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			patchIsEmojiFiltered();
			patchGetEmojiUnavailableReason();
			patchExpressionPicker();
			patchIsEmojiDisabled();
			patchHighlightAnimatedEmoji();
			patchEmojiUtils();
		} catch (e) {
			console.error(e);
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
