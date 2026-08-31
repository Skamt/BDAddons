/**
 * @runAt idle
 * @name RelationshipNotifier
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/RelationshipNotifier
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/RelationshipNotifier/RelationshipNotifier.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "RelationshipNotifier",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/RelationshipNotifier/RelationshipNotifier.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/RelationshipNotifier",
		"authors": [{
			"name": "Skamt"
		}]
	},
	"settings": {
		"notices": false,
		"offlineRemovals": true,
		"friends": true,
		"friendRequestCancels": true,
		"servers": true,
		"groups": true
	}
};

// common/Api.js
var Api = /* @__PURE__ */ (() => new BdApi(Config_default.info.name))();
var Data = /* @__PURE__ */ (() => Api.Data)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var DOM = /* @__PURE__ */ (() => Api.DOM)();

// common/Utils/Logger.js
Logger.patchError = (patchId) => {
	console.error(`%c[${Config_default.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};
var Logger_default = Logger;

// common/Utils/EventEmitter.js
var EventEmitter_default = class {
	constructor() {
		this.listeners = {};
	}
	isInValid(event, handler) {
		return typeof event !== "string" || typeof handler !== "function";
	}
	once(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		const wrapper = () => {
			handler();
			this.off(event, wrapper);
		};
		this.listeners[event].add(wrapper);
	}
	on(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		this.listeners[event].add(handler);
		return () => this.off(event, handler);
	}
	off(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) return;
		this.listeners[event].delete(handler);
		if (this.listeners[event].size !== 0) return;
		delete this.listeners[event];
	}
	emit(event, ...payload) {
		if (!this.listeners[event]) return;
		for (const listener of this.listeners[event]) {
			try {
				listener.apply(null, payload);
			} catch (err) {
				Logger_default.error(`Could not run listener for ${event}`, err);
			}
		}
	}
};

// common/Utils/Plugin.js
var Events = {
	START: "START",
	STOP: "STOP"
};
var Plugin_default = new class extends EventEmitter_default {
	stopped = true;
	start() {
		this.emit(Events.START);
		this.stopped = false;
	}
	stop() {
		this.emit(Events.STOP);
		this.stopped = true;
	}
}();

// common/React.jsx
var React_default = /* @__PURE__ */ (() => BdApi.React)();

// common/Utils/index.js
var nop = () => {};

// common/Webpack.js
var Webpack = /* @__PURE__ */ (() => BdApi.Webpack)();
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var waitForModule = /* @__PURE__ */ (() => Webpack.waitForModule)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();
var getByKeys = /* @__PURE__ */ (() => Webpack.getByKeys)();

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true });

// common/Utils/Flux.js
var Flux_default = new class {
	init(map) {
		this.setupHandlers(map);
	}
	dispose() {
		this.handlers?.forEach?.((h) => h());
		this.handlers = null;
	}
	setupHandlers(map) {
		this.handlers = Object.entries(map).reduce((acc, item) => {
			Dispatcher_default.subscribe(item[0], item[1]);
			acc.push(() => Dispatcher_default.unsubscribe(item[0], item[1]));
			return acc;
		}, []);
	}
}();

// common/DiscordModules/zustand.js
var { zustand } = getMangled(Filters.bySource("useSyncExternalStoreWithSelector", "useDebugValue", "subscribe"), {
	_: Filters.byStrings("subscribe"),
	zustand: () => true
});
var subscribeWithSelector = getModule(Filters.byStrings("getState", "equalityFn", "fireImmediately"), { searchExports: true });

function create(initialState) {
	const Store = zustand(initialState);
	Object.defineProperty(Store, "state", {
		configurable: false,
		get: () => Store.getState()
	});
	return Store;
}

// common/Utils/Settings.js
var SettingsStore = create(subscribeWithSelector(() => Object.assign(Config_default.settings, Data.load("settings") || {})));
((state) => {
	const selectors = {};
	const actions = {};
	for (const [key, value] of Object.entries(state)) {
		actions[`set${key}`] = (newValue) => SettingsStore.setState({
			[key]: newValue });
		selectors[key] = (state2) => state2[key];
	}
	Object.defineProperty(SettingsStore, "selectors", { value: Object.assign(selectors) });
	Object.assign(SettingsStore, actions);
})(SettingsStore.getInitialState());
SettingsStore.subscribe(
	(state) => state,
	() => Data.save("settings", SettingsStore.state)
);
Object.assign(SettingsStore, {
	useSetting: (key) => {
		const val = SettingsStore((state) => state[key]);
		return [val, SettingsStore[`set${key}`]];
	}
});
var Settings_default = SettingsStore;

// MODULES-AUTO-LOADER:@Modules/FormSwitch
var FormSwitch_default = getModule(Filters.byStrings("note", "tooltipNote"), { searchExports: true });

// common/Components/Switch/index.jsx
var Switch_default = getMangled(Filters.bySource("auxiliaryContentPosition", "hasIcon"), {
	Switch: () => true
})?.Switch || function SwitchComponentFallback(props) {
	return /* @__PURE__ */ React_default.createElement("div", { style: { color: "#fff" } }, props.label, /* @__PURE__ */ React_default.createElement(
		"input", {
			type: "checkbox",
			checked: props.checked,
			onChange: (e) => props.onChange(e.target.checked)
		}
	));
};

// common/Utils/StylesLoader.js
var styleLoader = {
	_styles: [],
	push(styles) {
		this._styles.push(styles);
	}
};
Plugin_default.on(Events.START, () => {
	DOM.addStyle(styleLoader._styles.join("\n"));
});
Plugin_default.on(Events.STOP, () => {
	DOM.removeStyle();
});
var StylesLoader_default = styleLoader;

// common/Components/Divider/styles.css
StylesLoader_default.push(`.divider-horizontal {
	border-top: thin solid var(--border-subtle);
	align-self: stretch;
	margin:var(--divider-gap) var(--divider-gutter) var(--divider-gap) var(--divider-gutter) ;
}

.divider-vertical {
	border-left: thin solid var(--border-subtle);
	align-self: stretch;
	margin:var(--divider-gutter) var(--divider-gap) var(--divider-gutter) var(--divider-gap);
}
`);

// common/Utils/css.js
var classNameFactory = (prefix = "", connector = "-") => (...args) => {
	const classNames = /* @__PURE__ */ new Set();
	for (const arg of args) {
		if (arg && typeof arg === "string") classNames.add(arg);
		else if (Array.isArray(arg)) arg.forEach((name) => classNames.add(name));
		else if (arg && typeof arg === "object") Object.entries(arg).forEach(([name, value]) => value && classNames.add(name));
	}
	return Array.from(classNames, (name) => `${prefix}${connector}${name}`).join(" ");
};

// common/Components/Divider/index.jsx
var c = classNameFactory("divider");

function Divider({ gap = 15, gutter = 0, direction = Divider.direction.HORIZONTAL }) {
	return /* @__PURE__ */ React_default.createElement(
		"div", {
			style: { "--divider-gap": `${gap}px`, "--divider-gutter": `${gutter}%` },
			className: c("base", direction)
		}
	);
}
Divider.direction = {
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical"
};

// common/Components/SettingSwtich/index.jsx
function SettingSwtich({ settingKey, note, border = false, onChange = nop, description, ...rest }) {
	const [val, set] = Settings_default.useSetting(settingKey);
	return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(
		Switch_default, {
			...rest,
			hasIcon: true,
			checked: val,
			label: description || settingKey,
			description: note,
			onChange: (e) => {
				set(e);
				onChange(e);
			}
		}
	), border && /* @__PURE__ */ React_default.createElement(Divider, { gap: 15 }));
}

// MODULES-AUTO-LOADER:@Stores/UserStore
var UserStore_default = getStore("UserStore");

// MODULES-AUTO-LOADER:@Stores/GuildMemberStore
var GuildMemberStore_default = getStore("GuildMemberStore");

// MODULES-AUTO-LOADER:@Stores/GuildStore
var GuildStore_default = getStore("GuildStore");

// MODULES-AUTO-LOADER:@Stores/ChannelStore
var ChannelStore_default = getStore("ChannelStore");

// MODULES-AUTO-LOADER:@Stores/RelationshipStore
var RelationshipStore_default = getStore("RelationshipStore");

// MODULES-AUTO-LOADER:@Stores/GuildAvailabilityStore
var GuildAvailabilityStore_default = getStore("GuildAvailabilityStore");

// MODULES-AUTO-LOADER:@Modules/FetchUser
var FetchUser_default = getModule(Filters.byStrings("USER_UPDATE", "default.getUser", "oldFormErrors"), { searchExports: true });

// common/DiscordModules/Enums.js
var GuildFeaturesEnum = getModule(Filters.byKeys("CLYDE_ENABLED"), { searchExports: true });
var EmojiSendAvailabilityEnum = getModule(Filters.byKeys("GUILD_SUBSCRIPTION_UNAVAILABLE"), { searchExports: true });
var EmojiIntentionEnum = getModule(Filters.byKeys("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true });
var DiscordPermissionsEnum = getModule(Filters.byKeys("ADD_REACTIONS"), { searchExports: true });
var StickerTypeEnum = getModule(Filters.byKeys("GUILD", "STANDARD"), { searchExports: true });
var ProfileTypeEnum = getModule(Filters.byKeys("POPOUT", "SETTINGS"), { searchExports: true });
var ChannelTypeEnum = getModule(Filters.byKeys("GUILD_TEXT", "DM"), { searchExports: true });
var RelationshipTypeEnum = getModule(Filters.byKeys("FRIEND", "PENDING_INCOMING"), { searchExports: true });

// common/Utils/String.js
function isValidString(string) {
	return string && string.length > 0;
}

// MODULES-AUTO-LOADER:@Stores/SelectedChannelStore
var SelectedChannelStore_default = getStore("SelectedChannelStore");

// MODULES-AUTO-LOADER:@Stores/SelectedGuildStore
var SelectedGuildStore_default = getStore("SelectedGuildStore");

// common/DiscordModules/Modules.js
var ComponentDispatch;
waitForModule((m) => m.dispatchToLastSubscribed, { searchExports: true }).then((a) => {
	ComponentDispatch = a;
});
var UserProfileActions = /* @__PURE__ */ (() => getByKeys("openUserProfileModal", "closeUserProfileModal"))();

// common/Utils/User.js
async function openUserProfile(id) {
	const user = await FetchUser_default(id);
	if (!user) return Logger_default.error("No such user: " + id);
	const guildId = SelectedGuildStore_default.getGuildId();
	UserProfileActions.openUserProfileModal({
		userId: id,
		guildId,
		channelId: SelectedChannelStore_default.getChannelId(),
		analyticsLocation: {
			page: guildId ? "Guild Channel" : "DM Channel",
			section: "Profile Popout"
		}
	});
}

function getUserName(userObject = {}) {
	const { global_name, globalName, username } = userObject;
	if (isValidString(global_name)) return global_name;
	if (isValidString(globalName)) return globalName;
	if (isValidString(username)) return username;
}

// src/RelationshipNotifier/utils.js
var guilds = /* @__PURE__ */ new Map();
var groups = /* @__PURE__ */ new Map();
var friends = {
	friends: [],
	requests: []
};
var guildsKey = () => `GUILDS-${UserStore_default.getCurrentUser().id}`;
var groupsKey = () => `GROUPS-${UserStore_default.getCurrentUser().id}`;
var friendsKey = () => `FRIENDS-${UserStore_default.getCurrentUser().id}`;
async function syncAndRunChecks() {
	debugger;
	if (UserStore_default.getCurrentUser() == null) return;
	const [oldGuilds, oldGroups, oldFriends] = [
		new Map(Data.load(guildsKey())),
		new Map(Data.load(groupsKey())),
		{ ...Data.load(friendsKey()), ...{ friends: [], requests: [] } }
	];
	syncGuilds();
	syncGroups();
	syncFriends();
	if (Settings_default.state.offlineRemovals) {
		if (Settings_default.state.groups && oldGroups?.size) {
			for (const [id, group] of oldGroups) {
				if (!groups.has(id)) notify(`You are no longer in the group ${group.name}.`, group.iconURL);
			}
		}
		if (Settings_default.state.servers && oldGuilds?.size) {
			for (const [id, guild] of oldGuilds) {
				if (!guilds.has(id) && !GuildAvailabilityStore_default.isUnavailable(id))
					notify(`You are no longer in the server ${guild.name}.`, guild.iconURL);
			}
		}
		if (Settings_default.state.friends && oldFriends?.friends.length) {
			for (const id of oldFriends.friends) {
				if (friends.friends.includes(id)) continue;
				const user = await FetchUser_default(id).catch(() => void 0);
				if (user)
					notify(
						`You are no longer friends with ${getUserName(user)}.`,
						user.getAvatarURL(void 0, void 0, false),
						() => openUserProfile(user.id)
					);
			}
		}
		if (Settings_default.state.friendRequestCancels && oldFriends?.requests?.length) {
			for (const id of oldFriends.requests) {
				if (friends.requests.includes(id) || [
						RelationshipTypeEnum.FRIEND,
						RelationshipTypeEnum.BLOCKED,
						RelationshipTypeEnum.OUTGOING_REQUEST
					].includes(RelationshipStore_default.getRelationshipType(id)))
					continue;
				const user = await FetchUser_default(id).catch(() => void 0);
				if (user)
					notify(
						`Friend request from ${getUserName(user)} has been revoked.`,
						user.getAvatarURL(void 0, void 0, false),
						() => openUserProfile(user.id)
					);
			}
		}
	}
}

function notify(content, icon) {
	BdApi.UI.showNotification({
		id: `${Config_default.info.name}-${Math.random().toString(36).slice(2)}`,
		title: "Relationship Notifier",
		content,
		type: "info",
		duration: Number.POSITIVE_INFINITY,
		// biome-ignore lint/a11y/useAltText: <explanation>
		icon: () => /* @__PURE__ */ React_default.createElement("img", { src: icon })
	});
}

function getGuild(id) {
	return guilds.get(id);
}

function deleteGuild(id) {
	guilds.delete(id);
	syncGuilds();
}

function syncGuilds() {
	guilds.clear();
	const me = UserStore_default.getCurrentUser().id;
	for (const [id, { name, icon }] of Object.entries(GuildStore_default.getGuilds())) {
		if (GuildMemberStore_default.isMember(id, me))
			guilds.set(id, {
				id,
				name,
				iconURL: icon && `https://cdn.discordapp.com/icons/${id}/${icon}.png`
			});
	}
	Data.save(guildsKey(), new Map(guilds));
}

