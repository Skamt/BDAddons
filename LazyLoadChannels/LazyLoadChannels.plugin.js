/**
 * @name LazyLoadChannels
 * @description Lets you choose whether to load a channel
 * @version 1.1.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/LazyLoadChannels
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/LazyLoadChannels/LazyLoadChannels.plugin.js
 */

const config = {
	info: {
		name: "LazyLoadChannels",
		version: "1.1.0",
		description: "Lets you choose whether to load a channel",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/LazyLoadChannels/LazyLoadChannels.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/LazyLoadChannels",
		authors: [{
			name: "Skamt"
		}]
	}
};

function main(Api) {
	const { React, Webpack: { Filters, getModule, waitForModule } } = BdApi;

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
				module: getModule(Filters.byProps('actions', 'fetchMessages'), { searchExports: true }),
				isBreakable: true
			},
			ChannelContent: {
				module: getModule(m => m && m.Z && m.Z.type && m.Z.type.toString().includes('showingSpamBanner')),
				isBreakable: true
			},
			ChannelTypeEnum: {
				module: getModule(Filters.byProps('GUILD_TEXT', 'DM'), { searchExports: true }),
				fallback: { GUILD_CATEGORY: 4 },
				errorNote: "fallback is used, there maybe side effects"
			},
			ChannelComponent: {
				module: getModuleAndKey(Filters.byStrings('canHaveDot', 'isFavoriteSuggestion', 'mentionCount')),
				withKey: true,
				errorNote: "Channel indicators are disabled"
			},
			Dispatcher: {
				module: getModule(Filters.byProps('dispatch', 'subscribe')),
				isBreakable: true
			},
			MessageActions: {
				module: getModule(Filters.byProps('jumpToMessage', '_sendMessage')),
				isBreakable: true
			},
			SwitchRow: {
				module: getModule(m => m.toString().includes('tooltipNote'), { searchExports: true }),
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
				module: getModule(m => m.BorderColors, { searchExports: true }),
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
					const instance = BdApi.ReactUtils.getOwnerInstance(target);
					const unpatch = Patcher.instead(instance, 'render', () => unpatch());
					instance.forceUpdate(() => instance.forceUpdate());
				}
			}

			// Components
			const ErrorBoundary = class ErrorBoundary extends React.Component {
				state = { hasError: false, error: null, info: null };
				componentDidCatch(error, info) {
					this.setState({ error, info, hasError: true });
					const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
					console.error(`%c[${this.props.plugin}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
				}

				render() {
					if (this.state.hasError) {
						return (
							React.createElement("div", { id: CLASS_NAME, className: `EB-${this.props.plugin}-${this.props.id}` },
								React.createElement("div", { className: "logo" }),
								React.createElement("div", { className: "title" }, "An error has occured while rendering ", React.createElement("span", { style: { fontWeight: "bold", color: "orange" } }, this.props.id)),
								React.createElement("div", { className: "description" }, "Open console for more information")));

					}
					return this.props.children;
				}
			};
			const LazyLoaderComponent = ({ channel, loadChannel, messages }) => {
				const [blink, setBlink] = useState("");
				const [checked, setChecked] = useState(false);
				const [channelStats, setChannelStats] = useState({ messages: 0, reactions: 0, embeds: 0, links: 0, images: 0, videos: 0 });
				const startBlinking = () => {
					setBlink("blink");
					setTimeout(() => setBlink(""), 1200);
				};
				useEffect(() => {
					setChannelStats(Utils.getChannelStats(messages));
				}, [messages.length]);

				const loadMessagesHandler = () => {
					if (channelStats.messages) Utils.showToast("Messages are alreayd Loaded!!", "warning");
					else

						Utils.loadChannelMessages(channel).then(() => {
							Utils.showToast("Messages are Loaded!!", "success");
							startBlinking();
						});
				};

				const loadChannelHandler = () => {
					if (checked) Utils.channelsStateManager.add('channels', channel.id);
					loadChannel(channel);
					/**
					 * rerending like this because i needed this component to be removed from the vDom
					 * otherwise some stores don't get updated since this component is replacing
					 * a context provider, i could just throw a minor error instead, not sure which is better.
					 */
					Utils.reRender();
				};

				/**
				 * visibility set to hidden by default because when the plugin unloads
				 * the css is removed while the component is still on screen,
				 * and it looks like a Steaming Pile of Hot Garbage
				 */
				return React.createElement("div", {
						id: CLASS_NAME,
						style: { "visibility": "hidden", "height": "100%" }
					},
					React.createElement("div", { className: "logo" }),
					React.createElement("div", { className: "channel" },
						React.createElement("div", { className: "channelIcon" },
							React.createElement("svg", {
									width: "24",
									height: "24",
									viewBox: "0 0 24 24"
								},
								React.createElement("path", {
									fill: "currentColor",
									"fill-rule": "evenodd",
									"clip-rule": "evenodd",
									d: "M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"
								}))),

						React.createElement("div", { className: "channelName" }, channel.name)),

					React.createElement("div", { className: `stats ${blink}` },
						Object.entries(channelStats).map(([label, stat]) =>
							React.createElement("div", null,
								label, ": ", stat))),

					React.createElement("div", { className: "title" }, "Lazy loading is Enabled!"),
					React.createElement("div", { className: "description" }, "This channel is lazy loaded, If you want to auto load this channel in the future, make sure you enable ",
						React.createElement("b", null, "Auto load"), " down below before you load it."),

					React.createElement("div", { className: "controls" },
						React.createElement("div", { className: "buttons-container" },
							React.createElement(Modules.ButtonData, {
								onClick: loadChannelHandler,
								color: Modules.ButtonData?.Colors?.GREEN,
								size: Modules.ButtonData?.Sizes?.LARGE
							}, "Load Channel"),

							React.createElement(Modules.ButtonData, {
								onClick: loadMessagesHandler,
								color: Modules.ButtonData?.Colors?.PRIMARY,
								look: Modules.ButtonData?.Looks?.OUTLINED,
								size: Modules.ButtonData?.Sizes?.LARGE
							}, "Load Messages")),

						React.createElement(Modules.SwitchRow, {
							className: `${checked} switch`,
							hideBorder: "true",
							value: checked,
							onChange: setChecked
						}, "Auto load")));

			};
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
			const css = `#lazyLoader {
	width: 100%;
	height: 100%;
	margin: auto;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	user-select: text;
	visibility: visible !important;
}

#lazyLoader + form {
	display: none;
}

#lazyLoader > .logo {
	flex: 0 1 auto;
	width: 376px;
	height: 162px;
	margin-bottom: 20px;
	background-image: url("https://raw.githubusercontent.com/Skamt/BDAddons/main/LazyLoadChannels/assets/lazy-loader-logo.svg");
	background-size: 100% 100%;
}

