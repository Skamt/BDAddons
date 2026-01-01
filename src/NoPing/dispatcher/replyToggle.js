import Plugin, { Events } from "@Utils/Plugin";
import Blacklist from "@/blacklist";
import Dispatcher from "@Modules/Dispatcher";
import PendingReplyStore from "@Stores/PendingReplyStore";

function replyToggle({ channelId }) {
	const { message, shouldMention } = PendingReplyStore.getPendingReply(channelId);
	if (!shouldMention) Blacklist.add(message.author.id);
	else Blacklist.delete(message.author.id);
}

Plugin.on(Events.START, () => {
	Dispatcher.subscribe("SET_PENDING_REPLY_SHOULD_MENTION", replyToggle);
});

Plugin.on(Events.STOP, () => {
	Dispatcher.unsubscribe("SET_PENDING_REPLY_SHOULD_MENTION", replyToggle);
});
