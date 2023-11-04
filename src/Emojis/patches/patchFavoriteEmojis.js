import { Data, Patcher } from "@Api";
import { getModule, Filters } from "@Webpack";
import Logger from "@Utils/Logger";

const emojiHooks = getModule(Filters.byProps("useFavoriteEmojis"));

export default () => {
	if (emojiHooks)
		Patcher.after(emojiHooks, "useFavoriteEmojis", (_, args, ret) => {
			const emojis = Data.load("emojis");
			for (let i = emojis.length - 1; i >= 0; i--) {
				const emoji = emojis[i];
				if (ret.some(e => e.id === emoji.id)) continue;
				ret.push(emoji);
			}
		});
	else Logger.patch("useFavoriteEmojis");
};
