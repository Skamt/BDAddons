/**
 * @name LazyLoadChannels
 * @description Lets you choose whether to load a channel
 * @version 1.2.14
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/LazyLoadChannels
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/LazyLoadChannels/LazyLoadChannels.plugin.js
 */

const config = {
	"info": {
		"name": "LazyLoadChannels",
		"version": "1.2.14",
		"description": "Lets you choose whether to load a channel",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/LazyLoadChannels/LazyLoadChannels.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/LazyLoadChannels",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"autoloadedChannelIndicator": false,
		"lazyLoadDMs": false
	}
}

// common\Api.js
const Api = new BdApi(config.info.name);
const UI = Api.UI;
const DOM = Api.DOM;
const Data = Api.Data;
const React = Api.React;
const Patcher = Api.Patcher;
const ContextMenu = Api.ContextMenu;
const Logger = Api.Logger;
const Webpack = Api.Webpack;
const findInTree = Api.Utils.findInTree;
/* annoying */
const getOwnerInstance = Api.ReactUtils.getOwnerInstance.bind(Api.ReactUtils);

// common\Webpack.js
const getModule = Webpack.getModule;
const Filters = Webpack.Filters;
const getMangled = Webpack.getMangled;

function getModuleAndKey(filter, options) {
	let module;
	const target = getModule((entry, m) => (filter(entry) ? (module = m) : false), options);
	module = module?.exports;
	if (!module) return {};
	const key = Object.keys(module).find(k => module[k] === target);
	if (!key) return {};
	return { module, key };
}

// common\DiscordModules\Modules.js
const { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});

// common\Utils\Settings.js
const SettingsStoreSelectors = {};
const persistMiddleware = config => (set, get, api) => config(args => (set(args), Data.save("settings", get().getRawState())), get, api);
const SettingsStore = Object.assign(
	zustand(
		persistMiddleware((set, get) => {
			const settingsObj = Object.create(null);
			for (const [key, value] of Object.entries({
					...config.settings,
					...Data.load("settings")
				})) {
				settingsObj[key] = value;
				settingsObj[`set${key}`] = newValue => set({
					[key]: newValue });
				SettingsStoreSelectors[key] = state => state[key];
			}
			settingsObj.getRawState = () => {
				return Object.entries(get())
					.filter(([, val]) => typeof val !== "function")
					.reduce((acc, [key, val]) => {
						acc[key] = val;
						return acc;
					}, {});
			};
			return settingsObj;
		})
	), {
		useSetting: function(key) {
			return this(state => [state[key], state[`set${key}`]]);
		},
		selectors: SettingsStoreSelectors
	}
);
Object.defineProperty(SettingsStore, "state", {
	writeable: false,
	configurable: false,
	get() {
		return this.getState();
	}
});
const Settings = SettingsStore;

// common\Utils\ControlKeys.js
const ControlKeys = {
	init() {
		this.subs = ["keydown", "keyup"].map(event => {
			const handler = e => this.e = e;
			document.addEventListener(event, handler);
			return () => document.removeEventListener(event, handler);
		});
	},
	clean() {
		this.subs?.forEach(unsub => unsub && typeof unsub === "function" && unsub());
	},
	get ctrlKey() {
		return this.e?.ctrlKey;
	},
	get shiftKey() {
		return this.e?.shiftKey;
	},
	get metaKey() {
		return this.e?.metaKey;
	}
};

