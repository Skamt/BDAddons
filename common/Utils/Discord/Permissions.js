import DiscordPermissions from "@Modules/DiscordPermissions";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";

export function hasEmbedPerms(channel, user) {
	return !channel.guild_id || DiscordPermissions?.can(
		DiscordPermissionsEnum.EMBED_LINKS,
		channel,
		user
	);
}

export function hasExternalEmojisPerms(channel, user) {
	return !channel.guild_id || DiscordPermissions?.can(
		DiscordPermissionsEnum.USE_EXTERNAL_EMOJIS,
		channel,
		user
	);
}