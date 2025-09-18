// import "./styles";
import Store from "@/Store";
import { FolderIcon } from "@Components/Icon";
import React, { useEffect, useState } from "@React";
import { shallow } from "@Utils";
import Popout from "@Components/Popout";
import { DragSource, DropTarget } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import FolderPopoutMenu from "./FolderPopoutMenu";
import BaseFolder from "./BaseFolder";
import { FolderDroppable } from "@/components/Droppable";

const DraggableFolder = DragSource(
	DNDTypes.FOLDER,
	{
		beginDrag: a => a
	},
	(props, monitor) => ({
		isDragging: !!monitor.isDragging(),
		dragRef: props.dragSource()
	})
);

const DroppableFolder = DropTarget(
	[DNDTypes.BOOKMARK, DNDTypes.TAB, DNDTypes.FOLDER],
	{
		drop(me, monitor) {
			if (!monitor.isOver({ shallow: true })) return;
			const dropped = monitor.getItem();
			if(dropped.id === me.id) return;
			const itemType = monitor.getItemType();
			switch (itemType) {
				case DNDTypes.BOOKMARK:
					return Store.moveBookmarkToFolder(me.folderId, dropped.id);
				case DNDTypes.TAB: 
					return Store.addTabToFolder(dropped.id, me.folderId);
				case DNDTypes.FOLDER: 
					return Store.moveBookmarkbarFolderToFolder(dropped.folderId, dropped.id, me.folderId);
			}
		}
	},
	(connect, monitor, props) => ({
		isOver: monitor.isOver({ shallow: true }),
		canDrop: monitor.canDrop(),
		dropRef: connect.dropTarget()
	})
);

function Folder({ id, folderId, dropRef, dragRef, ...props }) {
	const { name, items } = Store(state => Store.getFolder(folderId), shallow) || {};
	return (
		<Popout
			position="bottom"
			align="left"
			spacing={12}
			renderPopout={e => (
				<FolderPopoutMenu
					folderId={folderId}
					items={items}
					onClose={e.closePopout}
				/>
			)}>
			{e => (
				<BaseFolder
					{...props}
					ref={e => dragRef(dropRef(e))}
					id={id}
					folderId={folderId}
					data-id={id}
					onClick={e.onClick}
					name={name}>
					<FolderDroppable id={id} />
				</BaseFolder>
			)}
		</Popout>
	);
}

export default React.memo(DraggableFolder(DroppableFolder(Folder)));

// export default function SimpleFolder({ items, id, children, position = "bottom", align = "left", onClose, ...rest }) {
// 	return (
// 		<Popout
// 			position={position}
// 			align={align}
// 			spacing={12}
// 			{...rest}
// 			renderPopout={e => {

// 			}}>
// 			{children}
// 		</Popout>
// 	);
// }

// const FolderDropTarget = DropTarget(
// 	[DNDTypes.BOOKMARK, DNDTypes.TAB, DNDTypes.FOLDER],
// 	{
// 		drop(me, monitor) {
// 			if (!monitor.isOver({ shallow: true })) return;
// 			const dropped = monitor.getItem();
// 			if (me.id === dropped.id) return;
// 			if (me.id === dropped.parentId) return;

// 			const type = monitor.getItemType();
// 			switch (type) {
// 				case DNDTypes.TAB:
// 					return Store.bookmarkTab(dropped.id, me.id);
// 				case DNDTypes.BOOKMARK:
// 					return Store.moveBookmarkToFolder(dropped.id, me.id, dropped.parentId);
// 				case DNDTypes.FOLDER:
// 					return Store.moveFolderToFolder(dropped.id, me.id, dropped.parentId);
// 			}
// 		}
// 	},
// 	function (connect, monitor, props) {
// 		const item = monitor.getItem();
// 		return {
// 			dragInProgress: !!item,
// 			isOver: monitor.isOver(),
// 			canDrop: monitor.canDrop() && monitor.isOver({ shallow: true }),
// 			draggedIsMe: item?.id === props.id,
// 			folderDropRef: connect.dropTarget()
// 		};
// 	}
// );

// const DraggableFolder = DragSource(
// 	DNDTypes.FOLDER,
// 	{
// 		beginDrag: a => a
// 	},
// 	(props, monitor) => ({
// 		isDragging: !!monitor.isDragging(),
// 		dragRef: props.dragSource()
// 	})
// );
