import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import EmojiIntentionEnum from "@Enums/EmojiIntentionEnum";
import { getModule } from "@Webpack";

const emojiHooks = getModule(a => a.useEmojiGrid);
export default () => {
	if (emojiHooks?.useEmojiGrid)
		Patcher.after(emojiHooks, "useEmojiGrid", (_, [{pickerIntention}], ret) => {
			if (pickerIntention !== EmojiIntentionEnum.CHAT) return ret;
			for (const a of ret.sectionDescriptors) {
				a.isNitroLocked = false;
			}
		});
	else Logger.patch("emojiHooks");
};
