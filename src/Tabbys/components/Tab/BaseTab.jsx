import { getModule,Filters } from "@Webpack";
import { ContextMenu } from "@Api";
import { Store } from "@/Store";
import React, { useRef } from "@React";
import { nop, concateClassNames } from "@Utils";
import { CloseIcon, DiscordIcon } from "@Components/Icon";
import TabContextMenu from "@/contextmenus/TabContextMenu";
import { DragSource, DropTarget } from "@Discord/Modules";
import Badge from "../Badge";

const filter = Filters.byStrings("dotRadius", "dotPosition");
const TypingDots = getModule(a => a?.type?.render && filter(a.type.render), {searchExports:true});

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
					return { ...props };
				}
			},
			(props, monitor) => ({
				isDragging: !!monitor.isDragging(),
				dragRef: props.dragSource()
			})
		)(comp)
	);
}

function BaseTab({ id, path, idDM, mentionCount, isTyping, unreadCount, icon, title, dragRef, dropRef, isOver, canDrop, draggedIsMe, isDragging }) {
	const selected = Store(state => state.selectedId === id);
	const isSingleTab = Store(Store.selectors.isSingleTab);

	const tabRef = useRef(null);
	dragRef(dropRef(tabRef));

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

	const contextmenuHandler = e => {
		ContextMenu.open(e, TabContextMenu(id), {
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
			{!!mentionCount && <Badge count={mentionCount} type="ping"/>}
			{!idDM && !!unreadCount && <Badge count={unreadCount} type="unread"/> }
			{isTyping && <TypingDots dotRadius={2.5}/>}
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
