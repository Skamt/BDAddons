import EmojiFunctions from "@Modules/EmojiFunctions";
import Settings from "@Utils/Settings";

export function getEmojiUrl({ id, animated }) {
	const size = Settings.state.emojiSize;
	const asPng = Settings.state.sendEmojiAsPng;
	const type = animated ? (asPng ? "png" : "gif") : "png";

	return `https://cdn.discordapp.com/emojis/${id}.${type}${animated && !asPng ? "" : `?size=${size}`}`;
}

export function isEmojiSendable(e) {
	return EmojiFunctions.getEmojiUnavailableReason?.__originalFunction?.(e) === null;
}
