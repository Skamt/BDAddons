import ChannelStatus from "@/components/ChannelStatus";
import BaseBookmark from "./BaseBookmark";
import useStateFromStores from "@Modules/useStateFromStores";
import ChannelStore from "@Stores/ChannelStore";
import React from "@React";
import { ChannelIcon } from "@/components/Icons";
import { getChannelName } from "@Utils/Channel";

export default function ChannelBookmark({ name, guildId, channelId, children, ...rest }) {
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	const title = name || getChannelName(channel) || channelId;

	return (
		<BaseBookmark
			{...rest}
			channelId={channelId}
			guildId={guildId}
			title={title}
			icon={
				<ChannelIcon
					guildId={guildId}
					name={title}
					channel={channel}
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
