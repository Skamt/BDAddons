import UserStore from "@Stores/UserStore";
import {isValidString} from "@Utils/String";

export function isSelf(user) {
	const currentUser = UserStore.getCurrentUser();
	return user?.id === currentUser?.id;
}

export function getUserAvatar({id, guildId,size}) {
	return UserStore.getUser(id).getAvatarURL(guildId, size);
}

export function getUserName(userObject = {}) {
	const { global_name, globalName, username } = userObject;
	if (isValidString(global_name)) return global_name;
	if (isValidString(globalName)) return globalName;
	if (isValidString(username)) return username;
	return "???";
}