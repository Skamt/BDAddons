import "./styles";
import Store from "@/Store";
import React from "@React";
import { getChannelName } from "@Utils/Channel";
import { useChannelState } from "@Utils/Hooks";
import ChannelStore from "@Stores/ChannelStore";
import { PlusIcon, CloseIcon } from "@Components/Icon";
import ChannelIcon from "@/components/ChannelIcon";
import MiscIcon from "@/components/ChannelIcon/MiscIcon";
import Badge from "@/components/NumberBadge";
import TypingDots from "@/components/TypingDots";
import { join } from "@Utils/String";
import { shallow, clsx } from "@Utils";
import useStateFromStores from "@Modules/useStateFromStores";

import { ContextMenu } from "@Api";
import TabContextMenu from "@/contextmenus/TabContextMenu";
const c = clsx("tab");

function parsePath(path) {
	const [, type, idk, channelId, , threadId] = path.split("/");
	return { type, idk, channelId: threadId || channelId };
}

function Tab({ id }) {
	const { path } = Store(state => Store.getTab(id), shallow) || {};
	const selectedId = Store(Store.selectors.selectedId);
	const isSelected = selectedId === id;

	const { type, idk, channelId } = parsePath(path);

	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	const { typingUsers, mentionCount, unreadCount, hasUnread } = useChannelState(channelId);
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
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			onContextMenu={contextmenuHandler}
			className={join(" ", c("container", isSelected && "selected", hasUnread && "unread"), "card")}
			onClick={onClick}>
			<div className={join(" ", c("icon"), "card-icon")}>{icon}</div>
			<div className={join(" ", c("name"), "card-name")}>{name}</div>
			{!!mentionCount && (
				<Badge
					count={mentionCount}
					type="ping"
				/>
			)}
			{!isDM && !!unreadCount && (
				<Badge
					count={unreadCount}
					type="unread"
				/>
			)}

			{isTyping && <TypingDots users={typingUsers} />}

			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				className={join(" ", c("close-button"), "card-button")}
				onClick={onCloseClick}>
				<CloseIcon />
			</div>
		</div>
	);
}

export default React.memo(Tab);
