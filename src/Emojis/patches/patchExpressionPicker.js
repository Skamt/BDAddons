import { Patcher } from "@Api";
import { getModule } from "@Webpack";
import Toast from "@Utils/Toast";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import { hasEmbedPerms } from "@Utils/Permissions";
import { sendMessageDirectly, insertText } from "@Utils/Messages";
import UserStore from "@Stores/UserStore";
import EmojiIntentionEnum from "@Enums/EmojiIntentionEnum";
import { getEmojiWebpUrl, getEmojiGifUrl, isEmojiSendable, parseEmojiUrl } from "../Utils";
import STRINGS from "../Constants";

const ExpressionPicker = getModule(a => a?.type?.toString().includes("handleDrawerResizeHandleMouseDown"), { searchExports: false });

function getEmojiUrl(emoji, size) {
	if (Settings.state.sendEmojiAsWebp) return getEmojiWebpUrl(emoji, size);
	if (emoji.animated) return getEmojiGifUrl(emoji, 4096);

	return parseEmojiUrl(emoji, size);
}

function sendEmojiAsLink(emoji, channel) {
	const content = getEmojiUrl(emoji, Settings.state.emojiSize);
	if (Settings.state.sendDirectly) {
		try {
			return sendMessageDirectly(channel, content);
		} catch {
			Toast.error("Could not send directly.");
		}
	}
	insertText(content);
}

function handleUnsendableEmoji(emoji, channel) {
	if (emoji.animated && !Settings.state.shouldSendAnimatedEmojis)
		return Toast.info(STRINGS.disabledAnimatedEmojiErrorMessage);

	const user = UserStore.getCurrentUser();
	if (!hasEmbedPerms(channel, user) && !Settings.state.ignoreEmbedPermissions)
		return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);

	sendEmojiAsLink(emoji, channel);
}

export default () => {
	if (ExpressionPicker && ExpressionPicker.type)
		Patcher.before(ExpressionPicker, "type", (_, [props]) => {
			const orig = props.onSelectEmoji;
			props.onSelectEmoji = (...args) => {
				const [emoji] = args;
				const channel = props.channel;
				if (!isEmojiSendable({ emoji, channel, intention: EmojiIntentionEnum.CHAT })) handleUnsendableEmoji(emoji, channel);
				else orig.apply(null, args);
			};
		});
	else Logger.patch("ExpressionPicker");
};