import DroppableMarkup from "./DroppableMarkup";
import { DropTarget } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import Store from "@/Store";
import { collect } from "./shared";
import React from "@React";

const TabDropTarget = DropTarget(
	[DNDTypes.TAB, DNDTypes.BOOKMARK],
	{
		drop(me, monitor) {
			const dropped = monitor.getItem();
			if (me.id === dropped.id) return;
			const itemType = monitor.getItemType();

			switch (itemType) {
				case DNDTypes.TAB:
					return Store.moveTab(dropped.id, me.id, me.pos);
				case DNDTypes.BOOKMARK: {
					const bookmark = Store.getBookmark(dropped.id);
					if (!bookmark) return;
					return Store.addTabBy(me.id, bookmark, index => (me.pos === "after" ? index + 1 : index));
				}
			}
		}
	},
	collect
);

const TabDroppable = TabDropTarget(DroppableMarkup);

export default function ({ id }) {
	return (
		<>
			<TabDroppable
				id={id}
				pos="after"
			/>
			<TabDroppable
				id={id}
				pos="before"
			/>
		</>
	);
}
