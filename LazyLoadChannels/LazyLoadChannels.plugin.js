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
		id: "autoloadedChannelIndicator",
		name: "Auto load indicator",
		note: "Whether or not to show an indicator for channels set to auto load",
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
			React: { useState, useEffect },
			Webpack: {
				Filters,
				getModule
			}
		} = new BdApi(config.info.name);

		function getModuleAndKey(filter) {
			let module;
			const target = getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true });
			return [module.exports, Object.keys(module.exports).find(k => module.exports[k] === target)];
		}

		// Modules
		const { DiscordModules: { Dispatcher, GuildChannelsStore, MessageActions, SwitchRow, ButtonData } } = Api;
		const ChannelActions = getModule(Filters.byProps('actions', 'fetchMessages'), { searchExports: true });
		const ChannelContent = getModule(m => m && m.Z && m.Z.type && m.Z.type.toString().includes('showingSpamBanner'));
		const DMChannel = getModule(Filters.byStrings('isMobileOnline', 'channel'), { searchExports: true });
		const ChannelTypeEnum = getModule(Filters.byProps('GUILD_TEXT', 'DM'), { searchExports: true });
		const [Channel, ChannelKey] = getModuleAndKey(Filters.byStrings("canHaveDot", "isFavoriteSuggestion", "mentionCount"));

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
				 * This method does not check the cache 
				 * therefore it is only called when messages.length === 0
				 * it also returns a promise, it is used to load messages and show toast 
				 */
				return MessageActions.fetchMessages({ channelId: channel.id });
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
				const target = document.querySelector(`#${CLASS_NAME}`);
				if (!target) return;
				const instance = BdApi.ReactUtils.getOwnerInstance(target);
				const unpatch = Patcher.instead(instance, 'render', () => unpatch());
				instance.forceUpdate(() => instance.forceUpdate());
			}
		}

		// styles
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
}

#lazyLoader > .channel > li{
	max-width: 100%;
	width: 100%;
	margin: 5px;
}

#lazyLoader > .channel > .channelName {
	color: #989aa2;
	padding: 5px 25px 5px 5px;
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

.autoload{
	border-left:4px solid #2e7d46;
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
}`;

		// Components
		const LazyLoader = ({ channel, loadChannel, messages }) => {
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
				if (channelStats.messages)
					Utils.showToast('Messages are alreayd Loaded!!', 'warning');
				else

					Utils.loadChannelMessages(channel).
				then(() => {
					Utils.showToast('Messages are Loaded!!', 'success');
					startBlinking();
				});
			};

			const loadChannelHandler = () => {
				if (checked) Utils.DataManager.add(channel.guild_id, channel.id);
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
			return React.createElement("div", { id: CLASS_NAME, style: { "visibility": "hidden", "height": "100%" } },
				React.createElement("div", { className: "logo" }),
				React.createElement("div", { className: "channel" },
					channel.name ?
					React.createElement(React.Fragment, null, React.createElement("div", { className: "channelIcon" },
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

						React.createElement("div", { className: "channelName" }, channel.name)) :
					React.createElement(DMChannel, { channel: channel, selected: false })),

				React.createElement("div", { className: `stats ${blink}` },
					Object.entries(channelStats).map(([label, stat]) => React.createElement("div", null, label, ": ", stat))),

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
					}, "Auto load")));

		};

		return class LazyLoadChannels extends Plugin {
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
				ChannelActions.fetchMessages({
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
				Patcher.after(ChannelContent.Z, "type", (_, [{ channel }], { props }) => {
					if (this.autoLoad) return;
					return React.createElement(LazyLoader, {
						channel,
						loadChannel: this.loadChannel,
						messages: props.children.props.messages
					});
				});
			}

			patchChannel() {
				/**
				 * adds a class to channels set to be auto loaded
				 * for highlighting them
				 */
				Patcher.after(Channel, ChannelKey, (_, [{ channel }], returnValue) => {
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
							const { SELECTABLE, VOCAL } = GuildChannelsStore.getChannels(id);
							Utils.DataManager.add(id, [...SELECTABLE.map(({ channel }) => channel.id), ...VOCAL.map(({ channel }) => channel.id)]);
						}]
					].map(([label, cb]) => ContextMenu.patch("guild-context", (retVal, { guild }) => {
						if (guild)
							retVal.props.children.splice(1, 0, ContextMenu.buildItem({ type: "button", label, action: () => cb(guild.id) }));
					})),
					...["channel-context", "thread-context"].map(context =>
						ContextMenu.patch(context, (retVal, { channel }) => {
							if (channel && channel.type !== ChannelTypeEnum.GUILD_CATEGORY)
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
				 * OR channel is autoloaded
				 */
				if (messageId || Utils.DataManager.has(guildId, channelId))
					this.loadChannel({ id: channelId, guild_id: guildId }, messageId);
				else
					this.autoLoad = false;
			}

			channelCreateHandler({ channel }) {
				/**
				 * No need to lazy load, channel or thread if first created 
				 */
				if (!channel.isDM())
					Utils.DataManager.add(channel.guild_id, channel.id);
			}

			guildCreateHandler({ guild }) {
				/**
				 * No need to lazy load created guild, save all channels
				 * guild.member_count < 5 just to be safe for now
				 * TODO: Detect guild created properly 
				 */
				if (guild.member_count < 5)
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
					Dispatcher.subscribe(event, boundHandler);
					return () => Dispatcher.unsubscribe(event, boundHandler);
				});
			}

			onStart() {
				try {
					/**
					 * removing all listeners that fetches channel messages  
					 */
					EVENTS.forEach(event => Dispatcher.unsubscribe(event, ChannelActions.actions[event]));
					DOM.addStyle(css);
					this.patchChannel();
					this.setupHandlers();
					this.patchChannelContent();
					this.patchContextMenu();
				} catch (e) {
					console.error(e);
				}
			}

			onStop() {
				DOM.removeStyle();
				Patcher.unpatchAll();
				this.unpatchContextMenu.forEach(p => p());
				this.handlers.forEach(h => h());
				EVENTS.forEach(event => Dispatcher.subscribe(event, ChannelActions.actions[event]));
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
