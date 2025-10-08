import { DNDTypes } from "@/consts";
import Store from "@/Store";
import { makeDraggable, makeDroppable } from "../shared";
import { setTabFromBookmark } from "@/Store/methods";

const DraggableTab = makeDraggable(DNDTypes.TAB);

const DroppableTab = makeDroppable(
	[DNDTypes.BOOKMARK, DNDTypes.DRAGGABLE_GUILD_CHANNEL, DNDTypes.SUB_BOOKMARK],

	(me, monitor) => {
		if (!monitor.isOver({ shallow: true })) return;
		const dropped = monitor.getItem();

		const itemType = monitor.getItemType();
		switch (itemType) {
			case DNDTypes.BOOKMARK:
			case DNDTypes.SUB_BOOKMARK:
				return setTabFromBookmark(me.id, dropped.id, dropped.parentId);
			case DNDTypes.DRAGGABLE_GUILD_CHANNEL:
				return Store.setTabPath(me.id, `/channels/${dropped.guildId}/${dropped.id}`);
		}
	}
);

export default comp => DraggableTab(DroppableTab(comp));
