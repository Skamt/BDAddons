import React from "@React";
import BaseTab from "./BaseTab";
import { useChannel } from "@/utils";

const ICON_SIZE = 80;

export default function ChannelTab({ tabId, channelId, path }) {
	const { icon, channelName } = useChannel(channelId, ICON_SIZE);

	return (
		<BaseTab
			tabId={tabId}
			path={path}
			icon={icon}
			title={channelName}
		/>
	);
}
