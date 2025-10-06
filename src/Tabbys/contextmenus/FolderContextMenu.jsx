import { ContextMenu } from "@Api";
import React from "@React";
import { TrashBinIcon, PenIcon, PlusIcon } from "@Components/Icon";
import { openPromptModal } from "@/components/PromptModal";
import Store from "@/Store";
import { moveSubFolderToBookmarksAt, isDescendent, moveFolderToFolderAt, deleteFolder } from "@/Store/methods";
import { createFolder } from "./shared";
import { wrapMenuItem } from "./helper";

export default function (id, { folderId, parentId }) {
	const folders = Store.state.folders
		.map(({ id: targetFolderId, name }) => {
			if (targetFolderId === folderId) return;
			if (targetFolderId === parentId) return;
			if (isDescendent(folderId, targetFolderId)) return;
			return {
				action: () => moveFolderToFolderAt(folderId, id, targetFolderId, parentId),
				label: name
			};
		})
		.filter(Boolean)
		.map(wrapMenuItem);

	if (parentId) {
		if (folders.length) folders.push({ type: "separator" });
		folders.push({
			action: () => moveSubFolderToBookmarksAt(folderId, id, parentId),
			label: "Move To BookmarkBar"
		});
	}

	const hasFolders = folders.length > 0;

	const Menu = ContextMenu.buildMenu(
		[
			{
				action: createFolder,
				label: "Create Folder",
				icon: PlusIcon
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
						onSubmit: name => name && Store.setFolderName(folderId, name)
					});
				},
				label: "Rename Folder",
				icon: PlusIcon
			},
			hasFolders && {
				type: "submenu",
				label: "Move",
				items: folders
			},
			{
				type: "separator"
			},
			{
				color: "danger",
				label: "Delete Folder",
				icon: TrashBinIcon,
				action: () => deleteFolder(folderId, id, parentId)
			}
		]
			.filter(Boolean)
			.map(wrapMenuItem)
	);

	return props => <Menu {...props} />;
}
