import { Patcher } from "@Api";

import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import Toast from "@Utils/Toast";
import Plugin, { Events } from "@Utils/Plugin";

import { hasEmbedPerms } from "@Utils/Permissions";
import MessageActions from "@Modules/MessageActions";
import STRINGS from "../Constants";

import { isAnimatedSticker, sendStickerAsLink, handleSticker } from "../Utils";

function handleUnsendableSticker({ user, sticker, channel }) {
	if (isAnimatedSticker(sticker) && !Settings.state.shouldSendAnimatedStickers) return Toast.info(STRINGS.disabledAnimatedStickersErrorMessage);
	if (!hasEmbedPerms(channel, user) && !Settings.state.ignoreEmbedPermissions) return Toast.info(STRINGS.missingEmbedPermissionsErrorMessage);

	sendStickerAsLink(sticker, channel);
}

Plugin.on(Events.START, () => {
	if (!MessageActions) return Logger.patchError("SendSticker");
	const unpatch = Patcher.instead(MessageActions, "sendStickers", (_, args, originalFunc) => {
		const [channelId, [stickerId]] = args;
		const stickerObj = handleSticker(channelId, stickerId);
		if (stickerObj.isSendable) originalFunc.apply(_, args);
		else handleUnsendableSticker(stickerObj);
	});
	Plugin.once(Events.STOP, unpatch);
});
