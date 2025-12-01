import React from "@React";
import useStateFromStores from "@Modules/useStateFromStores";
import UserStore from "@Stores/UserStore";
// import { Fallback } from "@/components/Icons";
import { getUserName } from "@Utils/User";
import UserAvatar from "@Components/UserAvatar";
import Settings from "@Utils/Settings";
import { getSize } from "@/utils";
import { join } from "@Utils/css";
import Markup from "./Markup";
import Icon from "./Icon";

function getUserAvatar(id, avatar, size) {
	return `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp?size=${size}`;
}

export default function DM({ name, userId, avatar, username }) {
	const { size, avatarSize } = getSize(Settings(_ => _.size));
	const user = useStateFromStores([UserStore], () => UserStore.getUser(userId), [userId]);
	const title = name || getUserName(user) || username || userId;
	const src = getUserAvatar(user.id || userId, user.avatar || avatar, size);

	return (
		<Markup
			icon={
				<Icon
					className={join("fcc")}
					icon={
						<UserAvatar
							id={user.id}
							src={src}
							size={avatarSize}
						/>
					}
				/>
			}
			title={title}
		/>
	);
}
