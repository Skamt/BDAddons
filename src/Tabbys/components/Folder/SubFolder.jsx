// import "./styles";
import Store from "@/Store";
import { FolderIcon } from "@Components/Icon";
import React, { useEffect, useState } from "@React";
import { shallow } from "@Utils";
import { classNameFactory, join } from "@Utils/css";
import Popout from "@Components/Popout";
import { SubFolderDroppable } from "@/components/Droppable";
import { DragSource } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import FolderPopoutMenu from "./FolderPopoutMenu";

import BaseFolder from "./BaseFolder";
const c = classNameFactory("folder");

const DraggableSubFolder = DragSource(DNDTypes.SUB_FOLDER, { beginDrag: a => a }, (props, monitor) => ({
	isDragging: !!monitor.isDragging(),
	dragRef: props.dragSource()
}));

function SubFolder({ id, folderId, parentId, dragRef, onClose, ...props }) {
	// const { isDragging, isOver, canDrop, folderDropRef, dragRef } = props;
	const { name, items } = Store(state => Store.getFolder(folderId), shallow) || {};

	return (
		<Popout
			position="right"
			align="top"
			spacing={20}
			renderPopout={e => (
				<FolderPopoutMenu
					folderId={folderId}
					items={items}
					onClose={onClose || e.closePopout}
				/>
			)}>
			{e => (
				<BaseFolder
					id={id}
					ref={dragRef}
					folderId={folderId}
					className={c("item")}
					onClick={e.onClick}
					parentId={parentId}
					name={name}
				>
					<SubFolderDroppable id={id} parentId={parentId}/>
				</BaseFolder>
			)}
		</Popout>
	);
}

export default DraggableSubFolder(SubFolder);