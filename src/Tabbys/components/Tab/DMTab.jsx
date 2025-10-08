import React from "@React";
import BaseTab from "./BaseTab";
import { getUserName } from "@Utils/User";
import { useChannelState } from "@Utils/Hooks";
import Settings from "@Utils/Settings";
import Badge from "@/components/NumberBadge";
import TypingDots from "@/components/TypingDots";
import { DMIcon } from "@/components/Icons";
import { shallow } from "@Utils";
import useStateFromStores from "@Modules/useStateFromStores";
import UserStore from "@Stores/UserStore";

import ChannelStatus from "@/components/ChannelStatus";

export default function DMTab({ id, userId, avatar, username, path, channelId }) {
	const user = useStateFromStores([UserStore], () => UserStore.getUser(userId), [userId]);
	const name = getUserName(user) || username || userId;

	return (
		<BaseTab
			id={id}
			channelId={channelId}
			userId={userId}
			title={name}
			icon={
				<DMIcon
					user={user}
					userId={userId}
					fallbackAvatar={avatar}
				/>
			}>
			<ChannelStatus
				type="Tab"
				channelIds={[channelId]}
				isDM={true}
			/>
		</BaseTab>
	);
}
