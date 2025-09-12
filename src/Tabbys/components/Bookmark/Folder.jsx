// import "./styles";
import Store from "@/Store";
import { FolderIcon } from "@Components/Icon";
import React, { useEffect, useState } from "@React";
import { clsx, shallow } from "@Utils";
import { join } from "@Utils/String";
import Popout from "@Components/Popout";
import Bookmark from "@/components/Bookmark";
import Heading from "@Modules/Heading";
import { ContextMenu } from "@Api";
import FolderContextMenu from "@/contextmenus/FolderContextMenu";
import Droppable from "./Droppable";
import { DragSource, DropTarget } from "@Discord/Modules";
import { DNDTypes } from "@/consts";

const c = clsx("folder");

const FolderDropTarget = DropTarget(
	[DNDTypes.BOOKMARK, DNDTypes.TAB, DNDTypes.FOLDER],
	{
		drop(me, monitor) {
			if (!monitor.isOver({ shallow: true })) return;
			const dropped = monitor.getItem();
			if (me.id === dropped.id) return;
			if (me.id === dropped.parentId) return;

			const type = monitor.getItemType();
			switch (type) {
				case DNDTypes.TAB:
					return Store.bookmarkTab(dropped.id, me.id);
				case DNDTypes.BOOKMARK:
					return Store.moveBookmarkToFolder(dropped.id, me.id, dropped.parentId);
				case DNDTypes.FOLDER:
					return Store.moveFolderToFolder(dropped.id, me.id, dropped.parentId);
			}
		}
	},
	function (connect, monitor, props) {
		const item = monitor.getItem();
		return {
			dragInProgress: !!item,
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop() && monitor.isOver({ shallow: true }),
			draggedIsMe: item?.id === props.id,
			folderDropRef: connect.dropTarget()
		};
	}
);

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

export function SimpleFolder({ items, id, children, position = "bottom", align = "left", onClose, ...rest }) {
	return (
		<Popout
			position={position}
			align={align}
			spacing={12}
			{...rest}
			renderPopout={e => {
				const isEmpty = items.length === 0;

				return (
					<div className="overflow-popout">
						{isEmpty ? (
							<div className={c("empty")}>(Empty)</div>
						) : (
							items.map(item => {
								return item.folderId ? (
									<Folder
										className={c("item")}
										onClose={onClose || e.closePopout}
										position="right"
										align="top"
										submenu={true}
										key={item.id}
										parentId={id}
										id={item.folderId}
									/>
								) : (
									<Bookmark
										className={c("item")}
										parentId={id}
										id={item.id}
										submenuItem={true}
										key={item.id}
										onClose={onClose || e.closePopout}
									/>
								);
							})
						)}
					</div>
				);
			}}>
			{children}
		</Popout>
	);
}

const Folder = DraggableFolder(
	FolderDropTarget(({ className, submenu, id, bookmarkId, position, parentId, align, onClose, ...props }) => {
		const { isDragging, isOver, canDrop, folderDropRef, dragRef } = props;
		const { name, items } = Store(state => Store.getFolder(id), shallow) || {};
		// const [show, setShow] = useState(false);

		const contextmenuHandler = e => {
			ContextMenu.open(e, FolderContextMenu(id), {
				position: "bottom",
				align: "left"
			});
		};

		// useEffect(() => {
		// 	if (items.length && isOver && canDrop) setShow(!0);
		// }, [items, isOver, canDrop]);

		return (
			<SimpleFolder
				position={position}
				align={align}
				id={id}
				// onRequestOpen={() => setShow(!0)}
				// onRequestClose={() => setShow(!1)}
				// shouldShow={show}
				items={items}>
				{e => {
					return (
						<div
							ref={e => dragRef(folderDropRef(e))}
							onContextMenu={contextmenuHandler}
							data-id={id}
							className={join(" ", c("container", isOver && canDrop && "canDrop", isDragging && "isDragging"), "box-border", "no-drag", "card", className)}
							onClick={e.onClick}>
							<Droppable
								id={id}
								parentId={parentId}
								bookmarkId={bookmarkId}
								pos="before"
								submenu={submenu}
								direction={submenu ? "vertical" : "horizontal"}
							/>
							<Droppable
								id={id}
								parentId={parentId}
								bookmarkId={bookmarkId}
								submenu={submenu}
								pos="after"
								direction={submenu ? "vertical" : "horizontal"}
							/>
							<div className={join(" ", c("icon"), "icon-wrapper", "card-icon")}>{<FolderIcon />}</div>
							<div className={join(" ", c("name"), "card-name")}>{name}</div>
						</div>
					);
				}}
			</SimpleFolder>
		);
	})
);

export default Folder;
