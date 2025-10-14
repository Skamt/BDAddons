import { getModule } from "@Webpack";
import { getUserAvatar, getUserName } from "@Utils/User";
import GuildStore from "@Stores/GuildStore";
import ChannelStore from "@Stores/ChannelStore";
import { IconsUtils } from "@Discord/Modules";

export function getGroupDmName(channelId) {
	const channel = ChannelStore.getChannel(channelId) || {};
	return !channel ? "" : channel.rawRecipients.map(getUserName).join(", ");
}

export function getGroupDmIcon(channelId, size) {
	const channel = ChannelStore.getChannel(channelId);

	return !channel
		? ""
		: IconsUtils.getChannelIconURL({
				id: channel.id,
				icon: channel.icon,
				applicationId: channel.getApplicationId(),
				size
			});
}

export function getGuildIcon(guildId, size) {
	const guild = GuildStore.getGuild(guildId);
	return !guild
		? ""
		: IconsUtils.getGuildIconURL({
				id: guildId,
				icon: guild.icon,
				size
			});
}
