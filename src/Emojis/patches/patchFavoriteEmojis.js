import {  Patcher } from "@Api";
import Logger from "@Utils/Logger";
import EmojiStore from "@Stores/EmojiStore";
import EmojisManager from "../EmojisManager";

const emojiContextConstructor = EmojiStore?.getDisambiguatedEmojiContext?.().constructor;

export default () => {
	if (!emojiContextConstructor) return Logger.patchError("emojiContextConstructor");

	Patcher.after(emojiContextConstructor.prototype, "rebuildFavoriteEmojisWithoutFetchingLatest", (_, args, ret) => {
		if(!ret?.favorites) return;
		ret.favorites = [...ret.favorites, ...EmojisManager.emojis];
	});

	Patcher.after(emojiContextConstructor.prototype, "getDisambiguatedEmoji", (_, args, ret) => {
		return [...ret, ...EmojisManager.emojis];
	});
};

