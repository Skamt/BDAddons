import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import EmojiFunctions from "@Modules/EmojiFunctions";
import EmojiIntentionEnum from "@Enums/EmojiIntentionEnum";

export default () => {
	/**
	 * This patch allows emojis to be added to the picker
	 * if external emojis are disabled, they don't get added to the picker
	 * PREMIUM_LOCKED is returned becaause that is what's returned normally 
	 */
	if (EmojiFunctions?.getEmojiUnavailableReason)
		Patcher.after(EmojiFunctions, "getEmojiUnavailableReason", (_, [{ intention }], ret) => {
			if (intention !== EmojiIntentionEnum.CHAT) return ret;
			return null;
			// ret === EmojiSendAvailabilityEnum.DISALLOW_EXTERNAL ? EmojiSendAvailabilityEnum.PREMIUM_LOCKED : ret;
		});
	else
		Logger.patch("GetEmojiUnavailableReason");
};