import Plugin, { Events } from "@Utils/Plugin";

import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import EmojiFunctions from "@Modules/EmojiFunctions";
import EmojiIntentionEnum from "@Enums/EmojiIntentionEnum";

Plugin.on(Events.START, () => {
	if (!EmojiFunctions?.isEmojiDisabled) return Logger.patchError("IsEmojiDisabled");
	Patcher.after(EmojiFunctions, "isEmojiDisabled", (_, [{ intention }], ret) => {
		if (intention !== EmojiIntentionEnum.CHAT) return ret;
		return false;
	});
});
