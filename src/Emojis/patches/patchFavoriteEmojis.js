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

	Patcher.after(emojiContextConstructor.prototype, "getDisambiguatedEmoji", (_, args, ret) => {
		const emojis = Data.load("emojis");
		let sum=[];
		if(emojis.length > ret.length){
			sum = [...emojis];
			ret.forEach(r => emojis.find(e => e.id === r.id) ? null : sum.push(r));
		}
		else{
			sum = [...ret];
			emojis.forEach(r => ret.find(e => e.id === r.id) ? null : sum.push(r));
		}
		
		return sum;
	});
};
