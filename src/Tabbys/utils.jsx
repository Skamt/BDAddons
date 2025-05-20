import { MenuLabel } from "@Components/ContextMenu";
import useStateFromStores from "@Modules/useStateFromStores";
import React from "@React";
import UserStore from "@Stores/UserStore";
import ChannelStore from "@Stores/ChannelStore";
import ReadStateStore from "@Stores/ReadStateStore";
import TypingStore from "@Stores/TypingStore";
import GuildStore from "@Stores/GuildStore";
import { getUserName, nop } from "@Utils";
import { getUserAvatar } from "@Utils/User";
import { getModule } from "@Webpack";

const ChannelIconsUtils = getModule(a => a.getChannelIconURL);

export function buildTab(tabObj) {
	const id = crypto.randomUUID();
	return { ...tabObj, id };
}

export function getDmAvatar(channel, size) {
	const recipientId = channel.recipients[0];
	return getUserAvatar({ id: recipientId, size });
}

export function getChannelName(channel) {
	if (!channel) return;
	if (channel.isDM() || channel.isGroupDM()) return channel.rawRecipients.map(getUserName).join(", ");
	return channel.name;
}

export function getChannelIcon(channel, size) {
	if (!channel) return;
	if (channel.isDM()) return getDmAvatar(channel, size);

	if (channel.isGroupDM())
		return ChannelIconsUtils.getChannelIconURL({
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
	const [mentionCount, unreadCount, hasUnread] = useStateFromStores(
		[ReadStateStore],
		() => {
			const hasUnread = ReadStateStore.hasUnread(channelId);
			const mentionCount = ReadStateStore.getMentionCount(channelId);
			const unreadCount = ReadStateStore.getUnreadCount(channelId);
			return [mentionCount, unreadCount, hasUnread];
		},
		[channelId]
	);

	const typingUsersIds = useStateFromStores([TypingStore], () => Object.keys(TypingStore.getTypingUsers(channelId)), [channelId]);
	const currentUser = UserStore.getCurrentUser();
	const typingUsers = typingUsersIds.filter(id => id !== currentUser?.id).map(UserStore.getUser);

	return { typingUsers, mentionCount, unreadCount, hasUnread };
}

export function createContextMenuItem(type, id = "", action = nop, label = "Unknown", icon = null, color = "", children) {
	const res = {
		className: `channeltab-${id}-menuitem`,
		type,
		id,
		action,
		items: children,
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
