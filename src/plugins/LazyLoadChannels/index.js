module.exports = (Plugin, Api) => {
	const {
		UI,
		DOM,
		Data,
		React,
		Patcher,
		ContextMenu,
		React: { useState, useEffect, useRef },
		Webpack: {
			Filters,
			getModule
		}
	} = new BdApi(config.info.name);

	// Modules
	const { DiscordModules: { Dispatcher, GuildStore, GuildChannelsStore, MessageActions, SwitchRow, ButtonData } } = Api;
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
		},
		DataManager: {
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
	}

	// Constants
	const EVENTS = {
		THREAD_LIST_SYNC: "THREAD_LIST_SYNC",
		THREAD_CREATE: "THREAD_CREATE",
		CHANNEL_SELECT: "CHANNEL_SELECT",
		CHANNEL_PRELOAD: "CHANNEL_PRELOAD",
		GUILD_CREATE: "GUILD_CREATE",
	};

	// styles
	const css = require("styles.css");

	// Components
	const LazyLoader = require("components/LazyLoader.jsx");

	return class LazyLoadChannels extends Plugin {

		constructor() {
			super();
			this.loadChannel = this.loadChannel.bind(this);
		}

		// Patches
		patchChannelContent() {
			Patcher.after(ChannelContent.Z, "type", (_, [{ channel }], returnValue) => {
				if (Utils.DataManager.has(channel.guild_id, channel.id)) return;
				if (channel.isDM() && !this.settings.includeDm) return;
				return React.createElement(LazyLoader, {
					channel,
					originalComponent: returnValue,
					handlers: {
						onLoadChannel: this.loadChannel,
						onLoadMessages: this.loadMessages,
						onLoadMoreMessages: this.loadMoreMessages
					},
					messages: returnValue.props.children.props.messages
				});
			});
		}

		patchContextMenu() {
			this.unpatchContextMenu = [
				ContextMenu.patch("channel-context", (retVal, { channel }) => {
					retVal.props.children.splice(1, 0, ContextMenu.buildItem({
						type: "toggle",
						label: "Auto load",
						active: Utils.DataManager.has(channel.guild_id, channel.id),
						action: (e) => {
							if (Utils.DataManager.has(channel.guild_id, channel.id)) Utils.DataManager.remove(channel.guild_id, channel.id);
							else Utils.DataManager.add(channel.guild_id, channel.id);
						}
					}));
				}),
				ContextMenu.patch("guild-context", (retVal, { guild: { id } }) => {
					retVal.props.children.splice(1, 0, ContextMenu.buildItem({
						type: "button",
						label: "Lazy load all channels",
						action: (e) => {
							Utils.DataManager.remove(id);
						}
					}));
				}),
				ContextMenu.patch("guild-context", (retVal, { guild: { id } }) => {
					retVal.props.children.splice(1, 0, ContextMenu.buildItem({
						type: "button",
						label: "Auto load all channels",
						action: (e) => {
							const { SELECTABLE, VOCAL } = GuildChannelsStore.getChannels(id)
							Utils.DataManager.add(id, [...SELECTABLE.map(({ channel }) => channel.id), ...VOCAL.map(({ channel }) => channel.id)]);
						}
					}));
				}),
				ContextMenu.patch("guild-context", (r) => r.props.children.splice(1, 0, ContextMenu.buildItem({ type: "separator" }))),
				ContextMenu.patch("channel-context", (r) => r.props.children.splice(1, 0, ContextMenu.buildItem({ type: "separator" })))
			]
		}

		// Component events ? 
		loadChannel(channel, autoLoad) {
			if (autoLoad) Utils.DataManager.add(channel.guild_id, channel.id);
			ChannelActions.actions[EVENTS.CHANNEL_SELECT]({
				channelId: channel.id,
				guildId: channel.guild_id,
				messageId: this.messageId || channel.lastMessageId
			});
		}

		loadMessages(channel) {
			ChannelActions.actions[EVENTS.CHANNEL_SELECT]({
				channelId: channel.id,
				guildId: channel.guild_id
			});
		}

		loadMoreMessages(channel, lastMessage) {
			MessageActions.fetchMessages({
				channelId: channel.id,
				before: lastMessage.id,
				limit: 50,
				truncate: true
			});
		}
		// Event Handlers
		channelSelectHandler(e) {
			this.messageId = e.messageId;
			if (Utils.DataManager.has(e.guildId, e.channelId) || (!e.guildId && !this.settings.includeDm))
				ChannelActions.actions[EVENTS.CHANNEL_SELECT](e);
		}

		channelCreateHandler({ channel }) {!channel.isDM() && Utils.DataManager.add(channel.guild_id, channel.id); }

		guildCreateHandler({ guild }) { guild.member_count === 1 && guild.channels.forEach(channel => Utils.DataManager.add(channel.guild_id, channel.id)) }

		setupHandlers() {
			this.handlers = [
				["CHANNEL_CREATE", this.channelCreateHandler],
				["THREAD_CREATE", this.channelCreateHandler],
				["GUILD_CREATE", this.guildCreateHandler],
				["CHANNEL_SELECT", this.channelSelectHandler],
			].map(([event, handler]) => {
				const boundHandler = handler.bind(this);
				Dispatcher.subscribe(event, boundHandler);
				return () => Dispatcher.unsubscribe(event, boundHandler);
			});
		}

		onStart() {
			try {
				DOM.addStyle(css);
				this.setupHandlers();
				this.patchChannelContent();
				this.patchContextMenu();
				Object.keys(EVENTS).forEach(event => Dispatcher.unsubscribe(event, ChannelActions.actions[event]));
			} catch (e) {
				console.error(e);
			}
		}

		onStop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
			this.unpatchContextMenu.forEach(p => p());
			this.handlers.forEach(h => h());
			Object.keys(EVENTS).forEach(event => Dispatcher.subscribe(event, ChannelActions.actions[event]));
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
}