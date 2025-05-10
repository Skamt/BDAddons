import { Store } from "@/Store";
import CloseIcon from "@Components/icons/CloseIcon";
import React, { useRef } from "@React";
import { nop, concateClassNames } from "@Utils";
import DiscordIcon from "@Components/icons/DiscordIcon";
import LightiningIcon from "@Components/icons/LightiningIcon";
import BookmarkIcon from "@Components/icons/BookmarkIcon";
import DuplicateIcon from "@Components/icons/DuplicateIcon";
import VectorIcon from "@Components/icons/VectorIcon";
import PinIcon from "@Components/icons/PinIcon";
import ContextMenu, { MenuLabel } from "@Components/ContextMenu";
import { DragSource, DropTarget } from "@Discord/Modules";

function DragThis(comp) {
	return DropTarget(
		"TAB",
		{
			drop(thisTab, monitor) {
				const droppedTab = monitor.getItem();
				if (thisTab.id === droppedTab.id) return;
				Store.state.moveTab(droppedTab.id, thisTab.id);
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
			"TAB",
			{
				beginDrag(props) {
					return { id: props.id };
				}
			},
			(props, monitor) => ({
				isDragging: !!monitor.isDragging(),
				dragRef: props.dragSource()
			})
		)(comp)
	);
}

function BaseTab({ id, path, selected, icon, title, dragRef, dropRef, isOver, canDrop, draggedIsMe, isDragging }) {
	const tabRef = useRef(null);
	const isSingleTab = Store(state => state.tabs.length === 1);

	const clickHandler = e => {
		e.stopPropagation();
		Store.state.setSelectedId(id);
		return console.log(id, "clickHandler");
	};

	const closeHandler = e => {
		e.stopPropagation();
		Store.state.removeTab(id);
		return console.log(id, "closeHandler");
	};

	dragRef(dropRef(tabRef));

	return (
		<div
			ref={tabRef}
			className={concateClassNames("tab", selected && "selected-tab", isDragging && "dragging", !draggedIsMe && canDrop && isOver && "candrop")}
			onClick={!selected ? clickHandler : nop}>
			<ContextMenu
				showOnContextMenu={true}
				position="bottom"
				align="left"
				menuClassName="channeltab-tab-contextmenu"
				menuItems={[
					{
						className: "channeltab-new-tab-right-menuitem",
						id: "new-tab-right",
						action: console.log,
						label: (
							<MenuLabel
								label="New Tab to Right"
								icon={<VectorIcon />}
							/>
						)
					},
					{
						className: "channeltab-new-tab-left-menuitem",
						id: "new-tab-left",
						action: console.log,
						label: (
							<MenuLabel
								label="New Tab to Left"
								icon={<VectorIcon left={true} />}
							/>
						)
					},
					{ type: "separator" },
					{
						className: "channeltab-duplicate-tab-menuitem",
						id: "duplicate-tab",
						action: console.log,
						label: (
							<MenuLabel
								label="Duplicate Tab"
								icon={<DuplicateIcon />}
							/>
						)
					},
					{
						className: "channeltab-pin-tab-menuitem",
						id: "pin-tab",
						action: console.log,
						label: (
							<MenuLabel
								label="Pin Tab"
								icon={<PinIcon />}
							/>
						)
					},

					{
						className: "channeltab-bookmark-tab-menuitem",
						id: "bookmark-tab",
						action: console.log,

						label: (
							<MenuLabel
								label="Bookmark Tab"
								icon={<BookmarkIcon />}
							/>
						)
					},
					{ type: "separator" },
					{
						className: "channeltab-close-menuitem",
						id: "close-tab",
						action: console.log,
						color: "danger",
						label: (
							<MenuLabel
								label="Close"
								icon={<CloseIcon />}
							/>
						)
					},
					{
						className: "channeltab-close-multiple-menuitem",
						id: "close-tab-multiple",
						color: "danger",

						label: (
							<MenuLabel
								label="Close Multiple"
								icon={<CloseIcon />}
							/>
						),

						children: [
							{
								className: "channeltab-close-tabs-to-right-menuitem",
								id: "close-tabs-to-right",
								color: "danger",
								action: console.log,
								label: (
									<MenuLabel
										label="Close Tabs to Right"
										icon={<VectorIcon />}
									/>
								)
							},
							{
								className: "channeltab-close-tabs-to-left-menuitem",
								id: "close-tabs-to-left",
								color: "danger",
								action: console.log,
								label: (
									<MenuLabel
										label="Close Tabs to Left"
										icon={<VectorIcon left={true} />}
									/>
								)
							},
							{
								className: "channeltab-close-other-tabs-menuitem",
								id: "close-other-tabs",
								color: "danger",
								action: console.log,
								label: (
									<MenuLabel
										label="Close Other Tabs"
										icon={<LightiningIcon />}
									/>
								)
							}
						]
					}
				]}>
				<div className="contextmenu-handler" />
			</ContextMenu>
			<div className={concateClassNames("tab-icon", !icon && "discord-icon")}>{icon || <DiscordIcon />}</div>
			<div className="tab-title ellipsis">{title || path}</div>
			{!isSingleTab && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<div
					className="tab-close"
					onClick={closeHandler}>
					<CloseIcon />
				</div>
			)}
		</div>
	);
}
export default DragThis(BaseTab);
