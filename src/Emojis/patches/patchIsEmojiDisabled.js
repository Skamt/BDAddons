import Plugin from "@common/Plugin";

import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import EmojiFunctions from "@Modules/EmojiFunctions";
import EmojiIntentionEnum from "@Enums/EmojiIntentionEnum";

Plugin.onStart(() => {
	if (!EmojiFunctions?.isEmojiDisabled) return Logger.patchError("IsEmojiDisabled");
	Patcher.after(EmojiFunctions, "isEmojiDisabled", (_, [{ intention }], ret) => {
		if (intention !== EmojiIntentionEnum.CHAT) return ret;
		return false;
	});
});
