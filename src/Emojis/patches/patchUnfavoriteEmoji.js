import { React, Data, Patcher } from "@Api";
import { getModule, Filters } from "@Webpack";
import Logger from "@Utils/Logger";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import EmojiStore from "@Stores/EmojiStore";
import Toast from "@Utils/Toast";

const { MenuItem } = TheBigBoyBundle;
const bbb = getModule(Filters.byStrings("unfavorite"), { defaultExport: false });

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
	emojis.unshift(emoji);
	Data.save("emojis", emojis);
	Toast.success(`Emoji ${id} Saved.`);
}

function has(id){
	const emojis = Data.load("emojis");
	return emojis.find(a => a.id === id)
}

export default () => {
	if (!bbb?.Z) return Logger.patch("patchUnfavoriteEmoji");
	Patcher.after(bbb, "Z", (_, [{ type, id }], ret) => {
		console.log(ret);
		if (type !== "emoji") return;

		if (has(id))
			return (
				<MenuItem
					action={() => unfavHandler(id)}
					label="unfavorite"
					id="unfavorite"
				/>
			);

		if  (!has(id) && id && ret?.props?.id === "favorite" ) {
			return (
				<MenuItem
					action={() => fav(id)}
					label="favorite"
					id="favorite"
				/>
			);
		}
	});
};
