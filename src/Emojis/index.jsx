import "./styles";
// import "./patches/*";
// import "./patches/EmojiContextmenu";
// import "./patches/patchEmojiInChat";
import "./patches/patchExpressionPicker";
// import "./patches/patchIsEmojiDisabled";
// import "./patches/patchFavoriteEmojis";
// import "./patches/patchEmojiPickerHeader";

// import { Patcher } from "@Api";
// import React from "@React";
import Plugin from "@common/Plugin";
// import SettingComponent from "./components/SettingComponent";

// Plugin.getSettingsPanel = () => <SettingComponent />;



module.exports = () => Plugin;
