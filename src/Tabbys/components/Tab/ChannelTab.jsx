import React from "@React";
import BaseTab from "./BaseTab";
import { useChannelState, useChannel } from "@/utils";

const ICON_SIZE = 80;

export default function ChannelTab({ id, channelId, path }) {
	const { icon, channelName, channel } = useChannel(channelId, ICON_SIZE);
	const channelUnreadState  = useChannelState(channelId);
	return (
		<BaseTab
			id={id}
			path={path}
			icon={icon}
			title={channelName}
			idDM={channel?.isDM?.()}
			{...channelUnreadState}
		/>
	);
}
