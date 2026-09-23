import { before } from "@common/Patcher";
import MessageActions from "@Modules/MessageActions";
import { sendStickerAsLink, handleSticker } from "../Utils";
import Dispatcher from "@Modules/Dispatcher";
import Plugin from "@common/Plugin";

const replyInterceptor = {
	handler(a) {
		if (a.type !== "DELETE_PENDING_REPLY") return;
		delete a.channelId;
	},
	on() {
		Dispatcher.addInterceptor(this.handler);
	},
	off() {
		Dispatcher._interceptors.splice(Dispatcher._interceptors.indexOf(this.handler), 1);
	},
};

Plugin.onStart(() => {
	before(MessageActions, "sendMessage", ({ args }) => {
		const [channelId, , , attachments] = args;
		if (attachments?.stickerIds?.filter) {
			const [stickerId] = attachments.stickerIds;
			const { isSendable, sticker, channel } = handleSticker(channelId, stickerId);
			if (!isSendable) {
				replyInterceptor.on();
				args[3].stickerIds = undefined;
				setTimeout(() => {
					replyInterceptor.off();
					sendStickerAsLink(sticker, channel);
				});
			}
		}
	});
});
