import { findInTree, getInternalInstance } from "@Api";
import EmojiFunctions from "@Modules/EmojiFunctions";

export function isEmojiSendable(e) {
	return EmojiFunctions.getEmojiUnavailableReason(e) === null;
}

export function parseEmojiUrl(emoji, size) {
	return `${emoji.url.replace(/(size=)(\d+)[&]/, "")}&size=${size}`;
}

export function getEmojiWebpUrl(emoji, size) {
	return parseEmojiUrl(emoji, size).replace("gif", "webp");
}

export function getEmojiGifUrl(emoji, size) {
	return parseEmojiUrl(emoji, size).replace("webp", "gif");
}

export function getPickerIntention(event) {
	const picker = event.path.find(i => i.id === "emoji-picker-tab-panel");
	if (!picker) return [null];
	const pickerInstance = getInternalInstance(picker);
	const { pickerIntention } = findInTree(pickerInstance, m => m && "pickerIntention" in m, { walkable: ["pendingProps", "children", "props"] }) || {};
	return [pickerIntention, picker];
}