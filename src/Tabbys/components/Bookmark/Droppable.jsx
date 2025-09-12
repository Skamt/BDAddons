import React from "@React";
import { DropTarget } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import Store from "@/Store";
import { clsx } from "@Utils";

const c = clsx("bookmark");

const BookmarkDropTarget = DropTarget(
	[DNDTypes.BOOKMARK, DNDTypes.TAB, DNDTypes.FOLDER],
	{
		drop(me, monitor) {
			const dropped = monitor.getItem();
			if (me.id === dropped.id) return;
			// if (me.id === dropped.parentId) return;
			const itemType = monitor.getItemType();

			console.log(itemType, dropped, me);

			if (itemType === DNDTypes.TAB) {
				if (!me.parentId) {
					Store.moveTabToBookmark(dropped.id, me.bookmarkId || me.id, me.pos);
				} else {
					Store.moveTabToFolder(dropped.id, me.parentId, me.id, me.pos);
				}
			}

			if (itemType === DNDTypes.BOOKMARK) {
				if (!dropped.parentId && !me.parentId) {
					Store.moveBookmark(dropped.id, me.bookmarkId || me.id, me.pos);
				} else if (dropped.parentId && !me.parentId) {
					Store.moveBookmarkOutsideFolder(dropped.id, me.bookmarkId || me.id, dropped.parentId, me.pos);
				} else if (dropped.parentId && me.parentId) {
					Store.moveBookmarkFromFolderToFolderAt(dropped.id, me.parentId, dropped.parentId, me.id, me.pos);
				} else if (!dropped.parentId && me.parentId) {
					Store.moveBookmarkToFolderAt(dropped.id, me.parentId, me.id, me.pos);
				}
			}

			if (itemType === DNDTypes.FOLDER) {
				if (!dropped.parentId && !me.parentId) {
					Store.moveBookmark(dropped.bookmarkId || dropped.id, me.bookmarkId || me.id, me.pos);
				} else if (dropped.parentId && !me.parentId) {
					Store.moveFolderOutsideFolder(dropped.id, me.bookmarkId || me.id, dropped.parentId, me.pos);
				} else if (dropped.parentId && me.parentId) {
					Store.moveFolderFromFolderToFolderAt(dropped.id, me.parentId, dropped.parentId, me.id, me.pos);
				} else if (!dropped.parentId && me.parentId) {
					Store.moveBookmarkFolderToFolderAt(dropped.bookmarkId, dropped.id, me.parentId, me.id, me.pos);
				}
			}
		}
	},
	function (connect, monitor, props) {
		const item = monitor.getItem();
		return {
			dragInProgress: !!item,
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
			draggedIsMe: item?.id === props.id,
			dropRef: connect.dropTarget()
		};
	}
);

export default BookmarkDropTarget(({ direction, isOver, canDrop, dropRef, draggedIsMe, dragInProgress, pos }) => {
	return (
		<div
			ref={dropRef}
			className={c("droppable", direction, pos, !draggedIsMe && isOver && "over", canDrop && dragInProgress && "dragInProgress")}
		/>
	);
});
