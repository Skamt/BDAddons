import { ContextMenu } from "@Api";
import React from "@React";
import { TrashBinIcon, PenIcon, PlusIcon } from "@Components/Icon";
import { openValueModal } from "@/components/ValueModal";
import Store from "@/Store";
import { nop } from "@Utils";
import { createContextMenuItem } from "./helper";

function createFolder() {
	openValueModal({
		title: "Create Folder",
		placeholder: "New Folder Name",
		label: "New Folder Name",
		onSubmit: name => name && Store.addFolder(name)
	});
}

function renameBookmark(id) {
	const bookmark = Store.getBookmark(id);
	if (!bookmark) return;
	openValueModal({
		title: "Bookmark Name",
		label: "Bookmark Name",
		placeholder: bookmark.name,
		initialValue: bookmark.name,
		onSubmit: name => name && Store.setBookmarkName(id, name)
	});
}

export default function (id, parentId) {

	const folders = Store.state.folders.map(({ id:folderId, name }) => {
		if(parentId === folderId) return null;
		return createContextMenuItem(null, `move-to-folder-${folderId}`, () => Store.moveBookmarkToFolder(id, folderId, parentId), name)
	}).filter(Boolean);

	const Menu = ContextMenu.buildMenu([
		createContextMenuItem(null, "open-bookmark-in-new-tab", () => Store.openBookmark(id), "Open in new Tab", PlusIcon),
		createContextMenuItem(null, "rename-bookmark", () => renameBookmark(id), "Rename", PenIcon),
		{
			type: "separator"
		},
		folders.length > 0 && createContextMenuItem("submenu", "move-to-folder", createFolder, "Move To Folder", nop,null,folders),
		createContextMenuItem(null, "create-folder", createFolder, "Create Folder", PlusIcon),
		{
			type: "separator"
		},
		createContextMenuItem(null, "delete-bookmark", () => Store.removeBookmark(id, parentId), "Delete Bookmark", TrashBinIcon, "danger")
	].filter(Boolean));

	return props => <Menu {...props} />;
}
