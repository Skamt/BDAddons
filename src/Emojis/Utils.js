import EmojiFunctions from "@Modules/EmojiFunctions";
import Settings from "@Utils/Settings";

export function getEmojiUrl({ id, animated }) {
	const size = Settings.state.emojiSize;
	const type = animated ? (Settings.state.sendEmojiAsPng ? "png" : "gif") : "png";

	return `https://cdn.discordapp.com/emojis/${id}.${type}?size=${size}`;
}

export function isEmojiSendable(e) {
	return EmojiFunctions.getEmojiUnavailableReason?.__originalFunction?.(e) === null;
}

