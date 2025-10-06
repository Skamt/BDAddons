import { getModule } from "@Webpack";
import { getUserAvatar, getUserName } from "@Utils/User";
import GuildStore from "@Stores/GuildStore";
import { IconsUtils } from "@Discord/Modules";

export function getChannelName(channel) {
	if (!channel) return "";
	if (channel.isGroupDM()) return channel.rawRecipients.map(getUserName).join(", ");
	return channel.name;
}

export function getDmAvatar(channel, size) {
	const recipientId = channel.recipients[0];
	return getUserAvatar({ id: recipientId, size });
}

export function getChannelIconURL(channel, size) {
	if (!channel) return "";

	if (channel.isGroupDM())
		return IconsUtils.getChannelIconURL({
			id: channel.id,
			icon: channel.icon,
			applicationId: channel.getApplicationId(),
			size
		});

	const guild = GuildStore.getGuild(channel.guild_id);
	return IconsUtils.getGuildIconURL({
		id: guild.id,
		icon: guild.icon,
		size
	});
}
