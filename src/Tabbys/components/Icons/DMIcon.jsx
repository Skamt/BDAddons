import React from "@React";
import Fallback from "./Fallback";
import UserAvatar from "@Components/UserAvatar";
import Settings from "@Utils/Settings";
import { getSize } from "./shared";
import { join } from "@Utils/css";
function getUserAvatar(id, avatar, size) {
	return `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp?size=${size}`;
}

export default function DMIcon({ user = {}, userId, fallbackAvatar }) {
	const { size, avatarSize } = getSize(Settings(_ => _.size));
	const src = getUserAvatar(user.id || userId, user.avatar || fallbackAvatar, size);
	if (!src) return <Fallback />;
	return (
		<div className={join("card-icon", "user-avatar", "fcc")}>
			<UserAvatar
				id={user.id}
				src={src}
				size={avatarSize}
			/>
		</div>
	);
}
