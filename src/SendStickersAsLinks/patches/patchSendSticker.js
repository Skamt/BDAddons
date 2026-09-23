import { instead } from "@common/Patcher";
import Settings from "@Utils/Settings";
import Toast from "@Utils/Toast";
import Plugin from "@common/Plugin";
import { hasEmbedPerms } from "@Utils/Permissions";
import MessageActions from "@Modules/MessageActions";

import { isAnimatedSticker, sendStickerAsLink, handleSticker } from "../Utils";

function handleUnsendableSticker({ user, sticker, channel }) {
	if (isAnimatedSticker(sticker) && !Settings.state.shouldSendAnimatedStickers)
		return Toast.info("You have disabled animated stickers in settings.");
	if (!hasEmbedPerms(channel, user) && !Settings.state.ignoreEmbedPermissions)
		return Toast.info("Missing Embed Permissions");

	sendStickerAsLink(sticker, channel);
}

Plugin.onStart(() => {
	instead(MessageActions, "sendStickers", ({ context, args, fn }) => {
		const [channelId, [stickerId]] = args;
		const stickerObj = handleSticker(channelId, stickerId);
		if (stickerObj.isSendable) fn.apply(context, args);
		else handleUnsendableSticker(stickerObj);
	});
});