// common\Utils\Logger.js
Logger.patchError = patchId => {
	console.error(`%c[${config.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};

// src\LazyLoadChannels\ChannelsStateManager.js
const ChannelsStateManager = {
	init() {
		this.channels = new Set(Data.load("channels") || []);
		this.guilds = new Set(Data.load("guilds") || []);
		this.exceptions = new Set(Data.load("exceptions") || []);
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
		if ((this.guilds.has(guildId) && !this.exceptions.has(channelId)) || this.channels.has(channelId)) return true;
		return false;
	},
	toggelGuild(guildId) {
		if (this.guilds.has(guildId)) this.remove("guilds", guildId);
		else this.add("guilds", guildId);
	},
	toggelChannel(guildId, channelId) {
		if (this.guilds.has(guildId)) {
			if (!this.exceptions.has(channelId)) this.add("exceptions", channelId);
			else {
				this.remove("exceptions", channelId);
			}
		} else if (this.channels.has(channelId)) this.remove("channels", channelId);
		else this.add("channels", channelId);
	}
};

// @Modules\Dispatcher
const Dispatcher = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: false });

// @Modules\ChannelActions
const ChannelActions = getModule(Filters.byKeys("actions", "fetchMessages"), { searchExports: true });

// common\Utils.jsx
function reRender(selector) {
	const target = document.querySelector(selector)?.parentElement;
	if (!target) return;
	const instance = getOwnerInstance(target);
	const unpatch = Patcher.instead(instance, "render", () => unpatch());
	instance.forceUpdate(() => instance.forceUpdate());
}
const nop = () => {};

// @Modules\FormSwitch
const FormSwitch = getModule(Filters.byStrings("note", "tooltipNote"), { searchExports: true });

// common\Components\Switch\index.jsx
const Switch = FormSwitch ||
	function SwitchComponentFallback(props) {
		return (
			React.createElement('div', { style: { color: "#fff" }, }, props.children, React.createElement('input', {
				type: "checkbox",
				checked: props.value,
				onChange: e => props.onChange(e.target.checked),
			}))
		);
	};

// common\Components\SettingSwtich\index.jsx
function SettingSwtich({ settingKey, note, onChange = nop, hideBorder = false, description, ...rest }) {
	const [val, set] = Settings.useSetting(settingKey);
	return (
		React.createElement(Switch, {
			...rest,
			value: val,
			note: note,
			hideBorder: hideBorder,
			onChange: e => {
				set(e);
				onChange(e);
			},
		}, description || settingKey)
	);
}

// src\LazyLoadChannels\components\SettingComponent.jsx
const SettingComponent = () => {
	return [{
			settingKey: "autoloadedChannelIndicator",
			description: "Auto load indicator.",
			note: "Whether or not to show an indicator for channels set to auto load"
		},
		{
			settingKey: "lazyLoadDMs",
			description: "Lazy load DMs.",
			note: "Whether or not to consider DMs for lazy loading"
		}
	].map(SettingSwtich);
};

// @Patch\ChannelComponent
const ChannelComponent = getModuleAndKey(Filters.byStrings("hasActiveThreads", "channelTypeOverride"), { searchExports: true }) || {};

// src\LazyLoadChannels\patches\patchChannel.js
const patchChannel = () => {
	const { module, key } = ChannelComponent;
	if (!module || !key) return Logger.patchError("Channel");
	Patcher.after(module, key, (_, [{ channel }], returnValue) => {
		if (!Settings.state.autoloadedChannelIndicator) return;
		if (ChannelsStateManager.getChannelstate(channel.guild_id, channel.id)) returnValue.props.children.props.children[1].props.className += " autoload";
	});
};

// @Modules\TreadComponent
const TreadComponent = getModule(a => a?.type?.toString().includes("GUILD_CHANNEL_LIST"), { searchExports: false });

// src\LazyLoadChannels\patches\patchThread.js
const patchThread = () => {
	if (TreadComponent)
		Patcher.after(TreadComponent, "type", (_, [{ thread }], returnValue) => {
			if (!Settings.state.autoloadedChannelIndicator) return;
			if (ChannelsStateManager.getChannelstate(thread.guild_id, thread.id))
				returnValue.props.className += " autoload";
		});
	else Logger.patchError("Tread");
};

// @Modules\CreateChannel
const CreateChannel = getModule(m => m.createChannel, { searchExports: false });

// src\LazyLoadChannels\patches\patchCreateChannel.js
const patchCreateChannel = () => {
	/**
	 * Listening for channels created by current user
	 **/
	if (CreateChannel)
		Patcher.after(CreateChannel, "createChannel", (_, [{ guildId }], ret) => {
			if (!ChannelsStateManager.has("guilds", guildId))
				ret.then(({ body }) => {
					ChannelsStateManager.add("channels", body.id);
				});
		});
	else Logger.patchError("CreateChannel");
};

// @Modules\ChannelContent
const ChannelContent = getModule(m => m.type && m.type.toString?.().includes("messageGroupSpacing"), { searchExports: false });

// common\Components\ErrorBoundary\index.jsx
class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null, info: null };
	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		const errorMessage = `\n\t${error?.message || ""}${(info?.componentStack || "").split("\n").slice(0, 20).join("\n")}`;
		console.error(`%c[${config?.info?.name || "Unknown Plugin"}] %cthrew an exception at %c[${this.props.id}]\n`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;", errorMessage);
	}
	renderErrorBoundary() {
		return (
			React.createElement('div', { style: { background: "#292c2c", padding: "20px", borderRadius: "10px" }, }, React.createElement('b', { style: { color: "#e0e1e5" }, }, "An error has occured while rendering ", React.createElement('span', { style: { color: "orange" }, }, this.props.id)))
		);
	}
	renderFallback() {
		if (React.isValidElement(this.props.fallback)) {
			if (this.props.passMetaProps)
				this.props.fallback.props = {
					id: this.props.id,
					plugin: config?.info?.name || "Unknown Plugin",
					...this.props.fallback.props
				};
			return this.props.fallback;
		}
		return (
			React.createElement(this.props.fallback, {
				id: this.props.id,
				plugin: config?.info?.name || "Unknown Plugin",
			})
		);
	}
	render() {
		if (!this.state.hasError) return this.props.children;
		return this.props.fallback ? this.renderFallback() : this.renderErrorBoundary();
	}
}

// src\LazyLoadChannels\Constants.js
const EVENTS = [
	"THREAD_CREATE_LOCAL",
	"THREAD_LIST_SYNC",
	"THREAD_CREATE",
	"CHANNEL_SELECT",
	"CHANNEL_PRELOAD",
	"GUILD_CREATE"
];
const COMPONENT_ID = "lazyLoader";
const REGEX = {
	image: /(jpg|jpeg|png|bmp|tiff|psd|raw|cr2|nef|orf|sr2)/i,
	video: /(mp4|avi|wmv|mov|flv|mkv|webm|vob|ogv|m4v|3gp|3g2|mpeg|mpg|m2v|m4v|svi|3gpp|3gpp2|mxf|roq|nsv|flv|f4v|f4p|f4a|f4b)/i
};

// src\LazyLoadChannels\components\ErrorFallbackComponent.jsx
const ErrorFallbackComponent = props => {
	return (
		React.createElement('div', { id: COMPONENT_ID, }, React.createElement('div', { className: "logo", }), React.createElement('div', { className: "title", }, "An error has occured while rendering ", React.createElement('span', { style: { fontWeight: "bold", color: "orange" }, }, props.id)), React.createElement('div', { className: "description", }, "Open console for more information"))
	);
};

// common\Utils\Toast.js
function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { timeout: 5000, type });
}
const Toast = {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
};

// @Modules\MessageActions
const MessageActions = getModule(Filters.byKeys('jumpToMessage', '_sendMessage'), { searchExports: false });

// @Modules\Button
const Button$1 = getModule(a => a && a.Link && a.Colors, { searchExports: true });

// common\Components\Button\index.jsx
const Button = Button$1 ||
	function ButtonComponentFallback(props) {
		return React.createElement('button', { ...props, });
	};

// src\LazyLoadChannels\components\LazyLoaderComponent.jsx
function loadChannelMessages(channel) {
	/**
	 * This method of fetching messages makes API request without checking the cache
	 * therefore it is only called when messages.length === 0
	 * and because it returns a promise, it is used to load messages and show toast
	 * Debating removing this whole loadmessages feature.
	 */
	return MessageActions.fetchMessages({ channelId: channel.id });
}
const filters = {
	attachments: type => a => a.content_type?.includes("type") || REGEX[type].test(a.filename),
	embeds: type => e => e.type === type
};

function getChannelStats(messages) {
	return messages.reduce(
		(stats, { reactions, embeds, attachments }) => {
			stats.reactions += reactions.length;
			stats.embeds += embeds.filter(e => e.type?.includes("rich")).length;
			stats.links += embeds.filter(e => e.type?.includes("rich")).length;
			stats.images += attachments.filter(filters.attachments("image")).length + embeds.filter(filters.embeds("image")).length;
			stats.videos += attachments.filter(filters.attachments("video")).length + embeds.filter(filters.embeds("video")).length;
			return stats;
		}, { messages: messages.length, reactions: 0, embeds: 0, links: 0, images: 0, videos: 0 }
	);
}
const LazyLoaderComponent = ({ channel, loadChannel, messages }) => {
	const [blink, setBlink] = React.useState("");
	const [checked, setChecked] = React.useState(false);
	const channelStats = getChannelStats(messages);
	const loadMessagesHandler = () => {
		if (channelStats.messages) Toast.warning("Messages are already Loaded!!");
		else
			loadChannelMessages(channel).then(() => {
				Toast.success("Messages are Loaded!!");
				startBlinking();
			});
	};
	const startBlinking = () => {
		setBlink("blink");
		setTimeout(() => setBlink(""), 1200);
	};
	const loadChannelHandler = () => {
		if (checked) ChannelsStateManager.add("channels", channel.id);
		loadChannel(channel);
		/**
		 * rerending like this because i needed this component to be removed from the vDom
		 * otherwise some stores don't get updated since this component is replacing
		 * a context provider, i could just throw a minor error instead, not sure which is better.
		 */
		reRender(`#${COMPONENT_ID}`);
	};
	/**
	 * visibility set to hidden by default because when the plugin unloads
	 * the css is removed while the component is still on screen,
	 * and it looks like a Steaming Pile of Hot Garbage
	 */
	return (
		React.createElement('div', {
			id: COMPONENT_ID,
			style: { "visibility": "hidden", "height": "100%" },
		}, React.createElement('div', { className: "logo", }), React.createElement(Channel, { channel: channel, }), React.createElement('div', { className: "title", }, "Lazy loading is Enabled!"), React.createElement('div', { className: "description", }, "This channel is lazy loaded, If you want to auto load this channel in the future, make sure you enable ", React.createElement('b', null, "Auto load"), " down below before you load it."), React.createElement('div', { className: "controls", }, React.createElement('div', { className: "buttons-container", }, React.createElement(Button, {
			onClick: loadChannelHandler,
			color: Button?.Colors?.GREEN,
			size: Button?.Sizes?.LARGE,
		}, "Load Channel"), React.createElement(Button, {
			onClick: loadMessagesHandler,
			color: Button?.Colors?.PRIMARY,
			look: Button?.Looks?.OUTLINED,
			size: Button?.Sizes?.LARGE,
		}, "Load Messages")), React.createElement(Switch, {
			className: `${checked} switch`,
			hideBorder: "true",
			value: checked,
			onChange: setChecked,
		}, "Auto load")), !channelStats.messages || (
			React.createElement('div', { className: `stats ${blink}`, }, Object.entries(channelStats).map(([label, stat], index) => (
				React.createElement('div', { key: `${label}-${index}`, }, label, ": ", stat)
			)))
		))
	);
};

