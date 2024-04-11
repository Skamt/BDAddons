import { React, Data, Patcher } from "@Api";
import { getModule, Filters } from "@Webpack";
import Logger from "@Utils/Logger";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import EmojiStore from "@Stores/EmojiStore";
import Toast from "@Utils/Toast";


const { MenuItem } = TheBigBoyBundle;
const bbb = getModule(Filters.byStrings("useIsFavoriteEmoji"), { defaultExport: false });

function unfavHandler(id) {
	const emojis = Data.load("emojis");
	for (let i = emojis.length - 1; i >= 0; i--) {
		const emoji = emojis[i];
		if (emoji.id === id) {
			emojis.splice(i, 1);
			Data.save("emojis", emojis);
			break;
		}
	}
}

function fav(id) {
	const emoji = EmojiStore.getDisambiguatedEmojiContext().getById(id);
	if (!emoji) return Toast.error(`Could not find Emoji: ${id}`);

	const emojis = Data.load("emojis");
	emoji.push(emoji);
	Data.save("emojis", emojis);
	Toast.success(`Emoji ${id} Saved.`);
}

export default () => {
	if (bbb?.default)
		Patcher.after(bbb, "default", (_, [{ type, id }], ret) => {
			if (type !== "emoji") return;
			if (id && ret?.props?.id === "favorite") {
				return (
					<MenuItem
						action={() => fav(id)}
						label="favorite"
						id="favorite"
					/>
				);
			}

			if (!ret)
				return (
					<MenuItem
						action={() => unfavHandler(id)}
						label="unfavorite"
						id="unfavorite"
					/>
				);
		});
	else Logger.patch("patchUnfavoriteEmoji");
};
