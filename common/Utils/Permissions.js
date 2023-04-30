import DiscordPermissions from "@Modules/DiscordPermissions";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";

export function hasEmbedPerms(channel, user) {
	return !channel.guild_id || DiscordPermissions?.can({
		permission: DiscordPermissionsEnum.EMBED_LINKS,
		context: channel,
		user
	});
}