function Channel({ channel }) {
	const isDm = channel.guild_id === null;
	return isDm ? (
		React.createElement('div', { className: "DM", }, React.createElement('div', { className: "DMName", }, channel.rawRecipients.map(a => `@${a.username}`).join(", ")))
	) : (
		React.createElement('div', { className: "channel", }, React.createElement('div', { className: "channelIcon", }, React.createElement('svg', {
			role: "img",
			'aria-label': "channel-icon",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
		}, React.createElement('path', {
			fill: "currentColor",
			fillRule: "evenodd",
			clipRule: "evenodd",
			d: "M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z",
		}))), React.createElement('div', { className: "channelName", }, channel.name))
	);
}

// src\LazyLoadChannels\patches\patchChannelContent.jsx
const patchChannelContent = context => {
	/**
	 * main patch for the plugin.
	 */
	if (ChannelContent)
		Patcher.after(ChannelContent, "type", (_, [{ channel }], ret) => {
			if (context.autoLoad) return;
			const messages = findInTree(ret, a => a.messages, { walkable: ["props", "children"] }).messages || [];
			return (
				React.createElement(ErrorBoundary, {
					id: "LazyLoaderComponent",
					passMetaProps: true,
					fallback: ErrorFallbackComponent,
					plugin: config.info.name,
				}, React.createElement(LazyLoaderComponent, {
					channel: channel,
					loadChannel: context.loadChannel,
					messages: messages,
				}))
			);
		});
	else Logger.patchError("ChannelContent");
};

