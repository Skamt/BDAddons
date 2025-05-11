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
				Store.state.swapTab(droppedTab.id, thisTab.id);
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

function d(id="", action=nop, label="Unknown", icon=null, color="", children=[]) {
	return {
		className: `channeltab-${id}-menuitem`,
		id,
		color,
		action,
		children,
		label: (
			<MenuLabel
				label={label}
				icon={icon}
			/>
		)
	};
}

function BaseTab({ id, path,  icon, title, dragRef, dropRef, isOver, canDrop, draggedIsMe, isDragging }) {
	const selected = Store(state => state.selectedId === id);
	const isSingleTab = Store(Store.selectors.isSingleTab);

	const tabRef = useRef(null);

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
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
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
					d("new-tab-right", console.log, "New Tab to Right", <VectorIcon />),
					d("new-tab-left", console.log, "New Tab to Left", <VectorIcon left={true} />),
					{ type: "separator" },
					d("duplicate-tab", console.log, "Duplicate Tab", <DuplicateIcon />),
					d("pin-tab", console.log, "Pin Tab", <PinIcon />),
					d("bookmark-tab", console.log, "Bookmark Tab", <BookmarkIcon />),
					{ type: "separator" },
					d("close-tab", console.log, "Close", <CloseIcon />, "danger"),
					d("close-tab-multiple", console.log, "Close Multiple", <CloseIcon />, "danger", [
						d("close-tabs-to-right", console.log, "Close Tabs to Right", <VectorIcon />, "danger"),
						d("close-tabs-to-left", console.log, "Close Tabs to Left", <VectorIcon  left={true} />, "danger"),
						d("close-other-tabs", console.log, "Close Other Tabs", <LightiningIcon />, "danger"),
					])					
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
