import "./styles";
import React from "@React";
import { classNameFactory, join } from "@Utils/css";

const c = classNameFactory("dnd");

export default function DroppableMarkup({ isOver, canDrop, dropRef, draggedIsMe, dragInProgress, pos }) {
	return (
		<div
			ref={dropRef}
			className={c("droppable", pos, !draggedIsMe && canDrop && isOver && "over", canDrop && dragInProgress && "dragInProgress")}
		/>
	);
}

