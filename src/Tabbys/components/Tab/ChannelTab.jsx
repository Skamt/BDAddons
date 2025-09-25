import React from "@React";
import BaseTab from "./BaseTab";
import { useChannelState } from "@Utils/Hooks";
import Settings from "@Utils/Settings";
import Badge from "@/components/NumberBadge";
import TypingDots from "@/components/TypingDots";
import ChannelIcon from "@/components/ChannelIcon";
import { shallow } from "@Utils";

export default function ChannelTab({ id, path, guildId, channelId }) {
	const [showPings, showUnreads, showTyping] = Settings(_ => [_.showPings, _.showUnreads, _.showTyping], shallow);
	const { name: channelName, isDM, isTyping, channel, typingUsers, mentionCount, unreadCount, hasUnread } = useChannelState(channelId);

	return (
		<BaseTab
			id={id}
			
			hasUnread={hasUnread}
			title={channelName || path}
			icon={
				<ChannelIcon
					guildId={guildId}
					name={name}
					channel={channel}
				/>
			}>
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
		</BaseTab>
	);
}
