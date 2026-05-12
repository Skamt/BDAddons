import ControlKeys from "@Utils/ControlKeys";
import ChannelsStateManager from "@/ChannelsStateManager";
import { loadChannel } from "@/utils";
import Dispatcher from "@Modules/Dispatcher";
import Settings from "@Utils/Settings";

export default new (class {
	init() {
		this.setupHandlers();
	}

	dispose() {
		this.handlers?.forEach?.(h => h());
		this.handlers = null;
	}

	threadCreateHandler({ channelId }) {
		/**
		 * Listening for threads created by current user
		 **/
		ChannelsStateManager.add("channels", channelId);
	}

	guildCreateHandler({ guild }) {
		/**
		 * No need to lazy load channels of newly created guild
		 *
		 * Snowflake conversion:
		 *	+guild.id: convert guildid to Number
		 *	4194304: the equivalent of right shifting by 22
		 *	1420070400000: DISCORD_EPOCH
		 * https://discord.com/developers/docs/reference#convert-snowflake-to-datetime
		 */
		if (!guild || !guild.id || !guild.channels || !Array.isArray(guild.channels)) return;
		const guildCreateDate = new Date(+guild.id / 4194304 + 1420070400000).toLocaleDateString();
		const nowDate = new Date(Date.now()).toLocaleDateString();

		if (guildCreateDate === nowDate) ChannelsStateManager.add("guilds", guild.id);
	}

	channelSelectHandler({ channelId, guildId, messageId }) {
		/** Ignore if
		 * messageId !== undefined means it's a jump
		 * !guildId means it's DM
		 * OR channel is autoloaded
		 **/
		if (ControlKeys.ctrlKey || messageId || (!guildId && !Settings.state.lazyLoadDMs) || ChannelsStateManager.getChannelstate(guildId, channelId)) loadChannel({ id: channelId, guild_id: guildId }, messageId);
	}

	guildDeleteHandler({ guild }) {
		ChannelsStateManager.remove("guilds", guild.id);
	}

	setupHandlers() {
		this.handlers = [
			["THREAD_CREATE_LOCAL", this.threadCreateHandler],
			["GUILD_CREATE", this.guildCreateHandler],
			["CHANNEL_SELECT", this.channelSelectHandler],
			["GUILD_DELETE", this.guildDeleteHandler]
		].map(([event, handler]) => {
			const boundHandler = handler.bind(this);
			Dispatcher.subscribe(event, boundHandler);
			return () => Dispatcher.unsubscribe(event, boundHandler);
		});
	}
})();
