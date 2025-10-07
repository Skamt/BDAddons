import "./styles";
import "./patches/*";
import React from "@React";
import { DOM, Patcher } from "@Api";
import Settings from "@Utils/Settings";
import ControlKeys from "@Utils/ControlKeys";
import Logger from "@Utils/Logger";
import ChannelsStateManager from "./ChannelsStateManager";
import Dispatcher from "@Modules/Dispatcher";
import ChannelActions from "@Modules/ChannelActions";
import SettingComponent from "./components/SettingComponent";
import { EVENTS } from "./Constants";
import Plugin, { Events } from "@Utils/Plugin";

Plugin.getSettingsPanel = () => <SettingComponent />;


Plugin.on(Events.START, () => {
	this.setupHandlers();
	EVENTS.forEach(event => Dispatcher.unsubscribe(event, ChannelActions.actions[event]));
	
});

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();

	EVENTS.forEach(event => Dispatcher.subscribe(event, ChannelActions.actions[event]));
});

export default class LazyLoadChannels {
	constructor() {
		ChannelsStateManager.init();
		this.autoLoad = false;
		this.loadChannel = this.loadChannel.bind(this);
	}

	loadChannel(channel, messageId) {
		/**
		 * This is what discord uses when a channel is selected
		 * it handles message jumping, and checks the cache
		 * that is why it is used as opossed to MessageActions.fetchMessages
		 */
		ChannelActions.fetchMessages({
			channelId: channel.id,
			guildId: channel.guild_id,
			messageId
		});
		this.autoLoad = true;
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
		if (ControlKeys.ctrlKey || messageId || (!guildId && !Settings.state.lazyLoadDMs) || ChannelsStateManager.getChannelstate(guildId, channelId)) this.loadChannel({ id: channelId, guild_id: guildId }, messageId);
		else this.autoLoad = false;
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

	


}
