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

	// Getting Dispatcher from Zlib just in case it has already been requsted by other plugins
	const { DiscordModules: { Dispatcher } } = Api;

	// Modules
	const ChannelTypeEnum = DiscordModules.ChannelTypeEnum;
	const ChannelActions = DiscordModules.ChannelActions;
	const ChannelContent = DiscordModules.ChannelContent;
	const SwitchRow = DiscordModules.SwitchRow;

	// Constants
	const EVENTS = {
		THREAD_LIST_SYNC: "THREAD_LIST_SYNC",
		THREAD_CREATE: "THREAD_CREATE",
		CHANNEL_SELECT: "CHANNEL_SELECT",
		CHANNEL_PRELOAD: "CHANNEL_PRELOAD",
	};

	const DataManager = {
		add({ id = 'DM', name = 'DM', icon = 'DM' }, channel) {
			const data = Data.load(id) || { name, icon, channels: [] };
			Data.save(id, {
				...data,
				channels: [...data.channels, channel.id]
			});
		},
		remove(guildId, channelId) {
			guildId = guildId.id || 'DM';
			const old = Data.load(guildId);
			if (!old) return;
			const index = old.channels.indexOf(channelId);
			if (index === -1) return;
			old.channels.splice(index, 1);
			Data.save(guildId, old);
		},
		has(guildId, channelId) {
			guildId = guildId || 'DM';
			const data = Data.load(guildId);
			if (!data) return false;
			return data.channels.some(id => id === channelId);
		}
	}

	// Helper functions
	const Utils = {
		forceReRender: (className) => {
			const target = document.querySelector(`.${className}`);
			if (!target) return;
			const instance = BdApi.ReactUtils.getOwnerInstance(target);
			const unpatch = Patcher.instead(instance, 'render', () => unpatch());
			instance.forceUpdate(() => instance.forceUpdate());
		}
	};

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
			Patcher.after(ChannelContent.Z, "type", (_, [{ channel, guild = {} }], returnValue) => {
				if (channel.type === ChannelTypeEnum.DM && !this.settings.includeDm) return;
				if (channel.type !== ChannelTypeEnum.DM && this.newlyCreatedChannels.has(channel.id)) return;
				if (DataManager.has(guild.id, channel.id)) return;
				return React.createElement(LazyLoader, {
					loadedChannels: this.loadedChannels,
					message: this.messageId,
					channel,
					guild,
					returnValue
				});
			});

			Utils.forceReRender('chat-2ZfjoI');
		}

		channelSelectHandler(e) {
			// if channel set to auto load || if DM and DMs not included in lazy loading 
			this.messageId = e.messageId;
			if (this.loadedChannels.has(e.channelId) || DataManager.has(e.guildId, e.channelId) || (!e.guildId && !this.settings.includeDm))
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