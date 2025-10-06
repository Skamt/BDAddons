import { Dispatcher } from "@Discord/Modules";
import { openPromptModal } from "@/components/PromptModal";
import { addFolder } from "@/Store/methods";

export function MarkAsReadItem(channelId, hasUnread) {
	return {
		action: () =>
			channelId &&
			Dispatcher.dispatch({
				type: "CHANNEL_ACK",
				channelId,
				force: true
			}),
		label: "Mark as read",
		disabled: !hasUnread
	};
}

export function createFolder() {
	openPromptModal({
		title: "Create Folder",
		placeholder: "New Folder Name",
		label: "New Folder Name",
		onSubmit: name => name && addFolder(name)
	});
}
