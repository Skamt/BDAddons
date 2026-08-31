import UserStore from "@Stores/UserStore";
import { isValidString } from "@Utils/String";
import ChannelStore from "@Stores/ChannelStore";
import GuildMemberStore from "@Stores/GuildMemberStore";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import SelectedGuildStore from "@Stores/SelectedGuildStore";
import Logger from "@Utils/Logger";
import FetchUser from "@Modules/FetchUser";
import {UserProfileActions} from "@Discord/Modules";

export async function openUserProfile(id) {
    const user = await FetchUser(id);
    if (!user) return Logger.error("No such user: " + id);

    const guildId = SelectedGuildStore.getGuildId();
    UserProfileActions.openUserProfileModal({
        userId: id,
        guildId,
        channelId: SelectedChannelStore.getChannelId(),
        analyticsLocation: {
            page: guildId ? "Guild Channel" : "DM Channel",
            section: "Profile Popout"
        }
    });
}

export function isSelf(user) {
	const currentUser = UserStore.getCurrentUser();
	return user?.id === currentUser?.id;
}

export function getUserAvatar(id, size) {
	UserStore.getUser(id)?.getAvatarURL(null, size);
}

export function getUserAvatarForGuild(id, guildId, size) {
	UserStore.getUser(id)?.getAvatarURL(guildId, size);
}

export function getUserName(userObject = {}) {
	const { global_name, globalName, username } = userObject;
	if (isValidString(global_name)) return global_name;
	if (isValidString(globalName)) return globalName;
	if (isValidString(username)) return username;
}

export function getGuildMemberName(guildId, userId) {
	const memeber = GuildMemberStore.getMember(guildId, userId);
	if (memeber?.nick) return memeber.nick;

	const user = UserStore.getUser(userId);
	if (user) return getUserName(user);

	return "???";
}

export function getUserFromDM(channelId) {
	const channel = ChannelStore.getChannel(channelId);
	if (!channel) return;
	return UserStore.getUser(channel.recipients[0]);
}
