module.exports = (Plugin, Api) => {
	const {
		UI,
		DOM,
		Data,
		Patcher,
		React,
		React: { useState, useEffect },
		Webpack: {
			Filters,
			getModule
		}
	} = new BdApi(config.info.name);

	// Common modules from Zlib just in case they've already been requsted by other plugins
	const { DiscordModules: { Dispatcher, GuildStore, SwitchRow } } = Api;

	// Modules
	const ChannelTypeEnum = DiscordModules.ChannelTypeEnum;
	const ChannelActions = DiscordModules.ChannelActions;
	const ChannelContent = DiscordModules.ChannelContent;

	// Constants
	const EVENTS = {
		THREAD_LIST_SYNC: "THREAD_LIST_SYNC",
		THREAD_CREATE: "THREAD_CREATE",
		CHANNEL_SELECT: "CHANNEL_SELECT",
		CHANNEL_PRELOAD: "CHANNEL_PRELOAD",
	};

	const DataManager = {
		add(channel) {
			let data = Data.load(channel.guild_id) || {};
			if (channel.isDM()) {
				const { avatar, username } = channel.rawRecipients[0];
				data = { ...data, channels: [...data.channels, { id: channel.id, avatar, username }] };
			} else {
				const { name, icon } = GuildStore.getGuild(channel.guild_id);
				data = {
					...data,
					name,
					icon,
					channels: [...data.channels, { id: channel.id, name: channel.name }]
				};
			}
			Data.save(channel.guild_id, data);
		},
		remove(guildId, channelId) {
			const old = Data.load(guildId);
			if (!old) return;
			const index = old.channels.indexOf(channelId);
			if (index === -1) return;
			old.channels.splice(index, 1);
			Data.save(guildId, old);
		},
		has(guildId, channelId) {
			const data = Data.load(guildId);
			if (!data) return false;
			return data.channels.some(({ id }) => id === channelId);
		}
	}

	// styles
	const css = require("styles.css");

	// Components
	const LazyLoader = require("components/LazyLoader.jsx");

	return class LazyLoadChannels extends Plugin {

		constructor() {
			super();
			this.channelSelectHandler = this.channelSelectHandler.bind(this);
			this.channelCreateHandler = this.channelCreateHandler.bind(this);
			this.newlyCreatedChannels = new Set();
			this.loadedChannels = new Set();
		}

		patchChannelContent() {
			Patcher.after(ChannelContent.Z, "type", (_, [{ channel }], returnValue) => {
				// console.log(channel);
				if (channel.isDM() && !this.settings.includeDm) return;
				if (!channel.isDM() && this.newlyCreatedChannels.has(channel.id)) return;
				if (DataManager.has(channel.guild_id, channel.id)) return;
				return React.createElement(LazyLoader, {
					loadedChannels: this.loadedChannels,
					originalComponent: returnValue,
					messageId:this.messageId,
					channel
				});
			});
		}

		channelSelectHandler(e) {
			// if channel already loaded () || if channel set to auto load || if DM and DMs not included in lazy loading 
			this.messageId = e.messageId;
			if (DataManager.has(e.guildId, e.channelId) || (!e.guildId && !this.settings.includeDm))
				return ChannelActions.actions[EVENTS.CHANNEL_SELECT](e);
		}

		channelCreateHandler({ channel }) {
			this.newlyCreatedChannels.add(channel.id);
		}

		onStart() {
			try {
				DOM.addStyle(css);
				Dispatcher.subscribe("CHANNEL_SELECT", this.channelSelectHandler);
				Dispatcher.subscribe("CHANNEL_CREATE", this.channelCreateHandler);
				Dispatcher.subscribe("THREAD_CREATE", this.channelCreateHandler);
				Object.keys(EVENTS).forEach(event => Dispatcher.unsubscribe(event, ChannelActions.actions[event]));
				this.patchChannelContent();
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			Dispatcher.unsubscribe("CHANNEL_SELECT", this.channelSelectHandler);
			Dispatcher.unsubscribe("CHANNEL_CREATE", this.channelCreateHandler);
			Dispatcher.unsubscribe("THREAD_CREATE", this.channelCreateHandler);
			Object.keys(EVENTS).forEach(event => Dispatcher.subscribe(event, ChannelActions.actions[event]));
			DOM.removeStyle();
			Patcher.unpatchAll();
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
}