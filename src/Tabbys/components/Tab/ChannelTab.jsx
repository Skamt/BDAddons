import useStateFromStores from "@Modules/useStateFromStores";
import React from "@React";
import ChannelStore from "@Stores/ChannelStore";
import BaseTab from "./BaseTab";
import { getChannelName, getChannelIcon } from "@/utils";

const ICON_SIZE = 80;

export default function ChannelTab({ tabId, channelId, path }) {
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	if (!channel) return;

	const channelName = getChannelName(channel, ICON_SIZE) || "Home";
	const iconSrc = getChannelIcon(channel, ICON_SIZE);
	const icon = iconSrc && (
		<img
			src={iconSrc}
			alt={channelName}
		/>
	);

	return (
		<BaseTab
			id={tabId}
			path={path}
			icon={icon}
			title={channelName}
		/>
	);
}
