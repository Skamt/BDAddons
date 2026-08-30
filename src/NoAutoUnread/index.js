import UnreadSettingNoticeStore2 from "@Stores/UnreadSettingNoticeStore2";

module.exports = () => ({
	stop() {},
	start ()  {
		if(!UnreadSettingNoticeStore2) return ;
		this.stop = BdApi.Patcher.instead("NoAutoUnread", UnreadSettingNoticeStore2, "maybeAutoUpgradeChannel", () => false);
	}
});
