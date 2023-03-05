module.exports = (Api) => {
	const { Webpack: { Filters, getModule } } = BdApi;

	// https://discord.com/channels/86004744966914048/196782758045941760/1062604534922367107
	function getModuleAndKey(filter) {
		let module;
		const target = getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true });
		module = module?.exports;
		if (!module) return { module:undefined };
		const key = Object.keys(module).find(k => module[k] === target);
		if (!key) return undefined;
		return { module, key };
	}

	return {
		Modules: {
			ChannelActions: { module: DiscordModules.ChannelActions, isBreakable: true },
			ChannelContent: { module: DiscordModules.ChannelContent, isBreakable: true },
			ChannelTypeEnum: { module: DiscordModules.ChannelTypeEnum, fallback: { GUILD_CATEGORY: 4 } },
			ChannelComponent: { module: DiscordModules.ChannelComponent, withKey: true },
			...(() => {
				const { Dispatcher, SelectedGuildStore, GuildChannelsStore, MessageActions, SwitchRow, ButtonData } = Api.DiscordModules;
				return {
					Dispatcher: { module: Dispatcher, isBreakable: true },
					SelectedGuildStore: { module: SelectedGuildStore },
					GuildChannelsStore: { module: GuildChannelsStore },
					MessageActions: { module: MessageActions, isBreakable: true },
					SwitchRow: { module: SwitchRow },
					ButtonData: { module: ButtonData }
				};
			})()
		},
		Plugin(ParentPlugin, Modules) {
			const {
				UI,
				DOM,
				Data,
				React,
				Patcher,
				ContextMenu,
				React: { useState, useEffect }
			} = new BdApi(config.info.name);

			// Constants
			const EVENTS = [
				"THREAD_LIST_SYNC",
				"THREAD_CREATE",
				"CHANNEL_SELECT",
				"CHANNEL_PRELOAD",
				"GUILD_CREATE",
			];

			const CLASS_NAME = "lazyLoader";

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
				loadChannelMessages(channel) {
					/**
					 * This method of fetching messages makes API request without checking the cache 
					 * therefore it is only called when messages.length === 0
					 * and because it returns a promise, it is used to load messages and show toast 
					 */
					return Modules.MessageActions.fetchMessages({ channelId: channel.id });
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
					},
					toggelChannel(channel) {
						if (Utils.DataManager.has(channel.guild_id, channel.id))
							Utils.DataManager.remove(channel.guild_id, channel.id);
						else Utils.DataManager.add(channel.guild_id, channel.id);
					}
				},
				reRender: () => {
					const target = document.querySelector(`#${CLASS_NAME}`)?.parentElement;
					if (!target) return;
					const instance = BdApi.ReactUtils.getOwnerInstance(target);
					const unpatch = Patcher.instead(instance, 'render', () => unpatch());
					instance.forceUpdate(() => instance.forceUpdate());
				}
			}

			// Components
			const ErrorBoundary = require("ErrorBoundary.jsx");
			const LazyLoaderComponent = require("components/LazyLoaderComponent.jsx");

			// Styles
			const css = require("styles.css");

			return class LazyLoadChannels extends ParentPlugin {
				constructor() {
					super();
					this.loadChannel = this.loadChannel.bind(this);
					this.autoLoad = false;
				}

				loadChannel(channel, messageId) {
					/**
					 * This is what discord uses when a channel is selected
					 * it handles message jumping, and checks the cache
					 * that is why it is used as opossed to MessageActions.fetchMessages
					 */
					Modules.ChannelActions.fetchMessages({
						channelId: channel.id,
						guildId: channel.guild_id,
						messageId
					});
					this.autoLoad = true;
				}

				patchChannelContent() {
					/**
					 * main patch for the plugin.
					 */
					Patcher.after(Modules.ChannelContent.Z, "type", (_, [{ channel }], ret) => {
						if (this.autoLoad) return;
						return React.createElement(ErrorBoundary, {
								id: "LazyLoaderComponent",
								plugin: config.info.name
							},
							React.createElement(LazyLoaderComponent, {
								channel,
								loadChannel: this.loadChannel,
								messages: ret.props.children.props.messages
							}));
					});
				}

				patchChannel() {
					/**
					 * adds a class to channels set to be auto loaded
					 * for highlighting them
					 */
					if (Modules.ChannelComponent.module)
						Patcher.after(Modules.ChannelComponent.module, Modules.ChannelComponent.key, (_, [{ channel }], returnValue) => {
							if (!this.settings.autoloadedChannelIndicator) return;
							if (Utils.DataManager.has(channel.guild_id, channel.id))
								returnValue.props.children.props.children[1].props.className += " autoload";
						});
				}

				patchContextMenu() {
					this.unpatchContextMenu = [
						...[
							["Lazy load all channels", id => Utils.DataManager.remove(id)],
							["Auto load all channels", id => {
								const { SELECTABLE, VOCAL } = Modules.GuildChannelsStore.getChannels(id);
								Utils.DataManager.add(id, [...SELECTABLE.map(({ channel }) => channel.id), ...VOCAL.map(({ channel }) => channel.id)]);
							}]
						].map(([label, cb]) => ContextMenu.patch("guild-context", (retVal, { guild }) => {
							if (guild)
								retVal.props.children.splice(1, 0, ContextMenu.buildItem({ type: "button", label, action: () => cb(guild.id) }));
						})),
						...["channel-context", "thread-context"].map(context =>
							ContextMenu.patch(context, (retVal, { channel }) => {
								if (channel && channel.type !== Modules.ChannelTypeEnum.GUILD_CATEGORY)
									retVal.props.children.splice(1, 0, ContextMenu.buildItem({
										type: "toggle",
										label: "Auto load",
										active: Utils.DataManager.has(channel.guild_id, channel.id),
										action: _ => Utils.DataManager.toggelChannel(channel)
									}));
							})
						),
						...["channel-context", "thread-context", "guild-context"].map(context =>
							ContextMenu.patch(context, retVal => retVal.props.children.splice(1, 0, ContextMenu.buildItem({ type: "separator" })))
						)
					]
				}

				channelSelectHandler({ channelId, guildId, messageId }) {
					/** Ignore if 
					 * messageId !== undefined means it's a jump
					 * guildId === undefined means it's DM
					 * OR channel is autoloaded
					 */
					if (messageId || !guildId || Utils.DataManager.has(guildId, channelId))
						this.loadChannel({ id: channelId, guild_id: guildId }, messageId);
					else
						this.autoLoad = false;
				}

				channelCreateHandler({ channel }) {
					/**
					 * No need to lazy load channels or threads created by current user. 
					 */
					if (channel.guild_id !== Modules.SelectedGuildStore.getGuildId()) return;
					if (!channel || !channel.guild_id || !channel.id) return;
					if (!channel.isDM()) {
						Utils.DataManager.add(channel.guild_id, channel.id);
						this.loadChannel(channel);
					}
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

					if (guildCreateDate === nowDate)
						guild.channels.forEach(channel => Utils.DataManager.add(channel.guild_id, channel.id))
				}

				setupHandlers() {
					this.handlers = [
						["CHANNEL_CREATE", this.channelCreateHandler],
						["THREAD_CREATE", this.channelCreateHandler],
						["GUILD_CREATE", this.guildCreateHandler],
						["CHANNEL_SELECT", this.channelSelectHandler]
					].map(([event, handler]) => {
						const boundHandler = handler.bind(this);
						Modules.Dispatcher.subscribe(event, boundHandler);
						return () => Modules.Dispatcher.unsubscribe(event, boundHandler);
					});
				}

				onStart() {
					try {
						DOM.addStyle(css);
						this.patchChannel();
						this.setupHandlers();
						this.patchChannelContent();
						this.patchContextMenu();
						EVENTS.forEach(event => Modules.Dispatcher.unsubscribe(event, Modules.ChannelActions.actions[event]));
					} catch (e) {
						console.error(e);
					}
				}

				onStop() {
					DOM.removeStyle();
					Patcher.unpatchAll();
					this.unpatchContextMenu?.forEach?.(p => p());
					this.handlers?.forEach?.(h => h());
					this.unpatchContextMenu = null;
					this.handlers = null;
					EVENTS.forEach(event => Modules.Dispatcher.subscribe(event, Modules.ChannelActions.actions[event]));
				}

				getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}
			}
		}
	}
}