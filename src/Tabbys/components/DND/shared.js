import { DropTarget, DragSource } from "@Discord/Modules";

export function collect(connect, monitor, props) {
	const item = monitor.getItem();
	return {
		dragInProgress: !!item,
		isOver: monitor.isOver({ shallow: true }),
		canDrop: monitor.canDrop(),
		draggedIsMe: item?.id === props.id,
		dropRef: connect.dropTarget()
	};
}

export function makeDraggable(type) {
	return DragSource(type, { beginDrag: a => a }, (connect, monitor) => ({
		isDragging: !!monitor.isDragging(),
		dragRef: connect.dragSource()
	}));
}

export function makeDroppable(types, drop) {
	return DropTarget(types, { drop }, collect);
}
