import "./styles";
import Store from "@/Store";
import ChannelIcon from "@/components/ChannelIcon";
import MiscIcon from "@/components/ChannelIcon/MiscIcon";
import Badge from "@/components/NumberBadge";
import TypingDots from "@/components/TypingDots";
import TabContextMenu from "@/contextmenus/TabContextMenu";
import { parsePath } from "@/utils";
import { ContextMenu } from "@Api";
import { CloseIcon, PlusIcon } from "@Components/Icon";
import { DragSource } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import useStateFromStores from "@Modules/useStateFromStores";
import React from "@React";
import ChannelStore from "@Stores/ChannelStore";
import Droppable from "./Droppable";
import { clsx, shallow } from "@Utils";
import { getChannelName } from "@Utils/Channel";
import { useChannelState } from "@Utils/Hooks";
import Settings from "@Utils/Settings";
import { join } from "@Utils/String";

const c = clsx("tab");

const DraggableTab = DragSource(
	DNDTypes.TAB,
	{
		beginDrag: ({ id }) => ({ id, tab:true })
	},
	(props, monitor) => ({
		isDragging: !!monitor.isDragging(),
		dragRef: props.dragSource()
	})
);

function Tab({ id, ...props }) {
	const { isDragging, dragRef } = props;
	const [showDMNames, showPings, showUnreads, showTyping] = Settings(_ => [_.showDMNames, _.showPings, _.showUnreads, _.showTyping], shallow);
	const { path } = Store(state => Store.getTab(id), shallow) || {};
	const selectedId = Store(Store.selectors.selectedId);
	const { type, idk, channelId } = parsePath(path);
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	const { typingUsers, mentionCount, unreadCount, hasUnread } = useChannelState(channelId);

	const isSelected = selectedId === id;

	const isTyping = !!typingUsers?.length;
	const name = getChannelName(channel) || idk;
	const isDM = channel?.isDM();

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
		ContextMenu.open(e, TabContextMenu(id), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		<div
			ref={dragRef}
			onContextMenu={contextmenuHandler}
			className={join(" ", c("container", isDragging && "isDragging", isSelected && "selected", hasUnread && "unread"), "no-drag", "box-border", "rounded-full", "card")}
			onClick={onClick}>
			<Droppable id={id} pos="before"/>
			<Droppable id={id} pos="after"/>
			<div className={join(" ", c("icon"), "icon-wrapper", "card-icon")}>{icon}</div>
			{(!isDM || (isDM && showDMNames)) && <div className={join(" ", c("name"), "card-name")}>{name}</div>}
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
				className={join(" ", c("close-button"), "icon-wrapper", "card-button")}
				onClick={onCloseClick}>
				<CloseIcon />
			</div>
		</div>
	);
}

export default React.memo(DraggableTab(Tab));
