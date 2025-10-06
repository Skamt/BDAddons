import Badge from "@/components/NumberBadge";
import TypingDots from "@/components/TypingDots";
import React from "@React";
import { useChannelsState } from "@Utils/Hooks";
import Settings from "@Utils/Settings";
import { shallow } from "@Utils";

function getPropNames(type) {
	return ["Pings", "Unreads", "Typing"].map(a => `show${type}${a}`);
}

export default function ChannelStatus({ channelIds, type, isDM }) {
	const { isTyping, typingUsers, mentionCount, unreadCount } = useChannelsState(channelIds);
	const [showPings, showUnreads, showTyping] = Settings(state => getPropNames(type).map(a => state[a]), shallow);

	return (
		<>
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
		</>
	);
}
