import React from "@React";
import useStateFromStores from "@Modules/useStateFromStores";
import ChannelStore from "@Stores/ChannelStore";
import { getGroupDmIcon } from "@Utils/Channel";
import { join } from "@Utils/css";
import Settings from "@Utils/Settings";
import { getSize } from "@/utils";
import { getUserName } from "@Utils/User";
import Markup from "./Markup";
import Icon from "./Icon";

export default function GroupDM({ name, channelId }) {
	const { size } = getSize(Settings(_ => _.size));
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	const title = name || channel?.rawRecipients?.map(getUserName).join(", ") || channelId;
	const src = getGroupDmIcon(channelId, size);

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
