import React from "@React";
import useStateFromStores from "@Modules/useStateFromStores";
import ChannelStore from "@Stores/ChannelStore";
import { getGuildIcon } from "@Utils/Channel";
import { join } from "@Utils/css";
import Settings from "@Utils/Settings";
import { getSize } from "@/utils";
import Markup from "./Markup";
import Icon from "./Icon";

export default function Channel({ name, guildId, channelId }) {
	const { size } = getSize(Settings(_ => _.size));
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	const title = name || channel?.name || channelId;
	const src = getGuildIcon(guildId || channel?.guild_id, size);

	return (
		<Markup
			icon={
				<Icon
					size={size}
					src={src}
					alt={name}
				/>
			}
			title={title}
		/>
	);
}