#lazyLoader > .channel {
    background: #232527;
    box-sizing: border-box;
    min-width: 200px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 1.3em;
    margin-bottom: 20px;
    max-width: 600px;
}

#lazyLoader > .channel > .channelName {
    color: #989aa2;
    padding: 8px 25px 8px 5px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

#lazyLoader > .channel > .channelIcon {
	color: #989aa2;
	margin: 5px;
	font-size: 0;
}

#lazyLoader .stats {
	padding: 10px 20px;
	background: #2e3136;
	color: #989aa2;
	box-sizing: border-box;
	display: flex;
	gap: 5px;
	border: 2px solid;
	flex-direction: column;
	min-width: 200px;
	position: absolute;
	bottom: 20px;
	right: 20px;
	text-transform: capitalize;
}

#lazyLoader .stats > div:before {
	content: "- ";
}

#lazyLoader > .title {
	color: #fff;
	font-size: 24px;
	line-height: 28px;
	font-weight: 600;
	max-width: 640px;
	padding: 0 20px;
	text-align: center;
	margin-bottom: 8px;
}

#lazyLoader > .description {
	color: #c7c8ce;
	font-size: 16px;
	line-height: 1.4;
	max-width: 440px;
	text-align: center;
	margin-bottom: 20px;
}

#lazyLoader > .controls {
	display: flex;
	flex-direction: column;
}

#lazyLoader > .controls > .buttons-container {
	display: flex;
	gap: 10px;
}

#lazyLoader > .controls > .switch {
	min-width: auto;
	margin: 10px;
	padding: 0 5px;
}

