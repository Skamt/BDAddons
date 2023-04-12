function main(API) {
	const {
		UI,
		DOM,
		Data,
		React,
		Patcher,
		ContextMenu,
		React: { useState, useEffect }, 
		Webpack: { Filters, getModule, waitForModule }
	} = API;
	
	// https://discord.com/channels/86004744966914048/196782758045941760/1062604534922367107
	function getModuleAndKey(filter) {
		let module;
		const target = getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true });
		module = module?.exports;
		if (!module) return { module: undefined };
		const key = Object.keys(module).find(k => module[k] === target);
		if (!key) return undefined;
		return { module, key };
	}

	return {
		Modules: {
			ChannelActions: {
				module: DiscordModules.ChannelActions,
				isBreakable: true
			},
			ChannelContent: {
				module: DiscordModules.ChannelContent,
				isBreakable: true
			},
			ChannelTypeEnum: {
				module: DiscordModules.ChannelTypeEnum,
				fallback: { GUILD_CATEGORY: 4 },
				errorNote: "fallback is used, there maybe side effects"
			},
			ChannelComponent: {
				module: getModuleAndKey(DiscordModules.ChannelComponent),
				withKey: true,
				errorNote: "Channel indicators are disabled"
			},
			Dispatcher: {
				module: DiscordModules.Dispatcher,
				isBreakable: true
			},
			MessageActions: {
				module: DiscordModules.MessageActions,
				isBreakable: true
			},
			SwitchRow: {
				module: DiscordModules.SwitchRow,
				fallback: function fallbackSwitchRow(props) {
					return React.createElement('div', { style: { color: "#fff" } }, [
						props.children,
						React.createElement('input', {
							checked: props.value,
							onChange: (e) => props.onChange(e.target.checked),
							type: "checkbox"
						})
					])
				},
				errorNote: "Sloppy fallback is used"
			},
			ButtonData: {
				module: DiscordModules.ButtonData,
				fallback: function fallbackButtonData(props) {
					return React.createElement('button', props)
				},
				errorNote: "Sloppy fallback is used"
			},
			createChannel: {
				module: waitForModule(m => m.Z.createChannel)
			}
		},
		Plugin(Modules) {
			
			// Constants
			const EVENTS = [
				"THREAD_CREATE_LOCAL",
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
					 * Debating removing this whole loadmessages feature.
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
				channelsStateManager: {
					Init() {
						this.channels = new Set(Data.load('channels') || []);
						this.guilds = new Set(Data.load('guilds') || []);
						this.exceptions = new Set(Data.load('exceptions') || []);
					},
					add(key, target) {
						this[key].add(target);
						Data.save(key, this[key]);
					},
					remove(key, target) {
						this[key].delete(target);
						Data.save(key, this[key]);
					},
					has(key, target) {
						return this[key].has(target);
					},
					getChannelstate(guildId, channelId) {
						if ((this.guilds.has(guildId) && !this.exceptions.has(channelId)) || this.channels.has(channelId))
							return true;
						return false;
					},
					toggelGuild(guildId) {
						if (this.guilds.has(guildId))
							this.remove('guilds', guildId);
						else
							this.add('guilds', guildId);
					},
					toggelChannel(guildId, channelId) {
						if (this.guilds.has(guildId)) {
							if (!this.exceptions.has(channelId))
								this.add('exceptions', channelId);
							else {
								this.remove('exceptions', channelId);
							}
						} else if (this.channels.has(channelId))
							this.remove('channels', channelId);
						else
							this.add('channels', channelId);
					}
				},
				reRender: () => {
					const target = document.querySelector(`#${CLASS_NAME}`)?.parentElement;
					if (!target) return;
					const instance = API.ReactUtils.getOwnerInstance(target);
					const unpatch = Patcher.instead(instance, 'render', () => unpatch());
					instance.forceUpdate(() => instance.forceUpdate());
				}
			}

			// Components
			require("components/ErrorBoundary.jsx");
			const LazyLoaderComponent = require("components/LazyLoaderComponent.jsx");
			const settingComponent = (props) => {
				const [enabled, setEnabled] = useState(props.value);
				return React.createElement(Modules.SwitchRow, {
					value: enabled,
					note: props.note,
					hideBorder: true,
					onChange: e => {
						props.onChange(e);
						setEnabled(e);
					}
				}, props.description);
			}

			// Styles
			function addStyles(){
				DOM.addStyle(require("styles.css"));
			}

			return class LazyLoadChannels {
				constructor() {
					this.settings = Data.load("settings") || { autoloadedChannelIndicator: false };
					Utils.channelsStateManager.Init();
					this.autoLoad = false;
					this.loadChannel = this.loadChannel.bind(this);
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
					 **/
					if (Modules.ChannelComponent)
						Patcher.after(Modules.ChannelComponent.module, Modules.ChannelComponent.key, (_, [{ channel }], returnValue) => {
							if (!this.settings.autoloadedChannelIndicator) return;
							if (Utils.channelsStateManager.getChannelstate(channel.guild_id, channel.id)) returnValue.props.children.props.children[1].props.className += " autoload";
						});
				}

				patchContextMenu() {
					this.unpatchContextMenu = [
						ContextMenu.patch("guild-context", (retVal, { guild }) => {
							if (guild)
								retVal.props.children.splice(1, 0, ContextMenu.buildItem({
									type: "toggle",
									label: "Auto load",
									active: Utils.channelsStateManager.has('guilds', guild.id),
									action: () => Utils.channelsStateManager.toggelGuild(guild.id)
								}));
						}),
						...["channel-context", "thread-context"].map(context =>
							ContextMenu.patch(context, (retVal, { channel }) => {
								if (channel && channel.type !== Modules.ChannelTypeEnum.GUILD_CATEGORY)
									retVal.props.children.splice(1, 0, ContextMenu.buildItem({
										type: "toggle",
										label: "Auto load",
										active: Utils.channelsStateManager.getChannelstate(channel.guild_id, channel.id),
										action: () => Utils.channelsStateManager.toggelChannel(channel.guild_id, channel.id)
									}));
							})
						),
						...["channel-context", "thread-context", "guild-context"].map(context =>
							ContextMenu.patch(context, retVal => retVal.props.children.splice(1, 0, ContextMenu.buildItem({ type: "separator" })))
						)
					]
				}

				patchCreateChannel() {
					/**
					 * Listening for channels created by current user
					 **/
					Modules.createChannel.then(module => {
						Patcher.after(module.Z, "createChannel", (_, [{ guildId }], ret) => {
							if (!Utils.channelsStateManager.has('guilds', guildId))
								ret.then(({ body }) => {
									Utils.channelsStateManager.add('channels', body.id);
								});
						})
					})
				}

				channelSelectHandler({ channelId, guildId, messageId }) {
					/** Ignore if 
					 * messageId !== undefined means it's a jump
					 * guildId === undefined means it's DM
					 * OR channel is autoloaded
					 **/
					if (messageId || !guildId || Utils.channelsStateManager.getChannelstate(guildId, channelId))
						this.loadChannel({ id: channelId, guild_id: guildId }, messageId);
					else
						this.autoLoad = false;
				}

				threadCreateHandler({ channelId }) {
					/**
					 * Listening for threads created by current user
					 **/
					Utils.channelsStateManager.add('channels', channelId);
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
						Utils.channelsStateManager.add('guilds', guild.id);
				}

				guildDeleteHandler({ guild }) {
					Utils.channelsStateManager.remove('guilds', guild.id);
				}

				setupHandlers() {
					this.handlers = [
						["THREAD_CREATE_LOCAL", this.threadCreateHandler],
						["GUILD_CREATE", this.guildCreateHandler],
						["CHANNEL_SELECT", this.channelSelectHandler],
						["GUILD_DELETE", this.guildDeleteHandler]
					].map(([event, handler]) => {
						const boundHandler = handler.bind(this);
						Modules.Dispatcher.subscribe(event, boundHandler);
						return () => Modules.Dispatcher.unsubscribe(event, boundHandler);
					});
				}

				start() {
					try {
						addStyles();
						this.patchChannel();
						this.setupHandlers();
						this.patchCreateChannel();
						this.patchChannelContent();
						this.patchContextMenu();
						EVENTS.forEach(event => Modules.Dispatcher.unsubscribe(event, Modules.ChannelActions.actions[event]));
					} catch (e) {
						console.error(e);
					}
				}

				stop() {
					DOM.removeStyle();
					Patcher.unpatchAll();
					this.unpatchContextMenu?.forEach?.(p => p());
					this.handlers?.forEach?.(h => h());
					this.unpatchContextMenu = null;
					this.handlers = null;
					EVENTS.forEach(event => Modules.Dispatcher.subscribe(event, Modules.ChannelActions.actions[event]));
				}

				getSettingsPanel() {
					return React.createElement(settingComponent, {
						description: "Auto load indicator.",
						note: "Whether or not to show an indicator for channels set to auto load",
						value: this.settings.autoloadedChannelIndicator,
						onChange: e => {
							this.settings.autoloadedChannelIndicator = e;
							Data.save("settings", this.settings);
						}
					});
				}
			}
		}
	}
}