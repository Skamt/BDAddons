import { ContextMenu } from "@Api";
import React from "@React";
import { TrashBinIcon, PenIcon, PlusIcon } from "@Components/Icon";
import { openPromptModal } from "@/components/PromptModal";
import Store from "@/Store";

import { sanitize, getCopies, getFolders, wrapMenuItem } from "./helper";
import {
	deleteBookmark,
	moveSubBookmarkToBookmarksAt,
	moveBookmarkToFolderAt,
	addFolder,
	getBookmark,
	openTabAt,
	setBookmarkName,
	toggleBookmarkNameState,
	getBookmarkNameState,
} from "@/Store/methods";

import { copyItem, createFolder, MarkAsReadItem } from "./shared";

function renameBookmark(id, parentId) {
	const bookmark = getBookmark(id, parentId);
	if (!bookmark) return;
	openPromptModal({
		title: "Bookmark Name",
		label: "Bookmark Name",
		placeholder: bookmark.username || "",
		initialValue: bookmark.name,
		onSubmit: (name) => setBookmarkName(id, name, parentId),
	});
}

export default function (id, { path, channelId, userId, guildId, parentId, hasUnread }) {
	const folders = getFolders((folderId, name) => {
		if (folderId === parentId) return;
		return {
			action: () => moveBookmarkToFolderAt(id, folderId, parentId),
			label: name,
		};
	});

	if (parentId) {
		if (folders.length) folders.push({ type: "separator" });
		folders.push({
			action: () => moveSubBookmarkToBookmarksAt(id, parentId),
			label: "Move To BookmarkBar",
		});
	}

	const Menu = ContextMenu.buildMenu(
		sanitize([
			...MarkAsReadItem(channelId, hasUnread),
			{
				action: () => openTabAt(path),
				label: "Open in new Tab",
				leadingAccessory: { type: "icon", icon: PlusIcon },
			},
			{

				action: () => renameBookmark(id, parentId),
				label: "Rename",
				leadingAccessory: { type: "icon", icon: PenIcon },
			},

			{ type: "separator" },

			folders.length > 0 && {
				type: "submenu",
				label: "Move to folder",
				items: folders,
			},
			{
				type: "toggle",
				label: "Hide Name",
				active: getBookmarkNameState(id, parentId),
				action: () => toggleBookmarkNameState(id, parentId),
			},
			{ type: "separator" },
			...getCopies({ path, channelId, userId, guildId }),
			{ type: "separator" },

			{
				action: () => createFolder(parentId),
				label: parentId ? "Create Sub Folder" : "Create Folder",
				leadingAccessory: { type: "icon", icon: PlusIcon },
			},

			{ type: "separator" },
			{
				color: "danger",
				label: "Delete Bookmark",
				leadingAccessory: { type: "icon", icon: TrashBinIcon },
				action: () => deleteBookmark(id, parentId),
			},
		]),
	);

	return (props) => <Menu {...props} />;
}
