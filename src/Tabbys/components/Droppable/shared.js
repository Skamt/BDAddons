export function collect(connect, monitor, props) {
	const item = monitor.getItem();
	return {
		dragInProgress: !!item,
		isOver: monitor.isOver(),
		canDrop: monitor.canDrop(),
		draggedIsMe: item?.id === props.id,
		dropRef: connect.dropTarget()
	};
}
