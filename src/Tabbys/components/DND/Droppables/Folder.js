import { DNDTypes } from "@/consts";
import Store from "@/Store";
import { moveFolderToFolderAt, moveBookmarkToFolderAt,   addTabToFolderAt } from "@/Store/methods";
import { makeDraggable, makeDroppable } from "../shared";

export default comp =>
	makeDroppable(
		[DNDTypes.BOOKMARK, DNDTypes.SUB_BOOKMARK, DNDTypes.TAB, DNDTypes.FOLDER, DNDTypes.SUB_FOLDER],

		(me, monitor) => {
			if (!monitor.isOver({ shallow: true })) return;
			const dropped = monitor.getItem();
			if (dropped.id === me.id) return;
			if (me.folderId === dropped.parentId) return;

			const itemType = monitor.getItemType();
			switch (itemType) {
				case DNDTypes.BOOKMARK:
					return moveBookmarkToFolderAt(dropped.id, me.folderId);
				case DNDTypes.TAB:
					return addTabToFolderAt(dropped.id,me.folderId);
				case DNDTypes.FOLDER:
					return moveFolderToFolderAt(dropped.folderId, dropped.id, me.folderId);
				case DNDTypes.SUB_BOOKMARK:
					return moveBookmarkToFolderAt(dropped.id, me.folderId, dropped.parentId);
				case DNDTypes.SUB_FOLDER:
					return moveFolderToFolderAt(dropped.folderId, dropped.id, me.folderId, dropped.parentId);
			}
		}
	)(comp);
