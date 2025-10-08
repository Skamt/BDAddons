import { Dispatcher } from "@Discord/Modules";
import { openPromptModal } from "@/components/PromptModal";
import { addFolder } from "@/Store/methods";
import { copy } from "@Utils";
import { IdIcon } from "@Components/Icon";

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

export function CopyChannelIdItem(id) {
	return {
		action: () => copy(id),
		label: "Copy Channel ID",
		icon: IdIcon
	};
}

export function CopyUserIdItem(id) {
	return {
		action: () => copy(id),
		label: "Copy User ID",
		icon: IdIcon
	};
}

export function CopyGuildIdItem(id) {
	return {
		action: () => copy(id),
		label: "Copy Server ID",
		icon: IdIcon
	};
}

export function CopyPathItem(path) {
	return {
		action: () => copy(path),
		label: "Copy Path",
	};
}
