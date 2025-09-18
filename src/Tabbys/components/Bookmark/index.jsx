// import "./styles";
import Store from "@/Store";
import React from "@React";
import { shallow } from "@Utils";
import { BookmarkDroppable } from "@/components/Droppable";
import BaseBookmark from "./BaseBookmark";
import { DragSource } from "@Discord/Modules";
import { DNDTypes } from "@/consts";


const DraggableBookmark = DragSource(
	DNDTypes.BOOKMARK,
	{
		beginDrag: a => a
	},
	(props, monitor) => ({
		isDragging: !!monitor.isDragging(),
		dragRef: props.dragSource()
	})
);

function Bookmark({ id, dragRef, ...rest }) {
	
	const bookmark = Store(state => Store.getBookmark(id), shallow) || {};
	return (
		<BaseBookmark
			{...bookmark}
			{...rest}
			id={id}
			data-id={id}
			ref={dragRef}>
			<BookmarkDroppable id={id} />
		</BaseBookmark>
	);
}

export default React.memo(DraggableBookmark(Bookmark));