function getGroup(id) {
	return groups.get(id);
}

function deleteGroup(id) {
	groups.delete(id);
	syncGroups();
}

function syncGroups() {
	groups.clear();
	for (const { type, id, name, rawRecipients, icon } of ChannelStore_default.getSortedPrivateChannels()) {
		if (type === ChannelTypeEnum.GROUP_DM)
			groups.set(id, {
				id,
				name: name || rawRecipients.map((r) => r.username).join(", "),
				iconURL: icon && `https://cdn.discordapp.com/channel-icons/${id}/${icon}.png`
			});
	}
	Data.save(groupsKey(), new Map(groups));
}

function syncFriends() {
	friends.friends = [];
	friends.requests = [];
	const relationShips = RelationshipStore_default.getMutableRelationships();
	for (const [id, type] of relationShips) {
		switch (type) {
			case RelationshipTypeEnum.FRIEND:
				friends.friends.push(id);
				break;
			case RelationshipTypeEnum.PENDING_OUTGOING:
				friends.requests.push(id);
				break;
		}
	}
	Data.save(friendsKey(), { ...friends });
}

// src/RelationshipNotifier/fluxHandlers.js
var manuallyRemovedFriend;
var manuallyRemovedGuild;
var manuallyRemovedGroup;
var removeFriend = (id) => manuallyRemovedFriend = id;
var removeGuild = (id) => manuallyRemovedGuild = id;
var removeGroup = (id) => manuallyRemovedGroup = id;
async function onRelationshipRemove({ relationship: { type, id } }) {
	if (manuallyRemovedFriend === id) {
		manuallyRemovedFriend = void 0;
		return;
	}
	const user = await FetchUser_default(id).catch(() => null);
	if (!user) return;
	switch (type) {
		case RelationshipTypeEnum.FRIEND:
			if (Settings_default.state.friends)
				notify(
					`${getUserName(user)} removed you as a friend.`,
					user.getAvatarURL(void 0, void 0, false),
					() => openUserProfile(user.id)
				);
			break;
		case RelationshipTypeEnum.PENDING_OUTGOING:
			if (Settings_default.state.friendRequestCancels)
				notify(
					`A friend request from ${getUserName(user)} has been removed.`,
					user.getAvatarURL(void 0, void 0, false),
					() => openUserProfile(user.id)
				);
			break;
	}
}

