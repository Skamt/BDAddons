module.exports = (Plugin, Api) => {
	const {
		UI,
		DOM,
		Data,
		React,
		Patcher,
		ContextMenu,
		React: { useState },
		Webpack: {
			Filters,
			getModule
		}
	} = new BdApi(config.info.name);

	const Utils = {
		getChannelStats(messages) {
			return {
				messages: messages.length,
				reactions: messages.reduce((acc, m) => acc + m.reactions.length, 0),
				embeds: messages.reduce((acc, m) => acc + m.embeds.filter(e => e.type.includes("rich")).length, 0),
				links: messages.reduce((acc, m) => acc + m.embeds.filter(e => e.type === "link").length, 0),
				images: messages.reduce((acc, m) => acc + m.attachments.filter(e => e.content_type.includes("image")).length + m.embeds.filter(e => e.type === "image").length, 0),
				videos: messages.reduce((acc, m) => acc + m.attachments.filter(e => e.content_type.includes("video")).length + m.embeds.filter(e => e.type === "video").length, 0),
			}
		}
	}
	// Modules
	const { DiscordModules: { Dispatcher, GuildStore, GuildChannelsStore, SwitchRow } } = Api;
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
		add(key, target) {
			let data = Data.load(key) || [];
			Data.save(key, [...data, ...(Array.isArray(target) ? target : [target])])
		},
		remove(key, target) {
			if (!target) return Data.save(key, []);
			const data = Data.load(key);
			if (!data) return;
			const index = data.indexOf(target);
			if (index === -1) return;
			data.splice(index, 1);
			Data.save(key, data);
		},
		has(key, target) {
			const data = Data.load(key);
			if (!data) return false;
			return data.some(id => id === target);
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
				console.log();
				if (DataManager.has(channel.guild_id, channel.id)) return;
				if (channel.isDM() && !this.settings.includeDm) return;
				if (!channel.isDM() && this.newlyCreatedChannels.has(channel.id)) return;
				return React.createElement(LazyLoader, {
					loadedChannels: this.loadedChannels,
					originalComponent: returnValue,
					messageId: this.messageId,
					channelStats: Utils.getChannelStats(returnValue.props.children.props.messages),
					channel,
				});
			});
		}
		patchContextMenu() {
			this.unpatchContextMenu = [
				ContextMenu.patch("channel-context", (retVal, { channel }) => {
					retVal.props.children.splice(1, 0, ContextMenu.buildItem({
						type: "toggle",
						label: "Auto load",
						active: DataManager.has(channel.guild_id, channel.id),
						action: (e) => {
							if (DataManager.has(channel.guild_id, channel.id)) DataManager.remove(channel.guild_id, channel.id);
							else DataManager.add(channel.guild_id, channel.id);
						}
					}));
				}),
				ContextMenu.patch("guild-context", (retVal, { guild: { id } }) => {
					retVal.props.children.splice(1, 0, ContextMenu.buildItem({
						type: "button",
						label: "Lazy load all channels",
						action: (e) => {
							DataManager.remove(id);
						}
					}));
				}),
				ContextMenu.patch("guild-context", (retVal, { guild: { id } }) => {
					retVal.props.children.splice(1, 0, ContextMenu.buildItem({
						type: "button",
						label: "Auto load all channels",
						action: (e) => {
							const { SELECTABLE, VOCAL } = GuildChannelsStore.getChannels(id)
							DataManager.add(id, [...SELECTABLE.map(({ channel }) => channel.id), ...VOCAL.map(({ channel }) => channel.id)]);
						}
					}));
				}),
				ContextMenu.patch("guild-context", (r) => r.props.children.splice(1, 0, ContextMenu.buildItem({ type: "separator" }))),
				ContextMenu.patch("channel-context", (r) => r.props.children.splice(1, 0, ContextMenu.buildItem({ type: "separator" })))
			]
		}

		channelSelectHandler(e) {
			this.messageId = e.messageId;
			// if channel set to auto load || if DM and DMs not included in lazy loading 
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
				this.patchContextMenu();
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			DOM.removeStyle();
			Dispatcher.unsubscribe("CHANNEL_SELECT", this.channelSelectHandler);
			Dispatcher.unsubscribe("CHANNEL_CREATE", this.channelCreateHandler);
			Dispatcher.unsubscribe("THREAD_CREATE", this.channelCreateHandler);
			Object.keys(EVENTS).forEach(event => Dispatcher.subscribe(event, ChannelActions.actions[event]));
			Patcher.unpatchAll();
			this.unpatchContextMenu.forEach(p => p());
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
}