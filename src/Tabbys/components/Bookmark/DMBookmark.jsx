import React from "@React";
import BaseBookmark from "./BaseBookmark";
import { getUserName } from "@Utils/User";
import { DMIcon } from "@/components/Icons";
import useStateFromStores from "@Modules/useStateFromStores";
import UserStore from "@Stores/UserStore";
import ChannelStatus from "@/components/ChannelStatus";

export default function DMBookmark({  name, userId, avatar, username, channelId, children, ...rest }) {
	const user = useStateFromStores([UserStore], () => UserStore.getUser(userId), [userId]);
	const title = name || getUserName(user) || username || userId;

	return (
		<BaseBookmark
			{...rest}
			title={title}
			channelId={channelId}
			icon={
				<DMIcon
					userId={userId}
					user={user}
					fallbackAvatar={avatar}
				/>
			}>
			{children}
			<ChannelStatus
				type="Bookmark"
				channelIds={[channelId]}
			/>
		</BaseBookmark>
	);
}
