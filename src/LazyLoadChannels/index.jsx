import "./styles";
import "./patches/*";
import React from "@React";
import { map } from "@common/Flux";
import Dispatcher from "@Modules/Dispatcher";
import ChannelActions from "@Modules/ChannelActions";
import SettingComponent from "./components/SettingComponent";
import ChannelsStateManager from "@/ChannelsStateManager";
import { shouldLoad, loadChannel } from "@/utils";
import ChannelStore from "@Stores/ChannelStore";
import { EVENTS } from "./Constants";
import Plugin from "@common/Plugin";

Plugin.getSettingsPanel = () => <SettingComponent />;

Plugin.onStart(() => {
	map({
		THREAD_CREATE_LOCAL: ({ channelId }) => {
			ChannelsStateManager.add("channels", channelId);
		},
		GUILD_CREATE: ({ guild }) => {
			if (!guild || !guild.id || !guild.channels || !Array.isArray(guild.channels)) return;
			const guildCreateDate = new Date(+guild.id / 4194304 + 1420070400000).toLocaleDateString();
			const nowDate = new Date(Date.now()).toLocaleDateString();

			if (guildCreateDate === nowDate) ChannelsStateManager.add("guilds", guild.id);
		},
		CHANNEL_SELECT: ({ channelId, guildId, messageId }) => {
			const channel = ChannelStore.getChannel(channelId);
			if (shouldLoad(channel)) loadChannel({ id: channelId, guild_id: guildId }, messageId);
		},
		GUILD_DELETE: ({ guild }) => {
			ChannelsStateManager.remove("guilds", guild.id);
		}
	});
	EVENTS.forEach(event => Dispatcher.unsubscribe(event, ChannelActions.actions[event]));
});

Plugin.onStop(() => {
	EVENTS.forEach(event => Dispatcher.subscribe(event, ChannelActions.actions[event]));
});

module.exports = () => Plugin;
