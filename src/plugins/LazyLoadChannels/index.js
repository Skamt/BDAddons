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

	let show = false;
	// Modules
	const { DiscordModules: { Dispatcher, GuildStore, GuildChannelsStore, SwitchRow } } = Api;
	const ChannelTypeEnum = DiscordModules.ChannelTypeEnum;
	const ChannelActions = DiscordModules.ChannelActions;
	const ChannelContent = DiscordModules.ChannelContent;

	// Utilities
	const Utils = {
		showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
		getChannelStats(messages) {
			return messages.reduce((stats, { reactions, embeds, attachments }) => {
				stats.reactions += reactions.length;
				stats.embeds += embeds.filter(e => e.type?.includes("rich")).length;
				stats.links += embeds.filter(e => e.type?.includes("rich")).length;
				stats.images += attachments.filter(Utils.filters.attachments("image")).length + embeds.filter(Utils.filters.embeds("image")).length;
				stats.videos += attachments.filter(Utils.filters.attachments("video")).length + embeds.filter(Utils.filters.embeds("video")).length;
				return stats;
			}, { messages: messages.length, reactions: 0, embeds: 0, links: 0, images: 0, videos: 0 });
		},
		filters: {
			attachments: type => a => a.content_type?.includes("type") || Utils.REGEX[type].test(a.filename),
			embeds: type => e => e.type === type
		},
		REGEX: {
			image: /(jpg|jpeg|png|bmp|tiff|psd|raw|cr2|nef|orf|sr2)/i,
			video: /(mp4|avi|wmv|mov|flv|mkv|webm|vob|ogv|m4v|3gp|3g2|mpeg|mpg|m2v|m4v|svi|3gpp|3gpp2|mxf|roq|nsv|flv|f4v|f4p|f4a|f4b)/i
		}
	}

	// Constants
	const EVENTS = {
		THREAD_LIST_SYNC: "THREAD_LIST_SYNC",
		THREAD_CREATE: "THREAD_CREATE",
		CHANNEL_SELECT: "CHANNEL_SELECT",
		CHANNEL_PRELOAD: "CHANNEL_PRELOAD",
		GUILD_CREATE: "GUILD_CREATE",
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
			this.guildCreateHandler = this.guildCreateHandler.bind(this);
			this.loadMessagesSuccess = this.loadMessagesSuccess.bind(this);
			this.newlyCreatedChannels = new Set();
			this.loadedChannels = new Set();
		}

		patchChannelContent() {
			Patcher.after(ChannelContent.Z, "type", (_, [{ channel }], returnValue) => {
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
			// Saving message ID to jump to it, this triggered when doing a search and we need the message ID
			// if message ID undefined then the last message in the channel is used 
			this.messageId = e.messageId;
			if (this.newlyCreatedChannels.has(e.channelId) || DataManager.has(e.guildId, e.channelId) || (!e.guildId && !this.settings.includeDm))
				ChannelActions.actions[EVENTS.CHANNEL_SELECT](e);
		}

		channelCreateHandler({ channel }) { this.newlyCreatedChannels.add(channel.id); }

		guildCreateHandler({ guild }) { guild.member_count === 1 && guild.channels.forEach(({ id }) => this.newlyCreatedChannels.add(id)) }

		loadMessagesSuccess() {
			if (show) {
				Utils.showToast("Loaded!", "success");
				show = false;
			}
		}

		onStart() {
			try {
				DOM.addStyle(css);
				Dispatcher.subscribe("CHANNEL_CREATE", this.channelCreateHandler);
				Dispatcher.subscribe("LOAD_MESSAGES_SUCCESS", this.loadMessagesSuccess);
				Dispatcher.subscribe(EVENTS.CHANNEL_SELECT, this.channelSelectHandler);
				Dispatcher.subscribe(EVENTS.THREAD_CREATE, this.channelCreateHandler);
				Dispatcher.subscribe(EVENTS.GUILD_CREATE, this.guildCreateHandler);
				Object.keys(EVENTS).forEach(event => Dispatcher.unsubscribe(event, ChannelActions.actions[event]));
				this.patchChannelContent();
				this.patchContextMenu();
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			DOM.removeStyle();
			Dispatcher.unsubscribe("CHANNEL_CREATE", this.channelCreateHandler);
			Dispatcher.unsubscribe("LOAD_MESSAGES_SUCCESS", this.loadMessagesSuccess);
			Dispatcher.unsubscribe(EVENTS.CHANNEL_SELECT, this.channelSelectHandler);
			Dispatcher.unsubscribe(EVENTS.THREAD_CREATE, this.channelCreateHandler);
			Dispatcher.unsubscribe(EVENTS.GUILD_CREATE, this.guildCreateHandler);
			Object.keys(EVENTS).forEach(event => Dispatcher.subscribe(event, ChannelActions.actions[event]));
			Patcher.unpatchAll();
			this.unpatchContextMenu.forEach(p => p());
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
}