import UserStore from "@Stores/UserStore";

export function isSelf(user) {
	const currentUser = UserStore.getCurrentUser();
	return user?.id === currentUser?.id;
}

export function getUserAvatar({id, guildId,size}) {
	return UserStore.getUser(id).getAvatarURL(guildId, size);
}