module.exports = (Plugin, Api) => {
	const {
		UI,
		DOM,
		Data,
		Patcher,
		React,
		React: { useState },
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
		}

		patchChannelContent() {
			Patcher.after(ChannelContent.Z, "type", (_, [{ channel: { type, id, guild_id, lastMessageId } }], returnValue) => {
				if (type === ChannelTypeEnum.DM && !this.settings.includeDm) return;
				if (type !== ChannelTypeEnum.DM && this.newlyCreatedChannels.has(id)) return;
				if (Data.load(id)) return;

				return React.createElement(LazyLoader, {
					options: {
						channelId: id,
						guildId: guild_id,
						messageId: lastMessageId
					},
					original: returnValue
				});;
			});
		}

		channelSelectHandler(e) {
			// if channel set to auto load || if DM and DMs not included in lazy loading 
			if (Data.load(e.channelId) || (!e.guildId && !this.settings.includeDm)) return ChannelActions.actions[EVENTS.CHANNEL_SELECT](e);
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