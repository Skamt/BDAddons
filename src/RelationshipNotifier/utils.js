import { Data } from "@Api";
import React from "@React";
import config from "@Config";
import GuildMemberStore from "@Stores/GuildMemberStore";
import UserStore from "@Stores/UserStore";
import GuildStore from "@Stores/GuildStore";
import ChannelStore from "@Stores/ChannelStore";
import RelationshipStore from "@Stores/RelationshipStore";
import GuildAvailabilityStore from "@Stores/GuildAvailabilityStore";
import FetchUser from "@Modules/FetchUser";
import { ChannelTypeEnum, RelationshipTypeEnum } from "@Discord/Enums";
import Settings from "@Utils/Settings";

import { openUserProfile, getUserName } from "@Utils/User";

const guilds = new Map();
const groups = new Map();
const friends = {
	friends: [],
	requests: [],
};

const guildsKey = () => `GUILDS-${UserStore.getCurrentUser().id}`;
const groupsKey = () => `GROUPS-${UserStore.getCurrentUser().id}`;
const friendsKey = () => `FRIENDS-${UserStore.getCurrentUser().id}`;

export async function syncAndRunChecks() {
	debugger;
	if (UserStore.getCurrentUser() == null) return;

	const [oldGuilds, oldGroups, oldFriends] = [
		new Map(Data.load(guildsKey())),
		new Map(Data.load(groupsKey())),
		{ ...Data.load(friendsKey()), ...{ friends: [], requests: [] } },
	];

	syncGuilds();
	syncGroups();
	syncFriends();

	if (Settings.state.offlineRemovals) {
		if (Settings.state.groups && oldGroups?.size) {
			for (const [id, group] of oldGroups) {
				if (!groups.has(id)) notify(`You are no longer in the group ${group.name}.`, group.iconURL);
			}
		}

		if (Settings.state.servers && oldGuilds?.size) {
			for (const [id, guild] of oldGuilds) {
				if (!guilds.has(id) && !GuildAvailabilityStore.isUnavailable(id))
					notify(`You are no longer in the server ${guild.name}.`, guild.iconURL);
			}
		}

		if (Settings.state.friends && oldFriends?.friends.length) {
			for (const id of oldFriends.friends) {
				if (friends.friends.includes(id)) continue;

				const user = await FetchUser(id).catch(() => void 0);
				if (user)
					notify(
						`You are no longer friends with ${getUserName(user)}.`,
						user.getAvatarURL(undefined, undefined, false),
						() => openUserProfile(user.id),
					);
			}
		}

		if (Settings.state.friendRequestCancels && oldFriends?.requests?.length) {
			for (const id of oldFriends.requests) {
				if (
					friends.requests.includes(id) ||
					[
						RelationshipTypeEnum.FRIEND,
						RelationshipTypeEnum.BLOCKED,
						RelationshipTypeEnum.OUTGOING_REQUEST,
					].includes(RelationshipStore.getRelationshipType(id))
				)
					continue;

				const user = await FetchUser(id).catch(() => void 0);
				if (user)
					notify(
						`Friend request from ${getUserName(user)} has been revoked.`,
						user.getAvatarURL(undefined, undefined, false),
						() => openUserProfile(user.id),
					);
			}
		}
	}
}

export function notify(content, icon) {
	// if (Settings.state.notices)
	//     BdApi.UI.showNotice(content, "OK", () => popNotice());

	BdApi.UI.showNotification({
		id: `${config.info.name}-${Math.random().toString(36).slice(2)}`,
		title: "Relationship Notifier",
		content,
		type: "info",
		duration: Number.POSITIVE_INFINITY,
		// biome-ignore lint/a11y/useAltText: <explanation>
		icon: () => <img src={icon} />,
	});
}

export function getGuild(id) {
	return guilds.get(id);
}

export function deleteGuild(id) {
	guilds.delete(id);
	syncGuilds();
}

export function syncGuilds() {
	guilds.clear();

	const me = UserStore.getCurrentUser().id;
	for (const [id, { name, icon }] of Object.entries(GuildStore.getGuilds())) {
		if (GuildMemberStore.isMember(id, me))
			guilds.set(id, {
				id,
				name,
				iconURL: icon && `https://cdn.discordapp.com/icons/${id}/${icon}.png`,
			});
	}
	Data.save(guildsKey(), new Map(guilds));
}

export function getGroup(id) {
	return groups.get(id);
}

export function deleteGroup(id) {
	groups.delete(id);
	syncGroups();
}

export function syncGroups() {
	groups.clear();

	for (const { type, id, name, rawRecipients, icon } of ChannelStore.getSortedPrivateChannels()) {
		if (type === ChannelTypeEnum.GROUP_DM)
			groups.set(id, {
				id,
				name: name || rawRecipients.map((r) => r.username).join(", "),
				iconURL: icon && `https://cdn.discordapp.com/channel-icons/${id}/${icon}.png`,
			});
	}

	Data.save(groupsKey(), new Map(groups));
}

export function syncFriends() {
	friends.friends = [];
	friends.requests = [];

	const relationShips = RelationshipStore.getMutableRelationships();
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

	Data.save(friendsKey(), {...friends});
}
