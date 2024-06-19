import { Patcher } from "@Api";

import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";

import { hasEmbedPerms } from "@Utils/Permissions";
import MessageActions from "@Modules/MessageActions";
import STRINGS from "../Constants";

import { isAnimatedSticker, sendStickerAsLink, handleSticker } from "../Utils";

function handleUnsendableSticker({ user, sticker, channel }) {

	if (isAnimatedSticker(sticker) && !Settings.state.shouldSendAnimatedStickers) return Toast.info(STRINGS.disabledAnimatedStickersErrorMessage);
	if (!hasEmbedPerms(channel, user) && !Settings.state.ignoreEmbedPermissions) return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);

	sendStickerAsLink(sticker, channel);
}

export default () => {
	/**
	 * Main Patch
	 * */
	if (MessageActions)
		Patcher.instead(MessageActions, "sendStickers", (_, args, originalFunc) => {
			const [channelId, [stickerId]] = args;
			const stickerObj = handleSticker(channelId, stickerId);
			if (stickerObj.isSendable) originalFunc.apply(_, args);
			else handleUnsendableSticker(stickerObj);
		});
	else Logger.patch("SendSticker");
};
