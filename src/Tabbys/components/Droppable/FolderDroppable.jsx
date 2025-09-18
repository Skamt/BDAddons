import DroppableMarkup from "./DroppableMarkup";
import { DropTarget } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import Store from "@/Store";

import { collect } from "./shared";
import React from "@React";

const FolderDropTarget = DropTarget(
	[DNDTypes.BOOKMARK, DNDTypes.TAB, DNDTypes.FOLDER],
	{
		drop(me, monitor) {
			const dropped = monitor.getItem();
			if (me.id === dropped.id) return;
			
			const itemType = monitor.getItemType();
			switch(itemType){
				case DNDTypes.BOOKMARK:
				case DNDTypes.FOLDER:
					return Store.moveBookmark(dropped.id, me.id, me.pos);
				case DNDTypes.TAB:{
					const tab = Store.getTab(dropped.id);
					if(!tab) return;
					return Store.addBookmarkBy(tab, me.id, index => me.pos === "after" ? index + 1 : index)
				}
			}
		}
	},collect
);

const FolderDroppable = FolderDropTarget(DroppableMarkup);

export default function ({ id }) {
	return (
		<>
			<FolderDroppable
				id={id}
				pos="after"
			/>
			<FolderDroppable
				id={id}
				pos="before"
			/>
		</>
	);
}
