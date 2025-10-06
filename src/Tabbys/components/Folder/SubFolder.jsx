import Store from "@/Store";
import { FolderIcon } from "@Components/Icon";
import React, { useEffect, useState } from "@React";
import { shallow } from "@Utils";
import { classNameFactory, join } from "@Utils/css";
import Popout from "@Components/Popout";
import FolderPopoutMenu from "./FolderPopoutMenu";
import BaseFolder from "./BaseFolder";
import { makeDraggable } from "@/components/DND/shared";
import { SubBookmarkSortable, FolderDroppable } from "@/components/DND";
import { DNDTypes } from "@/consts";

const c = classNameFactory("folder");

function SubFolder({ id, folderId, parentId, dragRef, dropRef, onClose, ...props }) {
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
					{...props}
					ref={e => dragRef(dropRef(e))}
					id={id}
					channelIds={items.map(a => a.channelId).filter(Boolean)}
					folderId={folderId}
					parentId={parentId}
					className={c("item")}
					onClick={e.onClick}
					name={name}>
					<SubBookmarkSortable
						id={id}
						parentId={parentId}
					/>
				</BaseFolder>
			)}
		</Popout>
	);
}

export default makeDraggable(DNDTypes.SUB_FOLDER)(FolderDroppable(SubFolder));
