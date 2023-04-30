import { Patcher } from "@Api";

import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import { sendMessageDirectly, insertText } from "@Utils/Messages";

import { hasEmbedPerms } from "@Utils/Permissions"
import MessageActions from "@Modules/MessageActions";
import STRINGS from "../Constants"

import {
	getStickerUrl,
	isAnimatedSticker,
	handleSticker
} from "../Utils";


function sendStickerAsLink(sticker, channel) {
	const content = getStickerUrl(sticker.id, Settings.get("stickerSize"));
	if (Settings.get("sendDirectly")) {
		try { return sendMessageDirectly(channel, content); } catch { Toast.error("Could not send directly."); }
	}
	insertText(content);
}

function handleUnsendableSticker({ user, sticker, channel }) {
	if (isAnimatedSticker(sticker) && !Settings.get("shouldSendAnimatedStickers"))
		return Toast.info(STRINGS.disabledAnimatedStickersErrorMessage);
	if (!hasEmbedPerms(channel, user) && !Settings.get("ignoreEmbedPermissions"))
		return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);

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