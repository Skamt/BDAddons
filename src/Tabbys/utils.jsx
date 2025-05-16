import { MenuLabel } from "@Components/ContextMenu";
import useStateFromStores from "@Modules/useStateFromStores";
import React from "@React";
import ChannelStore from "@Stores/ChannelStore";
import ReadStateStore from "@Stores/ReadStateStore";
import TypingStore from "@Stores/TypingStore";
import GuildStore from "@Stores/GuildStore";
import { getUserName, nop } from "@Utils";
import { getUserAvatar } from "@Utils/User";
import { getModule } from "@Webpack";

const b = getModule(a => a.getChannelIconURL);

export function buildTab(tabObj) {
	const id = crypto.randomUUID();
	return { ...tabObj, id };
}

export function getDmAvatar(channel, size) {
	const recipientId = channel.rawRecipients[0].id;
	return getUserAvatar({ id: recipientId, size });
}

export function getChannelName(channel) {
	if (!channel) return;
	if (!channel.isDM()) return channel.name;
	return channel.rawRecipients.map(getUserName).join(", ");
}

export function getChannelIcon(channel, size) {
	if (!channel) return;
	if (channel.isDM()) return getDmAvatar(channel, size);

	if (channel.isGroupDM())
		return b.getChannelIconURL({
			id: channel.id,
			icon: channel.icon,
			applicationId: channel.getApplicationId(),
			size: size
		});

	const guild = GuildStore.getGuild(channel.guild_id);

	if (guild) return guild.getIconURL(size);
}

export function useChannel(channelId, size) {
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	const channelName = getChannelName(channel, size) || "Home";
	const iconSrc = getChannelIcon(channel, size);
	const icon = iconSrc && (
		<img
			src={iconSrc}
			alt={channelName}
		/>
	);
	return { icon, channelName, channel };
}

export function useChannelState(channelId) {
	const [mentionCount, unreadCount] = useStateFromStores([ReadStateStore], () => {
		const mentionCount = ReadStateStore.getMentionCount(channelId);
		const unreadCount = ReadStateStore.getUnreadCount(channelId);
		return [mentionCount, unreadCount];
	}, [channelId]);

	const isTyping = useStateFromStores([TypingStore], () => !!Object.keys(TypingStore.getTypingUsers(channelId)).length, [channelId]);
	
	return { isTyping, mentionCount, unreadCount };
}

export function createContextMenuItem(type, id = "", action = nop, label = "Unknown", icon = null, color = "", children) {
	const res = {
		className: `channeltab-${id}-menuitem`,
		type,
		id,
		action,
		items: children,
		// icon,
		label,
		label: (
			<MenuLabel
				label={label}
				icon={icon}
			/>
		)
	};

	if (color) res.color = color;
	return res;
}
