import { DNDTypes } from "@/consts";
import Store from "@/Store";
import { makeDraggable, makeDroppable } from "../shared";
import { setTabFromBookmark } from "@/Store/methods";

const DraggableTab = makeDraggable(DNDTypes.TAB);

const DroppableTab = makeDroppable(
	[DNDTypes.BOOKMARK, DNDTypes.SUB_BOOKMARK],

	(me, monitor) => {
		if (!monitor.isOver({ shallow: true })) return;
		const dropped = monitor.getItem();
		setTabFromBookmark(me.id, dropped.id, dropped.parentId);
	}
);

export default comp => DraggableTab(DroppableTab(comp));
