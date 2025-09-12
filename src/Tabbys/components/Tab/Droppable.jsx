import React from "@React";
import { DropTarget } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import Store from "@/Store";
import { clsx } from "@Utils";

const c = clsx("tab");

const TabDropTarget = DropTarget(
	DNDTypes.TAB,
	{
		drop(me, monitor) {
			const dropped = monitor.getItem();
			if(me.id === dropped.id) return;
			Store.moveTab(dropped.id, me.id, me.pos);
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

export default TabDropTarget(({ isOver, canDrop, dropRef, draggedIsMe, dragInProgress, pos }) => {
	return (
		<div
			ref={dropRef}
			className={c("droppable", pos, !draggedIsMe && isOver && "over", canDrop && dragInProgress && "dragInProgress")}
		/>
	);
});
