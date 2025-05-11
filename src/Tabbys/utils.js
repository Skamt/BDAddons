import { getUserName } from "@Utils";
import { getUserAvatar } from "@Utils/User";
import GuildStore from "@Stores/GuildStore";
import { getModule } from "@Webpack";
const b = getModule(a => a.getChannelIconURL);


export function buildTab(d) {
	const id = crypto.randomUUID();
	return { ...d, id };
}

export function getDmAvatar(channel, size) {
	const recipientId = channel.rawRecipients[0].id;
	return getUserAvatar({ id: recipientId, size });
}

export function getChannelName(channel) {
	if (!channel.isDM()) return channel.name;
	return channel.rawRecipients.map(getUserName).join(", ");
}

export function getChannelIcon(channel, size) {
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