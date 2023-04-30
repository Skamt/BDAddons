import { getReply } from "@Utils";
import { getModule } from "@Webpack";
import MessageActions from "@Modules/MessageActions";

export function sendMessageDirectly(channel, content) {
	if (MessageActions)
		MessageActions.sendMessage(channel.id, {
			validNonShortcutEmojis: [],
			content
		}, undefined, getReply(channel.id));
	else
		throw new Error("Can't send message directly.");
}

export const insertText = (() => {
	let ComponentDispatch;
	return (content) => {
		if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners('INSERT_TEXT').length, { searchExports: true });
		setTimeout(() => {
			ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
				plainText: content
			});
		});
	}
})()