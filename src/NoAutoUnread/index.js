import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";
import UnreadSettingNoticeStore2 from "@Stores/UnreadSettingNoticeStore2";

Plugin.on(Events.START, () => {
	Patcher.instead(UnreadSettingNoticeStore2, "maybeAutoUpgradeChannel", () => false);
});

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;