function onGuildDelete({ guild: { id, unavailable } }) {
	if (!Settings_default.state.servers) return;
	if (unavailable || GuildAvailabilityStore_default.isUnavailable(id)) return;
	if (manuallyRemovedGuild === id) {
		deleteGuild(id);
		manuallyRemovedGuild = void 0;
		return;
	}
	const guild = getGuild(id);
	if (guild) {
		deleteGuild(id);
		notify(`You were removed from the server ${guild.name}.`, guild.iconURL);
	}
}

function onChannelDelete({ channel: { id, type } }) {
	if (!Settings_default.state.groups) return;
	if (type !== ChannelTypeEnum.GROUP_DM) return;
	if (manuallyRemovedGroup === id) {
		deleteGroup(id);
		manuallyRemovedGroup = void 0;
		return;
	}
	const group = getGroup(id);
	if (group) {
		deleteGroup(id);
		notify(`You were removed from the group ${group.name}.`, group.iconURL);
	}
}

// src/RelationshipNotifier/index.js
var RelationshipManager = getModule((a) => a.removeRelationship);
var GuildManager = getModule((a) => a.leaveGuild);
var DMManager = getModule((a) => a.addRecipients);
var currentUser = UserStore_default.getCurrentUser();
Plugin_default.on(Events.START, () => {
	RelationshipManager && Patcher.after(RelationshipManager, "removeRelationship", (_, [id]) => removeFriend(id));
	GuildManager && Patcher.after(GuildManager, "leaveGuild", (_, [id]) => removeGuild(id));
	DMManager && Patcher.after(DMManager, "closePrivateChannel", (_, [id]) => removeGroup(id));
	Flux_default.init({
		GUILD_CREATE: syncGuilds,
		GUILD_DELETE: onGuildDelete,
		CHANNEL_CREATE: syncGroups,
		CHANNEL_DELETE: onChannelDelete,
		RELATIONSHIP_ADD: syncFriends,
		RELATIONSHIP_UPDATE: syncFriends,
		RELATIONSHIP_REMOVE(e) {
			onRelationshipRemove(e);
			syncFriends();
		},
		CONNECTION_OPEN() {
			syncAndRunChecks();
		}
	});
	setTimeout(() => {
		syncAndRunChecks();
	}, 5e3);
});
Plugin_default.on(Events.STOP, () => {
	Flux_default.dispose();
	Patcher.unpatchAll();
});
Plugin_default.getSettingsPanel = () => () => [{
		border: true,
		description: "Show Notice",
		note: "Also show a notice at the top of your screen when removed (use this if you don't want to miss any notifications).",
		settingKey: "notices"
	},
	{
		border: true,
		description: "Offline Removals",
		note: "Notify you when starting discord if you were removed while offline.",
		settingKey: "offlineRemovals"
	},
	{
		border: true,
		description: "Declined friend request",
		note: "Notify when a friend request is cancelled",
		settingKey: "friendRequestCancels"
	},
	{
		border: true,
		description: "Friends",
		note: "Notify when a friend removes you",
		settingKey: "friends"
	},
	{
		border: true,
		description: "Servers",
		note: "Notify when removed from a server",
		settingKey: "servers"
	},
	{
		border: true,
		description: "Group DMs",
		note: "Notify when removed from a group chat",
		settingKey: "groups"
	}
].map(SettingSwtich);
module.exports = () => Plugin_default;
