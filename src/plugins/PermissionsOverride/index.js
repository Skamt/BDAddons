module.exports = () => {
	const { Patcher, Webpack: { Filters, getModule } } = BdApi;
	const GuildPermissions = getModule(Filters.byProps("getGuildPermissions"), { searchExports: true });
	const DiscordPermissions = getModule(m => m.ADD_REACTIONS, { searchExports: true });
	const ALLOWED = [
		// DiscordPermissions.ADD_REACTIONS,
		// DiscordPermissions.ADMINISTRATOR,
		// DiscordPermissions.ATTACH_FILES,
		// DiscordPermissions.BAN_MEMBERS,
		// DiscordPermissions.CHANGE_NICKNAME,
		// DiscordPermissions.CONNECT,
		// DiscordPermissions.CREATE_INSTANT_INVITE,
		// DiscordPermissions.CREATE_PRIVATE_THREADS,
		// DiscordPermissions.CREATE_PUBLIC_THREADS,
		// DiscordPermissions.DEAFEN_MEMBERS,
		// DiscordPermissions.EMBED_LINKS,
		// DiscordPermissions.KICK_MEMBERS,
		DiscordPermissions.MANAGE_CHANNELS,
		// DiscordPermissions.MANAGE_EVENTS,
		DiscordPermissions.MANAGE_GUILD,
		// DiscordPermissions.MANAGE_GUILD_EXPRESSIONS,
		// DiscordPermissions.MANAGE_MESSAGES,
		// DiscordPermissions.MANAGE_NICKNAMES,
		DiscordPermissions.MANAGE_ROLES, // View channel permissions
		// DiscordPermissions.MANAGE_THREADS,
		// DiscordPermissions.MANAGE_WEBHOOKS,	// Requires PERMS
		// DiscordPermissions.MENTION_EVERYONE,
		// DiscordPermissions.MODERATE_MEMBERS,
		// DiscordPermissions.MOVE_MEMBERS,
		// DiscordPermissions.MUTE_MEMBERS,
		// DiscordPermissions.PRIORITY_SPEAKER,
		// DiscordPermissions.READ_MESSAGE_HISTORY,
		// DiscordPermissions.REQUEST_TO_SPEAK,
		// DiscordPermissions.SEND_MESSAGES,
		// DiscordPermissions.SEND_MESSAGES_IN_THREADS,
		// DiscordPermissions.SEND_TTS_MESSAGES,
		// DiscordPermissions.SPEAK,
		// DiscordPermissions.STREAM,
		// DiscordPermissions.USE_APPLICATION_COMMANDS,
		// DiscordPermissions.USE_EMBEDDED_ACTIVITIES,
		// DiscordPermissions.USE_EXTERNAL_EMOJIS,
		// DiscordPermissions.USE_EXTERNAL_STICKERS,
		// DiscordPermissions.USE_VAD,
		// DiscordPermissions.VIEW_AUDIT_LOG,
		// DiscordPermissions.VIEW_CHANNEL, 	// View Hidden Channels
		// DiscordPermissions.VIEW_CREATOR_MONETIZATION_ANALYTICS,
		// DiscordPermissions.VIEW_GUILD_ANALYTICS,
	];
	return class PermissionsOverride {
		load() {}
		getName() { return "PermissionsOverride" }
		patch() {
			Patcher.after(config.info.name, GuildPermissions, "can", (_, [perm], ret) => {
				return ret || ALLOWED.some(a => a === perm);
			})
		}
		start() {
			try {
				this.patch();
			} catch (e) {
				Logger.err(e);
			}

		}
		stop() { Patcher.unpatchAll(config.info.name); }
	}
}