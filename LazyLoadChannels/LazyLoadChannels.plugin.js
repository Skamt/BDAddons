/**
 * @name LazyLoadChannels
 * @description Lets you choose whether to load a channel
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/LazyLoadChannels
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/LazyLoadChannels/LazyLoadChannels.plugin.js
 */
const config = {
	info: {
		name: "LazyLoadChannels",
		version: "1.0.0",
		description: "Lets you choose whether to load a channel",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/LazyLoadChannels/LazyLoadChannels.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/LazyLoadChannels",
		authors: [{
			name: "Skamt"
		}]
	},
	defaultConfig: [{
		type: "switch",
		id: "includeDm",
		name: "Include DM",
		note: "Whether or not to lazy load DMs",
		value: false
	}]
};

function initPlugin([Plugin, Api]) {
	const plugin = (Plugin, Api) => {
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
		const { DiscordModules: { Dispatcher, GuildStore, GuildChannelsStore, SwitchRow, ButtonData } } = Api;
		const ChannelTypeEnum = getModule(Filters.byProps('GUILD_TEXT', 'DM'), { searchExports: true });
		const ChannelActions = getModule(Filters.byProps('actions', 'fetchMessages'), { searchExports: true });
		const ChannelContent = getModule(m => m && m.Z && m.Z.type && m.Z.type.toString().includes('showingSpamBanner'));
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
		const css = `.lazyLoader {
	width: 100%;
	height: 100%;
	margin: auto;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	user-select: text;
}

.lazyLoader .logo {
	flex: 0 1 auto;
	width: 376px;
	height: 162px;
	margin-bottom: 40px;
	background-image: url("/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg");
	background-size: 100% 100%;
}

.lazyLoader .title {
	color: var(--white-500);
	font-size: 24px;
	line-height: 28px;
	font-weight: 600;
	max-width: 640px;
	padding: 0 20px;
	text-align: center;
	margin-bottom: 8px;
}

.lazyLoader .description {
	color: var(--primary-dark-300);
	font-size: 16px;
	line-height: 1.4;
	max-width: 440px;
	text-align: center;
	margin-bottom: 20px;
}

.lazyLoader .controls {
	display: flex;
	flex-direction: column;
}

.lazyLoader .buttons-container {
	display: flex;
	gap: 10px;
}

.lazyLoader .load-btn {
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 3px;
	font-size: 1em;
	font-weight: 500;
	color: var(--white-500);
	background-color: var(--button-positive-background);
	min-width: 130px;
	min-height: 44px;
}

.lazyLoader .switch {
	min-width: auto;
	margin: 10px;
	padding: 0 5px;
}

.lazyLoader .switch > div {
	gap: 10px;
}

.lazyLoader .switch.true > div > label {
	color: var(--text-positive);
}

.lazyLoader + form {
	display: none;
}

.lazyLoader .channelIcon {
	color: var(--channel-icon);
	margin: 5px;
	font-size: 0;
}

.lazyLoader .channel {
	background: #2e3136;
	box-sizing: border-box;
	padding: 5px 25px 5px 5px;
	min-width: 200px;
	border-radius: 5px;
	display: flex;
	align-items: center;
	font-weight: 500;
	font-size: 1.3em;
	margin-bottom: 20px;
}

.lazyLoader .channelName {
	color: var(--channels-default);
}

.lazyLoader .stats {
	padding: 10px 20px;
	background: #2e3136;
	color: var(--channels-default);
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

.lazyLoader .stats > div:before {
	content: "- ";
}
`;
		// Components
		const LazyLoader = ({ originalComponent, onLoadChannel, onLoadMessages, channelStats, channel }) => {
			const [render, setRender] = useState(true);
			const [checked, setChecked] = useState(false);
			const messagesLoadedRef = useRef(false);
			useEffect(() => {
				if (messagesLoadedRef.current)
					Utils.showToast("Loaded!", "success");
			}, [channelStats.messages]);
			const loadChannelHandler = () => {
				onLoadChannel(channel, checked);
				setRender(false);
			};
			const loadMessagesHandler = () => {
				onLoadMessages(channel);
				messagesLoadedRef.current = true;
			};
			return render ? React.createElement("div", { className: "lazyLoader" },
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
						React.createElement("div", { className: "channelName" }, channel.name || channel.rawRecipients[0].username)),
					React.createElement("div", { className: "stats" },
						Object.keys(channelStats).map((stat) => React.createElement("div", null, stat, ": ", channelStats[stat]))),
					React.createElement("div", { className: "title" }, "Lazy loading is Enabled!"),
					React.createElement("div", { className: "description" }, "This channel is lazy loaded, If you want to auto load this channel in the future, make sure you enable ", React.createElement("b", null, "Auto load"), " down below before you load it."),
					React.createElement("div", { className: "controls" },
						React.createElement("div", { className: "buttons-container" },
							React.createElement(ButtonData, {
								onClick: loadChannelHandler,
								color: ButtonData.Colors.GREEN,
								size: ButtonData.Sizes.LARGE
							}, "Load Channel"),
							React.createElement(ButtonData, {
								onClick: loadMessagesHandler,
								color: ButtonData.Colors.PRIMARY,
								look: ButtonData.Looks.OUTLINED,
								size: ButtonData.Sizes.LARGE
							}, "Load Messages")),
						React.createElement(SwitchRow, {
							className: `${checked} switch`,
							hideBorder: "true",
							value: checked,
							onChange: setChecked
						}, "Auto load"))) :
				originalComponent;
		};
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
						originalComponent: returnValue,
						onLoadChannel: this.loadChannel,
						onLoadMessages: this.loadMessages,
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
	};
	return plugin(Plugin, Api);
}
module.exports = !global.ZeresPluginLibrary ?
	() => ({
		stop() {},
		start() {
			BdApi.UI.showConfirmationModal("Library plugin is needed", [`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`, `Please download it from the officiel website`, "https://betterdiscord.app/plugin/ZeresPluginLibrary"], {
				confirmText: "Ok"
			});
		}
	}) :
	initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
