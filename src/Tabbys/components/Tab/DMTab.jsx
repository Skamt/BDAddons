import React from "@React";
import { Store } from "@/Store";
import { getModule } from "@Webpack";
import useStateFromStores from "@Modules/useStateFromStores";
import { ChannelTypeEnum } from "@Discord/Enums";
// import { GroupDmAvatarFilter } from "@Discord/Modules";
import ChannelStore from "@Stores/ChannelStore";

import BaseTab from "./BaseTab";
import { getUserName } from "@Utils";
import { getUserAvatar } from "@Utils/User";

const ICON_SIZE = 80;

const b = getModule(a => a.getChannelIconURL);

function getDmAvatar(channel, size) {
	const recipientId = channel.rawRecipients[0].id;
	return getUserAvatar({ id: recipientId, size });
}

export default function DMTab({ tabId, channelId, path }) {
	const selected = Store(state => state.selectedId === tabId);
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	if (!channel) return;
	const channelName = channel ? channel.rawRecipients.map(getUserName).join(", ") : "Home";

	const channelIconSrc =
		channel.type === ChannelTypeEnum.DM
			? getDmAvatar(channel, ICON_SIZE)
			: b.getChannelIconURL({
					id: channel.id,
					icon: channel.icon,
					applicationId: channel.getApplicationId(),
					size: ICON_SIZE
				});

	const icon = channelIconSrc && (
		<img
			src={channelIconSrc}
			alt={channelName}
		/>
	);

	return (
		<BaseTab
			id={tabId}
			path={path}
			selected={selected}
			icon={icon}
			title={channelName}
		/>
	);
}
