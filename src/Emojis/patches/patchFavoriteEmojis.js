import { Data, Patcher } from "@Api";
import Logger from "@Utils/Logger";
import EmojiStore from "@Stores/EmojiStore";

const emojiContextConstructor = EmojiStore?.getDisambiguatedEmojiContext?.().constructor;

export default () => {
	if (emojiContextConstructor)
		Patcher.after(emojiContextConstructor.prototype, "rebuildFavoriteEmojisWithoutFetchingLatest", (_, args, ret) => {
			const emojis = Data.load("emojis");
			ret[0] = [...ret[0],...emojis];
		});
	else Logger.patch("emojiContextConstructor");
};
