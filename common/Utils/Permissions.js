import DiscordPermissions from "@Modules/DiscordPermissions";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";

export function hasEmbedPerms(channel, user) {
	return !channel.guild_id || DiscordPermissions?.can(
		DiscordPermissionsEnum.EMBED_LINKS,
		channel,
		user
	);
}