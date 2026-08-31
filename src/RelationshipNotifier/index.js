import Plugin, { Events } from "@Utils/Plugin";
import Flux from "@Utils/Flux";
import { Patcher } from "@Api";
import { getModule } from "@Webpack";
import SettingSwtich from "@Components/SettingSwtich";
import UserStore from "@Stores/UserStore";

import {
	onChannelDelete,
	onGuildDelete,
	onRelationshipRemove,
	removeFriend,
	removeGroup,
	removeGuild,
} from "./fluxHandlers";

import { syncAndRunChecks, syncFriends, syncGroups, syncGuilds } from "./utils";

const RelationshipManager = getModule((a) => a.removeRelationship);
const GuildManager = getModule((a) => a.leaveGuild);
const DMManager = getModule((a) => a.addRecipients);


let currentUser = UserStore.getCurrentUser();



Plugin.on(Events.START, () => {
	RelationshipManager &&
		Patcher.after(RelationshipManager, "removeRelationship", (_, [id]) => removeFriend(id));
	GuildManager && Patcher.after(GuildManager, "leaveGuild", (_, [id]) => removeGuild(id));
	DMManager && Patcher.after(DMManager, "closePrivateChannel", (_, [id]) => removeGroup(id));

	Flux.init({
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
		CONNECTION_OPEN ()  {
			// if(currentUser.id === UserStore.getCurrentUser().id) return;
			// currentUser = UserStore.getCurrentUser();
			syncAndRunChecks();			
		},
	});

	setTimeout(() => {
		syncAndRunChecks();
	}, 5000);
});

Plugin.on(Events.STOP, () => {
	Flux.dispose();
	Patcher.unpatchAll();
});

Plugin.getSettingsPanel = () => () =>
	[
		{
			border: true,
			description: "Show Notice",
			note: "Also show a notice at the top of your screen when removed (use this if you don't want to miss any notifications).",
			settingKey: "notices",
		},
		{
			border: true,
			description: "Offline Removals",
			note: "Notify you when starting discord if you were removed while offline.",
			settingKey: "offlineRemovals",
		},
		{
			border: true,
			description: "Declined friend request",
			note: "Notify when a friend request is cancelled",
			settingKey: "friendRequestCancels",
		},
		{
			border: true,
			description: "Friends",
			note: "Notify when a friend removes you",
			settingKey: "friends",
		},
		{
			border: true,
			description: "Servers",
			note: "Notify when removed from a server",
			settingKey: "servers",
		},
		{
			description: "Group DMs",
			note: "Notify when removed from a group chat",
			settingKey: "groups",
		},
	].map(SettingSwtich);

module.exports = () => Plugin;
