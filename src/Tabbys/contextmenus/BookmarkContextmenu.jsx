import { ContextMenu } from "@Api";
import React from "@React";
import { TrashBinIcon, PenIcon, PlusIcon } from "@Components/Icon";
import { openPromptModal } from "@/components/PromptModal";
import Store from "@/Store";
import { nop } from "@Utils";
import { wrapMenuItem } from "./helper";
import { deleteBookmark, moveSubBookmarkToBookmarksAt, moveBookmarkToFolderAt, addFolder, getBookmark, openBookmarkAt, setBookmarkName, toggleBookmarkNameState, getBookmarkNameState } from "@/Store/methods";

import { createFolder, CopyUserIdItem, CopyGuildIdItem, CopyChannelIdItem, MarkAsReadItem } from "./shared";

function renameBookmark(id, parentId) {
	const bookmark = getBookmark(id, parentId);
	if (!bookmark) return;
	openPromptModal({
		title: "Bookmark Name",
		label: "Bookmark Name",
		placeholder: bookmark.name,
		initialValue: bookmark.name,
		onSubmit: name => setBookmarkName(id, name, parentId)
	});
}

export default function (id, { channelId, userId, guildId, parentId, hasUnread }) {
	const folders = Store.state.folders
		.map(({ id: folderId, name }) => {
			if (folderId === parentId) return;
			return {
				action: () => moveBookmarkToFolderAt(id, folderId, parentId),
				label: name
			};
		})
		.filter(Boolean)
		.map(wrapMenuItem);

	if (parentId) {
		if (folders.length) folders.push({ type: "separator" });
		folders.push({
			action: () => moveSubBookmarkToBookmarksAt(id, parentId),
			label: "Move To BookmarkBar"
		});
	}

	const hasFolders = folders.length > 0;

	const copies = [
		channelId && CopyChannelIdItem(channelId), 
		guildId && CopyGuildIdItem(guildId), 
		userId && CopyUserIdItem(userId)
	].filter(Boolean).map(wrapMenuItem);

	const canCopy = copies.length > 0;

	const Menu = ContextMenu.buildMenu(
		[
			MarkAsReadItem(channelId, hasUnread),
			{
				action: () => openBookmarkAt(id),
				label: "Open in new Tab",
				icon: PlusIcon
			},
			{
				action: () => renameBookmark(id, parentId),
				label: "Rename",
				icon: PenIcon
			},
			{
				type: "toggle",
				label: "Hide Name",
				active: getBookmarkNameState(id, parentId),
				action: () => toggleBookmarkNameState(id, parentId)
			},
			{ type: "separator" },

			hasFolders && {
				type: "submenu",
				label: "Move",
				items: folders
			},
			{
				action: createFolder,
				label: "Create Folder",
				icon: PlusIcon
			},
			
			canCopy && { type: "separator" },
			...copies,

			{ type: "separator" },
			{
				color: "danger",
				label: "Delete Bookmark",
				icon: TrashBinIcon,
				action: () => deleteBookmark(id, parentId)
			}
		]
			.filter(Boolean)
			.map(wrapMenuItem)
	);

	return props => <Menu {...props} />;
}
