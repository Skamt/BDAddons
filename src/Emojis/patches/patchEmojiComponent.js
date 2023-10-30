import { Patcher } from "@Api";
import { getModule } from "@Webpack";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import UserStore from "@Stores/UserStore";
import ChannelStore from "@Stores/ChannelStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import { hasEmbedPerms } from "@Utils/Permissions";
import Toast from "@Utils/Toast";
import EmojiIntentionEnum from "@Enums/EmojiIntentionEnum";

import { getEmojiWebpUrl, getEmojiGifUrl, isEmojiSendable, parseEmojiUrl } from "../Utils";
import STRINGS from "../Constants";

const ExpressionPicker = getModule(a => a?.type?.toString().includes("IF,children:D.defau"), { searchExports: false });

function getEmojiUrl(emoji, size) {
	if (Settings.get("sendEmojiAsWebp")) return getEmojiWebpUrl(emoji, size);
	if (emoji.animated) return getEmojiGifUrl(emoji, 4096);

	return parseEmojiUrl(emoji, size);
}

function sendEmojiAsLink(emoji, channel) {
	const content = getEmojiUrl(emoji, Settings.get("emojiSize"));
	if (Settings.get("sendDirectly")) {
		try {
			return sendMessageDirectly(channel, content);
		} catch {
			Toast.error("Could not send directly.");
		}
	}
	insertText(content);
}

function handleUnsendableEmoji(emoji, channel, user) {
	if (emoji.animated && !Settings.get("shouldSendAnimatedEmojis")) 
		return Toast.info(STRINGS.disabledAnimatedEmojiErrorMessage);
	if (!hasEmbedPerms(channel, user) && !Settings.get("ignoreEmbedPermissions")) 
		return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);

	sendEmojiAsLink(emoji, channel);
}

function emojiHandler(channel, emoji) {
	const user = UserStore.getCurrentUser();
	const intention = EmojiIntentionEnum.CHAT;
	// const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
	if (!isEmojiSendable({ emoji, channel, intention })) handleUnsendableEmoji(emoji, channel, user);
}

export default () => {
	if (ExpressionPicker)
		Patcher.before(ExpressionPicker, "type", (_, [props]) => {
			props.onSelectEmoji = emojiHandler.bind(null, props.channel);
		});
	else Logger.patch("ExpressionPicker");
};
