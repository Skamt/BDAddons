import DroppableMarkup from "./DroppableMarkup";
import { DropTarget } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import Store from "@/Store";
import React from "@React";

import { collect } from "./shared";

const FolderBookmarkDropTarget = DropTarget(
	[DNDTypes.FOLDER_BOOKMARK, DNDTypes.SUB_FOLDER, DNDTypes.FOLDER, DNDTypes.TAB, DNDTypes.BOOKMARK],
	{
		drop(me, monitor) {
			const dropped = monitor.getItem();
			if (me.id === dropped.id) return;

			const itemType = monitor.getItemType();
			switch (itemType) {
				case DNDTypes.FOLDER_BOOKMARK: {
					if (me.parentId === dropped.parentId) Store.moveFolderBookmark(me.parentId, dropped.id, me.id, me.pos);
					else {
						const target = Store.getFolderItem(dropped.parentId, dropped.id);
						if (!target) return;
						Store.addToFolderBy(me.parentId, target, me.id, index => (me.pos === "after" ? index + 1 : index));
						Store.removeItemFromFolder(dropped.parentId, dropped.id);
					}
					return;
				}
				case DNDTypes.SUB_FOLDER: {
					if (me.parentId === dropped.parentId) Store.moveFolderBookmark(me.parentId, dropped.id, me.id, me.pos);
					else {
						Store.addToFolderBy(me.parentId, { folderId: dropped.folderId }, me.id, index => (me.pos === "after" ? index + 1 : index));
						Store.removeItemFromFolder(dropped.parentId, dropped.id);
					}
					return;
				}

				case DNDTypes.TAB: {
					const tab = Store.getTab(dropped.id);
					if (!tab) return;
					return Store.addToFolderBy(me.parentId, tab, me.id, index => (me.pos === "after" ? index + 1 : index));
				}

				case DNDTypes.BOOKMARK: {
					const bookmark = Store.getBookmark(dropped.id);
					if (!bookmark) return;
					Store.addToFolderBy(me.parentId, bookmark, me.id, index => (me.pos === "after" ? index + 1 : index));
					Store.removeBookmark(dropped.id);
					return;
				}
				case DNDTypes.FOLDER: {
					Store.addToFolderBy(me.parentId, { folderId: dropped.folderId }, me.id, index => (me.pos === "after" ? index + 1 : index));
					Store.removeBookmark(dropped.id);
					return;
				}
			}
		}
	},collect
);

const FolderBookmarkDroppable = FolderBookmarkDropTarget(DroppableMarkup);

export default function (props) {
	return (
		<>
			<FolderBookmarkDroppable
				{...props}
				pos="before"
			/>
			<FolderBookmarkDroppable
				{...props}
				pos="after"
			/>
		</>
	);
}
