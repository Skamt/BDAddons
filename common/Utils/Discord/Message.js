import { getModule } from "@Webpack";
import MessageActions from "@Modules/MessageActions";
import Dispatcher from "@Modules/Dispatcher";
import PendingReplyStore from "@Stores/PendingReplyStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";

export function getReply(channelId) {
	const reply = PendingReplyStore?.getPendingReply(channelId);
	if (!reply) return {};
	Dispatcher?.dispatch({ type: "DELETE_PENDING_REPLY", channelId });
	return {
		messageReference: {
			guild_id: reply.channel.guild_id,
			channel_id: reply.channel.id,
			message_id: reply.message.id
		},
		allowedMentions: reply.shouldMention
			? undefined
			: {
					parse: ["users", "roles", "everyone"],
					replied_user: false
				}
	};
}

export function sendMessageDirectly(content, channelId) {
	if (!MessageActions?.sendMessage || typeof MessageActions.sendMessage !== "function") return;
	if (!channelId) channelId = SelectedChannelStore.getChannelId();

	return MessageActions.sendMessage(
		channelId,
		{
			validNonShortcutEmojis: [],
			content
		},
		undefined,
		getReply(channelId)
	);
}

export const insertText = (() => {
	let ComponentDispatch;
	return content => {
		if (!ComponentDispatch) ComponentDispatch = getModule(m => m.dispatchToLastSubscribed && m.emitter.listeners("INSERT_TEXT").length, { searchExports: true });
		if (!ComponentDispatch) return;
		setTimeout(() =>
			ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
				plainText: content
			})
		);
	};
})();
