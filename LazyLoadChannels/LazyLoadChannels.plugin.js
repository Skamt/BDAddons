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
		const ChannelTypeEnum = getModule(Filters.byProps('GUILD_TEXT', 'DM'), { searchExports: true });
		const ChannelActions = getModule(Filters.byProps('actions', 'fetchMessages'), { searchExports: true });
		const ChannelContent = getModule(m => m && m.Z && m.Z.type && m.Z.type.toString().includes('showQuarantinedUserBanner')) || getModule(m => m && m.Z && m.Z.type && m.Z.type.toString().includes('showingSpamBanner'));
		const SwitchRow = getModule(m => m.toString().includes('tooltipNote'), { searchExports: true });
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
		const css = `.lazyLoader {
	width: 100%;
	height: 100%;
	margin: auto;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.lazyLoader .logo {
	flex: 0 1 auto;
	width: 376px;
	height: 162px;
	margin-bottom: 40px;
	background-image: url("/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg");
	background-size: 100% 100%;
}

.lazyLoader .title{
	color: var(--white-500);
	font-size: 24px;
    line-height: 28px;
    font-weight: 600;
    max-width: 640px;
    padding: 0 20px;
    text-align: center;
    margin-bottom: 8px;
}

.lazyLoader .description{
	color: var(--primary-dark-300);
    font-size: 16px;
    line-height: 1.4;
    max-width: 440px;
    text-align: center;
    margin-bottom: 20px;
}

.lazyLoader .controls{
	display: flex;
	flex-direction: column;
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
	flex-direction: row-reverse;
	gap: 10px;
}

.lazyLoader .switch.true > div > label {
	color: var(--text-positive);
}


`;
		// Components
		const LazyLoader = ({ loadedChannel, returnValue, channel, guild }) => {
			const [state, setState] = useState({ render: true, checked: false });
			const loadHandler = () => {
				ChannelActions.actions[EVENTS.CHANNEL_SELECT]({
					channelId: channel.id,
					guildId: guild.id,
					messageId: channel.lastMessageId
				});
				setState({ render: false, checked: false });
				if (state.checked)
					DataManager.add(guild, channel);
				loadedChannel.add(channel.id);
			};
			useEffect(() => { setState({ render: true, checked: false }); }, [channel]);
			return state.render ? React.createElement("div", { className: "lazyLoader" },
					React.createElement("div", { className: "logo" }),
					React.createElement("div", { className: "title" }, "Lazy loading is Enabled!"),
					React.createElement("div", { className: "description" }, "This channel is lazy loaded, If you want to auto load this channel in the future, make sure you enable ", React.createElement("b", null, "Auto load"), " down below before you load it."),
					React.createElement("div", { className: "controls" },
						React.createElement("button", { onClick: loadHandler, className: "load-btn" }, "Load"),
						React.createElement(SwitchRow, {
							className: `${state.checked} switch`,
							hideBorder: "true",
							value: state.checked,
							onChange: (e) => setState({ ...state, checked: e })
						}, "Auto load"))) :
				returnValue;
		};
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
					return React.createElement(LazyLoader, { loadedChannel: this.loadedChannels, channel, guild, returnValue });
				});
				Utils.forceReRender('chat-2ZfjoI');
			}
			channelSelectHandler(e) {
				// if channel set to auto load || if DM and DMs not included in lazy loading 
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
