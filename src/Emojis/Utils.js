import EmojiFunctions from "@Modules/EmojiFunctions";
import Settings from "@Utils/Settings";
import EmojiStore from "@Stores/EmojiStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import ChannelStore from "@Stores/ChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import { Data } from "@Api";
import { hasEmbedPerms } from "@Utils/Permissions";
import UserStore from "@Stores/UserStore";
import DraftStore from "@Stores/DraftStore";
import Toast from "@Utils/Toast";
import STRINGS from "./Constants";

export function handleUnsendableEmoji(emoji, channel) {
	if (emoji.animated && !Settings.state.shouldSendAnimatedEmojis) return Toast.info(STRINGS.disabledAnimatedEmojiErrorMessage);

	const user = UserStore.getCurrentUser();
	if (!hasEmbedPerms(channel, user) && !Settings.state.ignoreEmbedPermissions) return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);

	sendEmojiAsLink(emoji, channel);
}

function getCustomEmojiById(id) {
	const emoji = EmojiStore.getCustomEmojiById(id);
	if (emoji) return emoji;
	const savedEmojis = Data.load("emojis");
	return savedEmojis.find(a => a.id === id);
}

export function getEmojiUrl(id) {
	const { animated } = getCustomEmojiById(id) || { animated: false };
	const size = Settings.state.emojiSize;
	const asPng = Settings.state.sendEmojiAsPng;
	const type = animated ? (asPng ? "png" : "gif") : "png";

	return `https://cdn.discordapp.com/emojis/${id}.${type}${animated && !asPng ? "" : `?size=${size}`}`;
}

export function isEmojiSendable(e) {
	const test = EmojiFunctions.getEmojiUnavailableReason?.__originalFunction || EmojiFunctions.getEmojiUnavailableReason;
	if (test) return test(e) === null;
}

function sendEmojiAsLink(content, channel) {
	if (!channel) channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
	const draft = DraftStore.getDraft(channel.id, 0);
	if (draft) return insertText(`[󠇫](${content})`);

	if (Settings.state.sendDirectly) {
		try {
			return sendMessageDirectly(content, channel.id);
		} catch {
			Toast.error("Could not send directly.");
		}
	}
	insertText(content);
}

export function sendEmojiDirectly(id) {
	const content = getEmojiUrl(id);
	sendEmojiAsLink(content);
}

export function insertEmoji(id) {
	const content = getEmojiUrl(id);
	insertText(content);
}
