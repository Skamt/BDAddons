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
import Settings from "@Utils/Settings";
import { ContextMenu } from "@Api";
import TabContextMenu from "@/contextmenus/TabContextMenu";
import {parsePath} from "@/utils";
const c = clsx("tab");



function Tab({ id }) {
	const [showDMNames, showPings, showUnreads, showTyping] = Settings(_ => [_.showDMNames, _.showPings, _.showUnreads, _.showTyping], shallow);

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
			className={join(" ", c("container", isSelected && "selected", hasUnread && "unread"), "no-drag", "box-border", "rounded-full", "card")}
			onClick={onClick}>
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
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				className={join(" ", c("close-button"), "icon-wrapper", "card-button")}
				onClick={onCloseClick}>
				<CloseIcon />
			</div>
		</div>
	);
}

export default React.memo(Tab);