// @Enums\ChannelTypeEnum
const ChannelTypeEnum = getModule(Filters.byKeys("GUILD_TEXT", "DM"), { searchExports: true }) || {
	"GUILD_CATEGORY": 4
};

// src\LazyLoadChannels\patches\patchContextMenu.js
const patchContextMenu = () => {
	return [
		ContextMenu.patch("user-context", (retVal, { channel, targetIsUser }) => {
			if (targetIsUser) return;
			if (!Settings.state.lazyLoadDMs) return;
			retVal.props.children.splice(1, 0, ContextMenu.buildItem({
				type: "toggle",
				label: "Auto load",
				active: ChannelsStateManager.getChannelstate(channel.guild_id, channel.id),
				action: () => ChannelsStateManager.toggelChannel(channel.guild_id, channel.id)
			}));
		}),
		ContextMenu.patch("guild-context", (retVal, { guild }) => {
			if (guild)
				retVal.props.children.splice(1, 0, ContextMenu.buildItem({
					type: "toggle",
					label: "Auto load",
					active: ChannelsStateManager.has('guilds', guild.id),
					action: () => ChannelsStateManager.toggelGuild(guild.id)
				}));
		}),
		...["channel-context", "thread-context"].map(context =>
			ContextMenu.patch(context, (retVal, { channel }) => {
				if (channel && channel.type !== ChannelTypeEnum.GUILD_CATEGORY)
					retVal.props.children.splice(1, 0, ContextMenu.buildItem({
						type: "toggle",
						label: "Auto load",
						active: ChannelsStateManager.getChannelstate(channel.guild_id, channel.id),
						action: () => ChannelsStateManager.toggelChannel(channel.guild_id, channel.id)
					}));
			})
		),
		...["channel-context", "thread-context", "guild-context"].map(context =>
			ContextMenu.patch(context, retVal => retVal.props.children.splice(1, 0, ContextMenu.buildItem({ type: "separator" })))
		)
	]
};

