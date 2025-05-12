import { ContextMenu } from "@Api";
import { Store } from "@/Store";
import CloseIcon from "@Components/icons/CloseIcon";
import React, { useRef } from "@React";
import { nop, concateClassNames } from "@Utils";
import DiscordIcon from "@Components/icons/DiscordIcon";
import TabContextMenu from "@/contextmenus/TabContextMenu";
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

function BaseTab({ tabId, path, icon, title, dragRef, dropRef, isOver, canDrop, draggedIsMe, isDragging }) {
	const selected = Store(state => state.selectedId === tabId);
	const isSingleTab = Store(Store.selectors.isSingleTab);

	const tabRef = useRef(null);
	dragRef(dropRef(tabRef));

	const clickHandler = e => {
		e.stopPropagation();
		Store.state.setSelectedId(tabId);
		return console.log(tabId, "clickHandler");
	};

	const closeHandler = e => {
		e.stopPropagation();
		Store.state.removeTab(tabId);
		return console.log(tabId, "closeHandler");
	};

	const contextmenuHandler = e => {
		ContextMenu.open(e, TabContextMenu.bind({tabId}), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			onContextMenu={contextmenuHandler}
			ref={tabRef}
			className={concateClassNames("tab", selected && "selected-tab", isDragging && "dragging", !draggedIsMe && canDrop && isOver && "candrop")}
			onClick={!selected ? clickHandler : nop}>
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
