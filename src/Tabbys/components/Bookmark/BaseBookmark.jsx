import BookmarkContextmenu from "@/contextmenus/BookmarkContextmenu";
import { ContextMenu } from "@Api";
import { transitionTo } from "@Discord/Modules";
import React, { useRef } from "@React";
import { concateClassNames } from "@Utils";
import { DragSource, DropTarget } from "@Discord/Modules";
import { Store } from "@/Store";

function DragThis(comp) {
	return DropTarget(
		"BOOKMARK",
		{
			drop(thisBookmark, monitor) {
				const droppedBookmark = monitor.getItem();
				if (thisBookmark.id === droppedBookmark.id) return;
				Store.state.swapBookmark(droppedBookmark.id, thisBookmark.id);
			}
		},
		(connect, monitor, props) => {
			return {
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
				dropRef: connect.dropTarget(),
				draggedIsMe: monitor.getItem()?.id === props.id
			};
		}
	)(
		DragSource(
			"BOOKMARK",
			{
				beginDrag(props) {
					return { ...props };
				}
			},
			(props, monitor) => {
				return {
					isDragging: !!monitor.isDragging(),
					dragRef: props.dragSource()
				};
			}
		)(comp)
	);
}

function BaseBookmark(props) {
	const { id, path, icon, title, className } = props;
	const { dragRef, dropRef, isOver, canDrop, draggedIsMe, isDragging } = props;

	const bookmarkRef = useRef(null);
	dropRef(dragRef(bookmarkRef));

	const clickHandler = e => {
		e.stopPropagation();
		if (!path) return console.log(id, "no path");
		transitionTo(path);
	};

	const contextmenuHandler = e => {
		ContextMenu.open(e, BookmarkContextmenu(id), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			ref={bookmarkRef}
			className={concateClassNames("bookmark flex-center", className && className, isDragging && "dragging", !draggedIsMe && canDrop && isOver && "candrop")}
			onContextMenu={contextmenuHandler}
			onClick={clickHandler}>
			<div className="bookmark-icon flex-center round">{icon}</div>
			<div className="bookmark-title ellipsis">{title || path}</div>
		</div>
	);
}

export default DragThis(BaseBookmark);
