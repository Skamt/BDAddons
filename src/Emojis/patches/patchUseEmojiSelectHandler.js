import { Patcher } from "@Api";
import Logger from "@Utils/Logger";

export default () => {
	/**
	 * This patches allows server icons to show up on the left side of the picker
	 * if external emojis are disabled, servers get filtered out
	 * and it's handy to scroll through emojis easily
	 */
	if (EmojiFunctions)
		Patcher.before(module, "type", (_, [{onSelectEmoji}], ret) => {
			if (intention !== EmojiIntentionEnum.CHAT) return ret;
			return false;
		});
	else
		Logger.patch("IsEmojiFiltered");
}





