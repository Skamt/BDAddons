import DroppableMarkup from "./DroppableMarkup";
import Store from "@/Store";
import React from "@React";
import { makeDroppable } from "../shared";
import { addTabToFolderAt, moveFolderToFolderAt, moveBookmarkToFolderAt } from "@/Store/methods";
import { DNDTypes } from "@/consts";

const SubBookmark = makeDroppable(
	[DNDTypes.SUB_BOOKMARK, DNDTypes.SUB_FOLDER, DNDTypes.FOLDER, DNDTypes.TAB, DNDTypes.BOOKMARK],

	(me, monitor) => {
		const dropped = monitor.getItem();
		if (me.id === dropped.id) return;
		if (me.parentId === dropped.folderId) return;
		const itemType = monitor.getItemType();
		switch (itemType) {
			case DNDTypes.SUB_BOOKMARK: {
				if (me.parentId === dropped.parentId) Store.reOrderFolder(me.parentId, dropped.id, me.id, me.pos);
				else moveBookmarkToFolderAt(dropped.id, me.parentId, dropped.parentId, me.id, me.pos);
				return;
			}
			case DNDTypes.SUB_FOLDER: {
				if (me.parentId === dropped.parentId) Store.reOrderFolder(me.parentId, dropped.id, me.id, me.pos);
				else moveFolderToFolderAt(dropped.folderId, dropped.id, me.parentId, dropped.parentId, me.id, me.pos);
				return;
			}
			case DNDTypes.TAB:
				return addTabToFolderAt(dropped.id, me.parentId, me.id, me.pos);
			case DNDTypes.BOOKMARK:
				return moveBookmarkToFolderAt(dropped.id, me.parentId, dropped.parentId, me.id, me.pos);

			case DNDTypes.FOLDER: {
				return moveFolderToFolderAt(dropped.folderId, dropped.id, me.parentId, dropped.parentId, me.id, me.pos);
			}
		}
	}
)(DroppableMarkup);

export default function (props) {
	return (
		<>
			<SubBookmark
				{...props}
				pos="before"
			/>
			<SubBookmark
				{...props}
				pos="after"
			/>
		</>
	);
}
