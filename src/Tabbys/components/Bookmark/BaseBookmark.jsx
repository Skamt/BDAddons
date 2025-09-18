// import "./styles";
import Store from "@/Store";
import React from "@React";
import { shallow } from "@Utils";
import ChannelIcon from "@/components/ChannelIcon";
import MiscIcon from "@/components/ChannelIcon/MiscIcon";
import ChannelStore from "@Stores/ChannelStore";
import { DragSource } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import { transitionTo } from "@Discord/Modules";
import { ContextMenu } from "@Api";
import BookmarkContextMenu from "@/contextmenus/BookmarkContextMenu";
import { parsePath } from "@/utils";
import { BookmarkDroppable } from "@/components/Droppable";
import { classNameFactory, join } from "@Utils/css";
import Settings from "@Utils/Settings";
import TypingDots from "@/components/TypingDots";
import { useChannelState } from "@Utils/Hooks";
import Badge from "@/components/NumberBadge";

const c = classNameFactory("bookmark");


export default function BaseBookmark({ id, path, noName, className, onClose, children, ...rest }) {
	const [showDMNames, showPings, showUnreads, showTyping] = Settings(_ => [_.showDMNames, _.showPings, _.showUnreads, _.showTyping], shallow);
	const { type, idk, channelId } = parsePath(path);
	const { name: channelName, isDM, isTyping, channel, typingUsers, mentionCount, unreadCount, hasUnread } = useChannelState(channelId);
	
	const icon = channel ? (
		<ChannelIcon
			name={channelName}
			channel={channel}
		/>
	) : (
		<MiscIcon type={type} />
	);

	const onClick = e => {
		e.stopPropagation();
		onClose?.();

		if (e.ctrlKey) Store.addTab({path});
		else transitionTo(path);
	};

	const contextmenuHandler = e => {
		// ContextMenu.open(e, BookmarkContextMenu(id), {
		// 	position: "bottom",
		// 	align: "left"
		// });
	};

	return (
		<div
			{...rest}
			onContextMenu={contextmenuHandler}
			className={join(c("container"), "no-drag", "box-border", "card", className)}
			onClick={onClick}>
			<div className={join(c("icon"), "card-icon", "icon-wrapper")}>{icon}</div>
			{!noName && <div className={join(c("name"), "card-name")}>{name || channelName || idk || type || path}</div>}
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
			{children}
		</div>
	);
}
