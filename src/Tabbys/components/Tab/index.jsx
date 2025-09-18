import "./styles";
import React from "@React";
import Store from "@/Store";
import ChannelIcon from "@/components/ChannelIcon";
import MiscIcon from "@/components/ChannelIcon/MiscIcon";
import Badge from "@/components/NumberBadge";
import TypingDots from "@/components/TypingDots";
import TabContextMenu from "@/contextmenus/TabContextMenu";
import { parsePath } from "@/utils";
import { ContextMenu } from "@Api";
import { CloseIcon, PlusIcon } from "@Components/Icon";
import { DropTarget, DragSource } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import { TabDroppable } from "@/components/Droppable";
import { shallow } from "@Utils";
import { useChannelState } from "@Utils/Hooks";
import Settings from "@Utils/Settings";
import { classNameFactory, join } from "@Utils/css";

const c = classNameFactory("tab");

const DraggableTab = DragSource(DNDTypes.TAB, { beginDrag: a => a }, (props, monitor) => ({
	isDragging: !!monitor.isDragging(),
	dragRef: props.dragSource()
}));

const DroppableTab = DropTarget(
	DNDTypes.BOOKMARK,
	{
		drop(me, monitor) {
			if (!monitor.isOver({ shallow: true })) return;
			const dropped = monitor.getItem();
			Store.setTabFromBookmark(me.id, dropped.id);
		}
	},
	(connect, monitor, props) => ({
		isOver: monitor.isOver({ shallow: true }),
		canDrop: monitor.canDrop(),
		dropRef: connect.dropTarget()
	})
);

function Tab({ id, ...props }) {
	const { isDragging, isOver, canDrop, dropRef, dragRef } = props;
	const [showDMNames, showPings, showUnreads, showTyping] = Settings(_ => [_.showDMNames, _.showPings, _.showUnreads, _.showTyping], shallow);
	const { path } = Store(state => Store.getTab(id), shallow) || {};
	const selectedId = Store(Store.selectors.selectedId);
	const { type, idk, channelId } = parsePath(path);
	const { name: channelName, isDM, isTyping, channel, typingUsers, mentionCount, unreadCount, hasUnread } = useChannelState(channelId);

	const isSelected = selectedId === id;
	const name = channelName || idk || type;

	const icon = channel ? (
		<ChannelIcon
			name={name}
			channel={channel}
		/>
	) : (
		<MiscIcon type={idk} />
	);

	const onClick = e => {
		e.stopPropagation();
		Store.setSelectedId(id);
	};

	const onCloseClick = e => {
		e.stopPropagation();
		Store.removeTab(id);
	};

	const contextmenuHandler = e => {
		// ContextMenu.open(e, TabContextMenu(id), {
		// 	position: "bottom",
		// 	align: "left"
		// });
	};

	return (
		<div
			ref={e => dropRef(dragRef(e))}
			onContextMenu={contextmenuHandler}
			className={join(c("container", isOver && canDrop && "canDrop"), { isSelected, hasUnread, isDragging }, "no-drag", "box-border", "rounded-full", "card")}
			onClick={onClick}>
			<TabDroppable id={id} />
			<div className={join(c("icon"), "icon-wrapper", "card-icon")}>{icon}</div>
			{(!isDM || (isDM && showDMNames)) && <div className={join(c("name"), "card-name")}>{name}</div>}
			{showTyping && isTyping && <TypingDots users={typingUsers} />}
			{showPings && !!mentionCount && (
				<Badge
					count={mentionCount}
					type="ping"
				/>
			)}
			{showUnreads && !isDM && !!unreadCount && (
				<Badge
					count={unreadCount}
					type="unread"
				/>
			)}
			<div
				className={join(c("close-button"), "icon-wrapper", "card-button")}
				onClick={onCloseClick}>
				<CloseIcon />
			</div>
		</div>
	);
}

export default React.memo(DroppableTab(DraggableTab(Tab)));
