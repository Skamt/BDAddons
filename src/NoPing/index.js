import "./styles";
import Logger from "@Utils/Logger";
import { DOM, Patcher } from "@Api";
import patchCreatePendingReply from "./patches/patchCreatePendingReply";
import patchSendMessage from "./patches/patchSendMessage";
import patchContextMenus from "./patches/patchContextMenus";
import blacklist from "./blacklist";
import Dispatcher from "@Modules/Dispatcher";
import PendingReplyStore from "@Stores/PendingReplyStore";

function replyToggle({ channelId }) {
	const { message, shouldMention } = PendingReplyStore.getPendingReply(channelId);
	if (!shouldMention) blacklist.add(message.author.id);
	else blacklist.delete(message.author.id);
}

export default class NoPing {
	start() {
		try {
			DOM.addStyle(css);
			Dispatcher.subscribe("SET_PENDING_REPLY_SHOULD_MENTION", replyToggle);
			patchCreatePendingReply();
			patchSendMessage();
			this.unpatchContextMenu = patchContextMenus();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		this.unpatchContextMenu?.forEach?.(p => p());
		this.unpatchContextMenu = null;
		Dispatcher.unsubscribe("SET_PENDING_REPLY_SHOULD_MENTION", replyToggle);

		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}
