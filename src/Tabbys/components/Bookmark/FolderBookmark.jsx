// import "./styles";
import Store from "@/Store";
import React from "@React";
import { shallow } from "@Utils";
import Settings from "@Utils/Settings";
import BaseBookmark from "./BaseBookmark";
import { FolderBookmarkDroppable } from "@/components/Droppable";
import { DragSource } from "@Discord/Modules";
import { DNDTypes } from "@/consts";

import { classNameFactory } from "@Utils/css";
const c = classNameFactory("folder");

const DraggableFolderBookmark = DragSource(DNDTypes.FOLDER_BOOKMARK, { beginDrag: a => a }, (props, monitor) => ({
	isDragging: !!monitor.isDragging(),
	dragRef: props.dragSource()
}));

function FolderBookmark({id, parentId, dragRef, ...rest}) {
	const bookmark = Store(state => Store.getFolderItem(parentId, id), shallow) || {};
	return (
		<BaseBookmark
			{...bookmark}
			{...rest}
			id={id}
			parentId={parentId}
			ref={dragRef}
			className={c("item")}>
			<FolderBookmarkDroppable
				id={id}
				parentId={parentId}
			/>
		</BaseBookmark>
	);
}

export default React.memo(DraggableFolderBookmark(FolderBookmark));
