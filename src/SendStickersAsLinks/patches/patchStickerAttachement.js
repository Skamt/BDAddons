import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { handleSticker } from "../Utils";
import MessageActions from "@Modules/MessageActions";
import { sendMessageDirectly } from "@Utils/Messages";

export default () => {
	/**
	 * Since we enabled stickers to be clickable
	 * If you click on a sticker while the textarea has some text
	 * the sticker will be added as attachment, and therefore triggers an api request
	 * So we intercept
	 * */
	if (MessageActions)
		Patcher.before(MessageActions, "sendMessage", (_, args) => {
			const [channelId, , , attachments] = args;
			if (attachments && attachments.stickerIds && attachments.stickerIds.filter) {
				const [stickerId] = attachments.stickerIds;
				const stickerObj = handleSticker(channelId, stickerId);
				if (!stickerObj.isSendable) {
					delete args[3].stickerIds;
					setTimeout(() => {
						sendMessageDirectly(stickerObj);
					}, 0);
				}
			}
		});
	else Logger.patch("patchStickerAttachement");
};