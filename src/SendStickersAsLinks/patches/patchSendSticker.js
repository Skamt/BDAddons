import { Patcher } from "@Api";
import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import { showToast, insertText } from "@Utils";

import MessageActions from "@Modules/MessageActions";
import STRINGS from "../Constants"

import {
	getStickerUrl,
	isAnimatedSticker,
	handleSticker,
	hasEmbedPerms,
	sendMessage,
	isStickerSendable
} from "../Utils";



function sendStickerAsLink(sticker, channel) {
	if (Settings.get("sendDirectly"))
		sendMessage({ sticker, channel });
	else
		insertText(getStickerUrl(sticker.id, Settings.get("stickerSize")));
}

function handleUnsendableSticker({ user, sticker, channel }) {
	if (isAnimatedSticker(sticker) && !Settings.get("shouldSendAnimatedStickers"))
		return showToast(STRINGS.disabledAnimatedStickersErrorMessage, "info");
	if (!hasEmbedPerms(channel, user) && !Settings.get("ignoreEmbedPermissions"))
		return showToast(STRINGS.missingEmbedPermissionsErrorMessage, "info");

	sendStickerAsLink(sticker, channel);
}



export default () => {
	/**
	 * Main Patch
	 * */
	if (MessageActions)
		Patcher.instead(MessageActions, 'sendStickers', (_, args, originalFunc) => {
			const [channelId, [stickerId]] = args;
			const stickerObj = handleSticker(channelId, stickerId);
			if (stickerObj.isSendable)
				originalFunc.apply(_, args);
			else
				handleUnsendableSticker(stickerObj);
		});
	else Logger.patch("patchSendSticker");
}