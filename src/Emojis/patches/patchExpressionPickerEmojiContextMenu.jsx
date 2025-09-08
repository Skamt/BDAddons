import Plugin, { Events } from "@Utils/Plugin";
import { React, ContextMenu, Patcher } from "@Api";
import { getModule, Filters } from "@Webpack";
import Logger from "@Utils/Logger";
import { sendEmojiDirectly, insertEmoji } from "../Utils";

const bbb = getModule(Filters.byStrings("unfavorite"), { defaultExport: false });

Plugin.on(Events.START, () => {
	if (!bbb?.Z) return Logger.patchError("patchUnfavoriteEmoji");
	Patcher.after(bbb, "Z", (_, args, ret) => {
		// console.log(...args);
		// return ret;
		const [{ type, isInExpressionPicker, id }] = args;
		if (type !== "emoji" || !isInExpressionPicker || !id) return;
		// console.log(_, args, ret);
		return [
			// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
			<ContextMenu.Item
				action={() => sendEmojiDirectly(id)}
				id="send-directly"
				label="send directly"
			/>,
			// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
			<ContextMenu.Item
				action={() => insertEmoji(id)}
				id="insert-url"
				label="insert url"
			/>,
			ret
		];
		// if (has(id))
		// 	return (
		// 		<MenuItem
		// 			action={() => unfavHandler(id)}
		// 			label="unfavorite"
		// 			id="unfavorite"
		// 		/>
		// 	);

		// if  (!has(id) && id && ret?.props?.id === "favorite" ) {
		// 	return (
		// 		<MenuItem
		// 			action={() => fav(id)}
		// 			label="favorite"
		// 			id="favorite"
		// 		/>
		// 	);
		// }
	});
});

// function unfavHandler(id) {
// 	const emojis = Data.load("emojis");
// 	for (let i = emojis.length - 1; i >= 0; i--) {
// 		const emoji = emojis[i];
// 		if (emoji.id === id) {
// 			emojis.splice(i, 1);
// 			Data.save("emojis", emojis);
// 			break;
// 		}
// 	}
// }

// function fav(id) {
// 	const emoji = EmojiStore.getDisambiguatedEmojiContext().getById(id);
// 	if (!emoji) return Toast.error(`Could not find Emoji: ${id}`);

// 	const emojis = Data.load("emojis");
// 	emojis.unshift(emoji);
// 	Data.save("emojis", emojis);
// 	Toast.success(`Emoji ${id} Saved.`);
// }

// function has(id) {
// 	const emojis = Data.load("emojis");
// 	return emojis.find(a => a.id === id);
// }
