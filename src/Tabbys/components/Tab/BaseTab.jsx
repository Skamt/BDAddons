import { getModule, Filters } from "@Webpack";
import { ContextMenu } from "@Api";
import { Store } from "@/Store";
import React, { useRef } from "@React";
import { getUserName, nop, concateClassNames } from "@Utils";
import { CloseIcon } from "@Components/Icon";
import TabContextMenu from "@/contextmenus/TabContextMenu";
import { DragSource, DropTarget } from "@Discord/Modules";
import Badge from "../Badge";
import Tooltip from "@Components/Tooltip";
import Settings from "@Utils/Settings";

const filter = Filters.byStrings("dotRadius", "dotPosition");
const TypingDots = getModule(a => a?.type?.render && filter(a.type.render), { searchExports: true });

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
				beginDrag({ id, path }) {
					return { id, path };
				}
			},
			(props, monitor) => {
				return {
					isDragging: !!monitor.isDragging(),
					dragRef: props.dragSource()
				};
			}
		)(comp)
	);
}

export default DragThis(function BaseTab(props) {
	const { id, path, icon, title, isSingle } = props;
	const { isDM, mentionCount, typingUsers, unreadCount, hasUnread } = props;
	const { dragRef, dropRef, isOver, canDrop, draggedIsMe, isDragging } = props;
	const showUnreads = Settings(Settings.selectors.showUnreads);
	const showPings = Settings(Settings.selectors.showPings);
	const showDMNames = Settings(Settings.selectors.showDMNames);
	const showTyping = Settings(Settings.selectors.showTyping);
	const selected = Store(state => state.selectedId === id);
	const tabRef = useRef(null);
	const isTyping = !!typingUsers?.length;
	const typingUsersNames = typingUsers?.map(getUserName).join(", ");

	dragRef(dropRef(tabRef));

	const clickHandler = e => {
		e.stopPropagation();
		Store.state.setSelectedId(id);
	};

	const closeHandler = e => {
		e.stopPropagation();
		Store.state.removeTab(id);
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
			className={concateClassNames("tab flex-center", selected && "selected-tab", isDragging && "dragging", !draggedIsMe && canDrop && isOver && "candrop")}
			onClick={!selected ? clickHandler : nop}>
			<div className="tab-icon flex-center round">{icon}</div>
			{!isDM && <div className="tab-title ellipsis">{title || path}</div>}
			{isDM && showDMNames && <div className="tab-title ellipsis">{title || path}</div>}
			{showPings && !!mentionCount && (
				<Badge
					count={mentionCount}
					type="ping"
				/>
			)}
			{showUnreads && !isDM && hasUnread && (
				<Badge
					count={unreadCount}
					type="unread"
				/>
			)}
			{showTyping && isTyping && (
				<Tooltip note={isTyping ? typingUsersNames : null}>
					<div className="typing-dots flex-center">
						<TypingDots dotRadius={2.5} />
					</div>
				</Tooltip>
			)}
			{!isSingle && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<div
					className="tab-close flex-center round"
					onClick={closeHandler}>
					<CloseIcon className="parent-dim" />
				</div>
			)}
		</div>
	);
});
