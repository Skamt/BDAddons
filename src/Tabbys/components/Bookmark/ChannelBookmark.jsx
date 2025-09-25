import Store from "@/Store";
import ChannelIcon from "@/components/ChannelIcon";
import Badge from "@/components/NumberBadge";
import TypingDots from "@/components/TypingDots";
import React from "@React";
import { useChannelState } from "@Utils/Hooks";
import Settings from "@Utils/Settings";
import BaseBookmark from "./BaseBookmark";
import { shallow } from "@Utils";

export default function ChannelBookmark({ name, guildId, path, channelId, children, ...rest }) {
	const [showPings, showUnreads, showTyping] = Settings(_ => [_.showPings, _.showUnreads, _.showTyping], shallow);
	const { name: channelName, isDM, isTyping, channel, typingUsers, mentionCount, unreadCount, hasUnread } = useChannelState(channelId);

	const title = name || channelName || path;
	return (
		<BaseBookmark
			{...rest}
			hasUnread={hasUnread}
			path={path}
			title={title}
			icon={
				<ChannelIcon
					guildId={guildId}
					name={title}
					channel={channel}
				/>
			}>
			{children}
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
		</BaseBookmark>
	);
}
