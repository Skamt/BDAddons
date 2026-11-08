import Settings from "@Settings";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/discord/Message";
import DraftStore from "@Stores/DraftStore";

import { showToast, copy as _copy } from "@Utils";

export function copy(content) {
	if (!content) return showToast("error", "Copy failed!");
	_copy(content);
	showToast("success", "Copied!");
}
function sendEmojiAsLink(content) {
	const channelId = SelectedChannelStore.getChannelId();
	const draft = DraftStore.getDraft(channelId, 0);
	if (draft) return insertText(`[󠇫](${content})`);

	sendMessageDirectly(content, channelId).catch(() => {
		showToast("error", "Could not send directly.");
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

	const action = {
		insert: () => insert(id),
		send: () => sendDirectly(id)
	}[label];

	const actions = {
		insert: [
			{ label: "unanimated", action },
			{ label: "animated", action: () => insertAnimated(id) }
		],
		send: [
			{ label: "unanimated", action },
			{ label: "animated", action: () => sendAnimatedDirectly(id) }
		]
	}[label];

	if (animated) {
		item.type = "submenu";
		item.items = actions;
	} else item.action = action;

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
