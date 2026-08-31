import { deleteGroup, deleteGuild, getGroup, getGuild, notify } from "@/utils";
import { RelationshipTypeEnum, ChannelTypeEnum } from "@Discord/Enums";
import Settings from "@Utils/Settings";
import GuildAvailabilityStore from "@Stores/GuildAvailabilityStore";
import FetchUser from "@Modules/FetchUser";
import { openUserProfile, getUserName } from "@Utils/User";

let manuallyRemovedFriend;
let manuallyRemovedGuild;
let manuallyRemovedGroup;

export const removeFriend = (id) => (manuallyRemovedFriend = id);
export const removeGuild = (id) => (manuallyRemovedGuild = id);
export const removeGroup = (id) => (manuallyRemovedGroup = id);

export async function onRelationshipRemove({ relationship: { type, id } }) {
	if (manuallyRemovedFriend === id) {
		manuallyRemovedFriend = undefined;
		return;
	}

	const user = await FetchUser(id).catch(() => null);
	if (!user) return;

	switch (type) {
		case RelationshipTypeEnum.FRIEND:
			if (Settings.state.friends)
				notify(
					`${getUserName(user)} removed you as a friend.`,
					user.getAvatarURL(undefined, undefined, false),
					() => openUserProfile(user.id),
				);
			break;
		case RelationshipTypeEnum.PENDING_OUTGOING:
			if (Settings.state.friendRequestCancels)
				notify(
					`A friend request from ${getUserName(user)} has been removed.`,
					user.getAvatarURL(undefined, undefined, false),
					() => openUserProfile(user.id),
				);
			break;
	}
}

export function onGuildDelete({ guild: { id, unavailable } }) {
	if (!Settings.state.servers) return;
	if (unavailable || GuildAvailabilityStore.isUnavailable(id)) return;

	if (manuallyRemovedGuild === id) {
		deleteGuild(id);
		manuallyRemovedGuild = undefined;
		return;
	}

	const guild = getGuild(id);
	if (guild) {
		deleteGuild(id);
		notify(`You were removed from the server ${guild.name}.`, guild.iconURL);
	}
}

export function onChannelDelete({ channel: { id, type } }) {
	if (!Settings.state.groups) return;
	if (type !== ChannelTypeEnum.GROUP_DM) return;

	if (manuallyRemovedGroup === id) {
		deleteGroup(id);
		manuallyRemovedGroup = undefined;
		return;
	}

	const group = getGroup(id);
	if (group) {
		deleteGroup(id);
		notify(`You were removed from the group ${group.name}.`, group.iconURL);
	}
}
