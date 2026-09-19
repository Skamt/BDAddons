import React from "@React";
import { waitForModule, Filters } from "@Webpack";

let DragSource;
let DropTarget;
waitForModule(Filters.byStrings("drag-source", "collect"), { searchExports: true }).then(a => (DragSource = a));
waitForModule(Filters.byStrings("drop-target", "collect"), { searchExports: true }).then(a => (DropTarget = a));

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

export function makeDroppable(types, drop) {
	let Result = null;
	return Comp => {
		return props => {
			if (Result) return <Result {...props} />;
			if (DropTarget) {
				Result = DropTarget(types, { drop }, collect)(Comp);
				return <Result {...props} />;
			}

			return (
				<Comp
					{...props}
					dropRef={a => {}}
				/>
			);
		};
	};
}

export function makeDraggable(type) {
	let Result = null;
	return Comp => {
		return props => {
			if (Result) return <Result {...props} />;
			if (DropTarget) {
				Result = DragSource(type, { beginDrag: a => a }, (connect, monitor) => ({
					isDragging: !!monitor.isDragging(),
					dragRef: connect.dragSource()
				}))(Comp);
				return <Result {...props} />;
			}

			return (
				<Comp
					{...props}
					dragRef={a => {}}
				/>
			);
		};
	};
}
