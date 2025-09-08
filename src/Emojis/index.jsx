import "./styles";
// import "./patches/*";
import "./patches/patchIsEmojiDisabled";
import "./patches/patchFavoriteEmojis";
import "./patches/patchExpressionPickerEmojiContextMenu";
import "./patches/patchUseEmojiGrid";
import "./patches/patchEmojiPickerHeader";

import { Patcher } from "@Api";
import React from "@React";
import Plugin, { Events } from "@Utils/Plugin";
import SettingComponent from "./components/SettingComponent";

Plugin.getSettingsPanel = () => <SettingComponent />;

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;

// import patchGetEmojiUnavailableReason from "./patches/patchGetEmojiUnavailableReason";
// import patchIsEmojiFiltered from "./patches/patchIsEmojiFiltered";
// import patchExpressionPicker from "./patches/patchExpressionPicker";
// import patchHighlightAnimatedEmoji from "./patches/patchHighlightAnimatedEmoji";
// import patchEmojiUtils from "./patches/patchEmojiUtils";
// import patchUseEmojiGrid from "./patches/patchUseEmojiGrid";
