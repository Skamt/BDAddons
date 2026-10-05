import Settings from "@Settings";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import DraftStore from "@Stores/DraftStore";
import Toast from "@Utils/Toast";
import { copy as _copy } from "@Utils";

export function copy(content) {
	if (!content) return Toast.error("Copy failed!");
	_copy(content);
	Toast.success("Copied!");
}
function sendEmojiAsLink(content) {
	const channelId = SelectedChannelStore.getChannelId();
	const draft = DraftStore.getDraft(channelId, 0);
	if (draft) return insertText(`[󠇫](${content})`);

	sendMessageDirectly(content, channelId).catch(() => {
		Toast.error("Could not send directly.");
		insertText(content);
	});
}

export function buildEmojiUrl(id, animated, size) {
	return `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}${!size ? "" : `?size=${size}`}`;
}

export function sendDirectly(id) {
	sendEmojiAsLink(buildEmojiUrl(id, false, Settings.state.emojiSize));
}

export function insert(id) {
	insertText(buildEmojiUrl(id, false, Settings.state.emojiSize));
}

export function sendAnimatedDirectly(id) {
	sendEmojiAsLink(buildEmojiUrl(id, true));
}

export function insertAnimated(id) {
	insertText(buildEmojiUrl(id, true));
}

export function copyEmojiUrl(id) {
	copy(buildEmojiUrl(id, false, Settings.state.emojiSize));
}

export function getContextMenuItem(label, id, animated) {
	const item = { label };

	if (animated) {
		item.type = "submenu";
		item.items = [
			{ label: "unanimated", action: () => sendDirectly(id) },
			{ label: "animated", action: () => sendAnimatedDirectly(id) }
		];
	} else item.action = () => sendDirectly(id);

	return item;
}

export function getCopyContextMenuItem(id, name) {
	return {
		label: "Copy",
		type: "submenu",
		items: [
			{ label: "url", action: () => copyEmojiUrl(id) },
			{ label: "name", action: () => copy(name) }
		]
	};
}
