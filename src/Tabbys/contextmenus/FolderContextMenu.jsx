import { ContextMenu } from "@Api";
import React from "@React";
import { TrashBinIcon, PenIcon, PlusIcon } from "@Components/Icon";
import { openPromptModal } from "@/components/PromptModal";
import Store from "@/Store";
import {
	moveSubFolderToBookmarksAt,
	isDescendent,
	moveFolderToFolderAt,
	deleteFolder,
} from "@/Store/methods";
import { createFolder } from "./shared";
import { getFolders, sanitize, wrapMenuItem } from "./helper";

export default function (id, { folderId, parentId }) {
	const folders = getFolders((targetFolderId, name) => {
		if (targetFolderId === folderId) return;
		if (targetFolderId === parentId) return;
		if (isDescendent(folderId, targetFolderId)) return;
		return {
			action: () => moveFolderToFolderAt(folderId, id, targetFolderId, parentId),
			label: name,
		};
	});

	if (parentId) {
		if (folders.length) folders.push({ type: "separator" });
		folders.push({
			action: () => moveSubFolderToBookmarksAt(folderId, id, parentId),
			label: "Move To BookmarkBar",
		});
	}

	const hasFolders = folders.length > 0;

	const Menu = ContextMenu.buildMenu(
		sanitize([
			{
				action: () => createFolder(folderId),
				label: "Create Sub Folder",
				leadingAccessory: { type: "icon", icon: PlusIcon },
			},
			{
				action: () => {
					const folder = Store.getFolder(folderId);
					if (!folder) return;
					openPromptModal({
						title: "Edit Folder Name",
						label: "Folder Name",
						placeholder: folder.name,
						initialValue: folder.name,
						required: true,
						onSubmit: (name) => name && Store.setFolderName(folderId, name),
					});
				},
				label: "Rename Folder",
				leadingAccessory: { type: "icon", icon: PlusIcon },
			},
			hasFolders && {
				type: "submenu",
				label: "Move",
				items: folders,
			},
			{
				type: "separator",
			},
			{
				color: "danger",
				label: "Delete Folder",
				leadingAccessory: { type: "icon", icon: TrashBinIcon },
				action: () => deleteFolder(folderId, id, parentId),
			},
		]),
	);

	return (props) => <Menu {...props} />;
}
