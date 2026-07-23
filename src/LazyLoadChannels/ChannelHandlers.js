import ControlKeys from "@Utils/ControlKeys";
import ChannelsStateManager from "@/ChannelsStateManager";
import { shouldLoad, loadChannel } from "@/utils";
import Dispatcher from "@Modules/Dispatcher";
import Settings from "@Utils/Settings";
import ChannelStore from "@Stores/ChannelStore";

export default new (class {
	init() {
		this.setupHandlers();
	}

	dispose() {
		this.handlers?.forEach?.((h) => h());
		this.handlers = null;
	}

	threadCreateHandler({ channelId }) {
		ChannelsStateManager.add("channels", channelId);
	}

	guildCreateHandler({ guild }) {

		if (!guild || !guild.id || !guild.channels || !Array.isArray(guild.channels)) return;
		const guildCreateDate = new Date(+guild.id / 4194304 + 1420070400000).toLocaleDateString();
		const nowDate = new Date(Date.now()).toLocaleDateString();

		if (guildCreateDate === nowDate) ChannelsStateManager.add("guilds", guild.id);
	}

	channelSelectHandler({ channelId, guildId, messageId }) {
		const channel = ChannelStore.getChannel(channelId);
		if (shouldLoad(channel)) loadChannel({ id: channelId, guild_id: guildId }, messageId);
	}

	guildDeleteHandler({ guild }) {
		ChannelsStateManager.remove("guilds", guild.id);
	}

	setupHandlers() {
		this.handlers = [
			["THREAD_CREATE_LOCAL", this.threadCreateHandler],
			["GUILD_CREATE", this.guildCreateHandler],
			["CHANNEL_SELECT", this.channelSelectHandler],
			["GUILD_DELETE", this.guildDeleteHandler],
		].map(([event, handler]) => {
			const boundHandler = handler.bind(this);
			Dispatcher.subscribe(event, boundHandler);
			return () => Dispatcher.unsubscribe(event, boundHandler);
		});
	}
})();