#lazyLoader > .controls > .switch.true > div > label {
	color: #2dc771;
}

#lazyLoader .stats.blink {
    animation: de-wobble 1s;
}

@keyframes de-wobble {

  16.666666666666668% {    
    transform: translateX(-30px) rotate(-6deg);
  }
  33.333333333333336% {    
    transform: translateX(15px) rotate(6deg);
  }
  50% {    
    transform: translateX(-15px) rotate(-3.6deg);
  }
  66.66666666666667% {    
    transform: translateX(9px) rotate(2.4deg);
  }
  83.33333333333334% {    
    transform: translateX(-6px) rotate(-1.2deg);
  }
  100% {    
    transform: translateX(0px) rotate(0deg);
  }
}

.autoload{
	border-left:4px solid #2e7d46;
}`;

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
									action: _ => Utils.channelsStateManager.toggelGuild(guild.id)
								}));
						}),
						...["channel-context", "thread-context"].map(context =>
							ContextMenu.patch(context, (retVal, { channel }) => {
								if (channel && channel.type !== Modules.ChannelTypeEnum.GUILD_CATEGORY)
									retVal.props.children.splice(1, 0, ContextMenu.buildItem({
										type: "toggle",
										label: "Auto load",
										active: Utils.channelsStateManager.getChannelstate(channel.guild_id, channel.id),
										action: _ => Utils.channelsStateManager.toggelChannel(channel.guild_id, channel.id)
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
						DOM.addStyle(css);
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

function pluginErrorAlert(content) {
	BdApi.alert(config.info.name, content);
}

function getErrorPlugin(message) {
	return () => ({
		stop() {},
		start() {
			pluginErrorAlert(message);
		}
	})
}

function checkModules(modules) {
	return Object.entries(modules).reduce((acc, [moduleName, { module, fallback, errorNote, isBreakable, withKey }]) => {
		if ((withKey && !module.module) || !module) {
			if (isBreakable) acc[0] = true;
			acc[2].push([moduleName, errorNote]);
			if (fallback) acc[1][moduleName] = fallback;
		} else
			acc[1][moduleName] = module;
		return acc;
	}, [false, {},
		[]
	]);
}

function ensuredata() {
	return BdApi.Data.load(config.info.name, 'brokenModulesData') || {
		version: config.info.version,
		errorPopupCount: 0,
		savedBrokenModules: []
	};
}

function setPluginMetaData() {
	const { version, changelog = false } = ensuredata();
	if (version != config.info.version || !changelog) {
		// TODO showChangelog();
		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			version: config.info.version,
			changelog: true,
			errorPopupCount: 0,
			savedBrokenModules: []
		});
	}
}

function handleBrokenModules(brokenModules) {
	const current = ensuredata();

	const newBrokenModules = brokenModules.some(([newItem]) => !current.savedBrokenModules.includes(newItem));
	const isUpdated = current.version != config.info.version;
	const isPopupLimitReached = current.errorPopupCount === 3;

	if (isUpdated || !isPopupLimitReached || newBrokenModules) {
		pluginErrorAlert([
			"Detected some Missing modules, certain aspects of the plugin may not work properly.",
			`\`\`\`md\nMissing modules:\n\n${brokenModules.map(([moduleName, errorNote]) => `[${moduleName}]: ${errorNote || ""}`).join('\n')}\`\`\``
		]);

		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			...current,
			version: current.version,
			errorPopupCount: (current.errorPopupCount + 1) % 4,
			savedBrokenModules: brokenModules.map(([moduleName]) => moduleName)
		});
	}
}

function initPlugin() {
	setPluginMetaData();
	const { Modules, Plugin } = main();

	const [pluginBreakingError, SafeModules, BrokenModules] = checkModules(Modules);

	if (pluginBreakingError)
		return getErrorPlugin([
			"**Plugin is broken:** Take a screenshot of this popup and show it to the dev.",
			`\`\`\`md\nMissing modules:\n\n${BrokenModules.map(([moduleName],i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
		]);
	else {
		if (BrokenModules.length > 0)
			handleBrokenModules(BrokenModules);
		return Plugin(SafeModules);
	}
}

module.exports = initPlugin();
