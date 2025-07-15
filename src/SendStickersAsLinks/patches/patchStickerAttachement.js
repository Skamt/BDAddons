import { Patcher } from "@Api";
import Logger from "@Utils/Logger";

import MessageActions from "@Modules/MessageActions";
import { sendMessageDirectly } from "@Utils/Messages";
import { getStickerUrl, sendStickerAsLink, handleSticker } from "../Utils";

import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	if (!MessageActions) return Logger.patchError("StickerAttachement");
	const unpatch = Patcher.before(MessageActions, "sendMessage", (_, args) => {
		const [channelId, , , attachments] = args;
		if (attachments?.stickerIds?.filter) {
			const [stickerId] = attachments.stickerIds;
			const { isSendable, sticker, channel } = handleSticker(channelId, stickerId);
			if (!isSendable) {
				args[3].stickerIds = undefined;
				setTimeout(() => sendStickerAsLink(sticker, channel));
			}
		}
	});
	Plugin.once(Events.STOP, unpatch);
});
