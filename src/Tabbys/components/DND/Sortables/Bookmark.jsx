import DroppableMarkup from "./DroppableMarkup";
import { DNDTypes } from "@/consts";
import Store from "@/Store";
import { makeDroppable } from "../shared";
import React from "@React";
import { moveSubFolderToBookmarksAt, moveSubBookmarkToBookmarksAt, bookmarkTabAt } from "@/Store/methods";

const Bookmark = makeDroppable(
	[DNDTypes.BOOKMARK, DNDTypes.TAB, DNDTypes.FOLDER, DNDTypes.SUB_BOOKMARK, DNDTypes.SUB_FOLDER],

	(me, monitor) => {
		const dropped = monitor.getItem();
		if (me.id === dropped.id) return;

		const itemType = monitor.getItemType();
		switch (itemType) {
			case DNDTypes.BOOKMARK:
			case DNDTypes.FOLDER:
				return Store.reOrderBookmarks(dropped.id, me.id, me.pos);
			case DNDTypes.TAB:
				return bookmarkTabAt(dropped.id, me.id, me.pos);
			case DNDTypes.SUB_BOOKMARK:
				return moveSubBookmarkToBookmarksAt(dropped.id, dropped.parentId, me.id, me.pos);
			case DNDTypes.SUB_FOLDER:
				return moveSubFolderToBookmarksAt(dropped.folderId, dropped.id, dropped.parentId, me.id, me.pos);
		}
	}
)(DroppableMarkup);

export default function ({ id }) {
	return (
		<>
			<Bookmark
				id={id}
				pos="before"
			/>
			<Bookmark
				id={id}
				pos="after"
			/>
		</>
	);
}
