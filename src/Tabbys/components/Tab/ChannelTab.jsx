import React from "@React";
import BaseTab from "./BaseTab";
import ChannelStatus from "@/components/ChannelStatus";
import { ChannelIcon } from "@/components/Icons";
import useStateFromStores from "@Modules/useStateFromStores";
import ChannelStore from "@Stores/ChannelStore";
import { getChannelName } from "@Utils/Channel";

export default function ChannelTab({ id, path, guildId, channelId }) {
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	const name = getChannelName(channel);

	return (
		<BaseTab
			id={id}
			channelId={channelId}
			guildId={guildId}
			title={name || channelId}
			icon={
				<ChannelIcon
					guildId={guildId}
					name={name}
					channel={channel}
				/>
			}>
			<ChannelStatus
				type="Tab"
				channelIds={[channelId]}
			/>
		</BaseTab>
	);
}
