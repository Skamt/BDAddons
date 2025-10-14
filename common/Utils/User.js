import UserStore from "@Stores/UserStore";
import { isValidString } from "@Utils/String";
import ChannelStore from "@Stores/ChannelStore";

export function isSelf(user) {
	const currentUser = UserStore.getCurrentUser();
	return user?.id === currentUser?.id;
}

export function getUserAvatar(id, size) {
	UserStore.getUser(id)?.getAvatarURL(null, size);
}

export function getUserAvatarForGuild(id, guildId, size) {
	UserStore.getUser(id).getAvatarURL(guildId, size);
}

export function getUserName(userObject = {}) {
	const { global_name, globalName, username } = userObject;
	if (isValidString(global_name)) return global_name;
	if (isValidString(globalName)) return globalName;
	if (isValidString(username)) return username;
}

export function getUserFromDM(channelId) {
	const channel = ChannelStore.getChannel(channelId);
	if (!channel) return;
	return UserStore.getUser(channel.recipients[0]);
}