// src\LazyLoadChannels\index.jsx
class LazyLoadChannels {
	constructor() {
		ChannelsStateManager.init();
		this.autoLoad = false;
		this.loadChannel = this.loadChannel.bind(this);
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
	threadCreateHandler({ channelId }) {
		/**
		 * Listening for threads created by current user
		 **/
		ChannelsStateManager.add("channels", channelId);
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
		if (guildCreateDate === nowDate) ChannelsStateManager.add("guilds", guild.id);
	}
	channelSelectHandler({ channelId, guildId, messageId }) {
		/** Ignore if
		 * messageId !== undefined means it's a jump
		 * !guildId means it's DM
		 * OR channel is autoloaded
		 **/
		if (ControlKeys.ctrlKey || messageId || (!guildId && !Settings.state.lazyLoadDMs) || ChannelsStateManager.getChannelstate(guildId, channelId)) this.loadChannel({ id: channelId, guild_id: guildId }, messageId);
		else this.autoLoad = false;
	}
	guildDeleteHandler({ guild }) {
		ChannelsStateManager.remove("guilds", guild.id);
	}
	setupHandlers() {
		this.handlers = [
			["THREAD_CREATE_LOCAL", this.threadCreateHandler],
			["GUILD_CREATE", this.guildCreateHandler],
			["CHANNEL_SELECT", this.channelSelectHandler],
			["GUILD_DELETE", this.guildDeleteHandler]
		].map(([event, handler]) => {
			const boundHandler = handler.bind(this);
			Dispatcher.subscribe(event, boundHandler);
			return () => Dispatcher.unsubscribe(event, boundHandler);
		});
	}
	start() {
		try {
			ControlKeys.init();
			DOM.addStyle(css);
			this.setupHandlers();
			patchChannel();
			patchThread();
			patchCreateChannel();
			patchChannelContent(this);
			this.unpatchContextMenu = patchContextMenu();
			EVENTS.forEach(event => Dispatcher.unsubscribe(event, ChannelActions.actions[event]));
		} catch (e) {
			Logger.error(e);
		}
	}
	stop() {
		ControlKeys.clean();
		DOM.removeStyle();
		Patcher.unpatchAll();
		this.unpatchContextMenu?.forEach?.(p => p());
		this.handlers?.forEach?.(h => h());
		this.unpatchContextMenu = null;
		this.handlers = null;
		EVENTS.forEach(event => Dispatcher.subscribe(event, ChannelActions.actions[event]));
	}
	getSettingsPanel() {
		return React.createElement(SettingComponent, null);
	}
}

module.exports = LazyLoadChannels;

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

#lazyLoader ~ * {
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

#lazyLoader > .DM,
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

#lazyLoader > .DM > .DMName,
#lazyLoader > .channel > .channelName {
    color: #989aa2;
    padding: 8px 25px 8px 5px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
#lazyLoader > .DM{
	min-width: auto;
}
#lazyLoader > .DM > .DMName{
	padding: 8px;
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

.autoload > div > div,
.autoload a{
	border-left:4px solid #2e7d46;
}`;
