import "./styles";
import { React, DOM, Patcher } from "@Api";
import SettingComponent from "./components/SettingComponent";
import patchGetEmojiUnavailableReason from "./patches/patchGetEmojiUnavailableReason";
import patchIsEmojiFiltered from "./patches/patchIsEmojiFiltered";
import patchExpressionPicker from "./patches/patchExpressionPicker";
import patchIsEmojiDisabled from "./patches/patchIsEmojiDisabled";
import patchHighlightAnimatedEmoji from "./patches/patchHighlightAnimatedEmoji";
import patchEmojiUtils from "./patches/patchEmojiUtils";
import patchFavoriteEmojis from "./patches/patchFavoriteEmojis";
import patchUseEmojiGrid from "./patches/patchUseEmojiGrid";
import patchExpressionPickerEmojiContextMenu from "./patches/patchExpressionPickerEmojiContextMenu";

import EmojisManager from "./EmojisManager";
window.t = EmojisManager;
// import Dispatcher from "@Modules/Dispatcher";
export default class Emojis {
	start() {
		try {
			DOM.addStyle(css);
			// EmojisManager.init();
			// patchIsEmojiFiltered();
			// patchEmojiGuildSourcePopout();
			// patchGetEmojiUnavailableReason();
			// patchExpressionPicker();
			patchIsEmojiDisabled();
			// patchHighlightAnimatedEmoji();
			// patchEmojiUtils();
			patchFavoriteEmojis();
			// patchUseEmojiGrid();
			patchExpressionPickerEmojiContextMenu();

			// Patcher.before(Dispatcher, "dispatch", (_, [e]) => {
			// 	console.log(e.type,e);
			// });
		} catch (e) {
			console.error(e);
		}
	}

	stop() {
		// EmojisManager.dispose();
		DOM.removeStyle();
		Patcher.unpatchAll();
	}

	getSettingsPanel() {
		return <SettingComponent />;
	}
}
