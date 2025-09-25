import { DNDTypes } from "@/consts";
import Store from "@/Store";
import { makeDraggable, makeDroppable } from "../shared";

const DraggableTab = makeDraggable(DNDTypes.TAB);

const DroppableTab = makeDroppable(
	[DNDTypes.BOOKMARK, DNDTypes.SUB_BOOKMARK],
	(me, monitor) => {
		if (!monitor.isOver({ shallow: true })) return;
		const dropped = monitor.getItem();

		const itemType = monitor.getItemType();
		switch (itemType) {
			case DNDTypes.BOOKMARK:
				return Store.setTabFromBookmark(me.id, dropped.id);
			case DNDTypes.SUB_BOOKMARK: {
				return Store.setTabFromSubBookmark(me.id, dropped.parentId, dropped.id);
			}
		}
	}
);

export default comp => DraggableTab(DroppableTab(comp));
