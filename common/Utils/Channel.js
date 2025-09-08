import { getModule } from "@Webpack";
import GuildStore from "@Stores/GuildStore";

const ChannelIconsUtils = getModule(a => a.getChannelIconURL);

import { getUserAvatar, getUserName } from "@Utils/User";

export function getChannelName(channel) {
	if (!channel) return;
	if (channel.isDM() || channel.isGroupDM()) return channel.rawRecipients.map(getUserName).join(", ");
	return channel.name;
}

export function getDmAvatar(channel, size) {
	const recipientId = channel.recipients[0];
	return getUserAvatar({ id: recipientId, size });
}

export function getChannelIcon(channel, size) {
	if (!channel) return;
	if (channel.isDM()) return getDmAvatar(channel, size);

	if (channel.isGroupDM())
		return ChannelIconsUtils.getChannelIconURL({
			id: channel.id,
			icon: channel.icon,
			applicationId: channel.getApplicationId(),
			size
		});

	const guild = GuildStore.getGuild(channel.guild_id);
	return ChannelIconsUtils.getGuildIconURL({
			id: guild.id,
			icon: guild.icon,
			size
		});
}