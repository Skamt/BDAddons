import css from "./styles";
import { React, DOM, Patcher } from "@Api";
import SettingComponent from "./components/SettingComponent";
import Settings from "@Utils/Settings";
import patchGetEmojiUnavailableReason from "./patches/patchGetEmojiUnavailableReason";
import patchIsEmojiFiltered from "./patches/patchIsEmojiFiltered";
import patchEmojiComponent from "./patches/patchEmojiComponent";
import patchIsEmojiDisabled from "./patches/patchIsEmojiDisabled";
import patchIsEmojiPremiumLocked from "./patches/patchIsEmojiPremiumLocked";



export default class Emojis {
	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			patchIsEmojiFiltered();
			patchGetEmojiUnavailableReason();
			patchEmojiComponent();
			patchIsEmojiDisabled();
			patchIsEmojiPremiumLocked();
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
