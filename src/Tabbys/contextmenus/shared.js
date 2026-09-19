import { Dispatcher } from "@Discord/Modules";
import { openPromptModal } from "@/components/PromptModal";
import { addSubFolder, addFolder } from "@/Store/methods";
import { copy } from "@Utils";
import { IdIcon } from "@Components/Icon";

export function MarkAsReadItem(channelId, hasUnread) {
	return !channelId ? []: [
		{
			action: () =>
				channelId &&
				Dispatcher.dispatch({
					type: "CHANNEL_ACK",
					channelId,
					force: true,
				}),
			label: "Mark as read",
			disabled: !hasUnread,
		},
		{ type: "separator" },
	];
}

export function createFolder(parentId) {
	openPromptModal({
		title: "Create Folder",
		placeholder: "New Folder Name",
		label: "New Folder Name",
		required: true,
		onSubmit: (name) => {
			if (!name) return;
			if (parentId) return addSubFolder(name, parentId);
			addFolder(name);
		},
	});
}

export function copyItem(type, content) {
	const label = {
		channel: "Copy Channel ID",
		user: "Copy User ID",
		guild: "Copy Server ID",
		path: "Copy path",
	}[type];

	const item = {
		action: () => copy(content),
		label,
	};
	if (type !== "path") item.leadingAccessory = { type: "icon", icon: IdIcon };
	return item;
}
