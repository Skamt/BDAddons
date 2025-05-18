import React from "@React";
import BaseTab from "./BaseTab";
import ChannelStore from "@Stores/ChannelStore";
import useStateFromStores from "@Modules/useStateFromStores";
import { getChannelIcon, getChannelName, useChannelState } from "@/utils";
import UserAvatar from "../UserAvatar";
import { Filters, getModule } from "@Webpack";
import { DiscordIcon } from "@Components/Icon";
import Settings from "@Utils/Settings"

const GroupDMAvatar = getModule(Filters.byStrings("recipients", "backSrc"));


const sizes = {
	16: "SIZE_16",
	20: "SIZE_20",
	24: "SIZE_24",
	32: "SIZE_32",
	40: "SIZE_40",
	44: "SIZE_44",
	48: "SIZE_48",
	56: "SIZE_56",
	80: "SIZE_80",
};

export default function ChannelTab({ id, channelId, path }) {
	const size = Settings.state.size;

	const channelUnreadState = useChannelState(channelId);
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	if(!channel) return;
	const channelName = getChannelName(channel);
	const isDM = channel.isDM();
	const isGroupDM = channel.isGroupDM();

	let icon = null;
	if (isGroupDM && GroupDMAvatar && !channel.icon) {
		icon = (
			<GroupDMAvatar
				recipients={channel.recipients}
				size={sizes[size]}
			/>
		);
	} else {
		const src = getChannelIcon(channel, size);

		if (isDM && UserAvatar) {
			const userId = channel.recipients[0];
			icon = (
				<UserAvatar
					id={userId}
					src={src}
					size={sizes[size]}
				/>
			);
		} else if(src)
			icon = (
				<img
					className="parent-dim fill round"
					src={src}
					alt={channelName}
				/>
			);
	}

	icon = icon || <div className="discord-icon flex-center fill round"><DiscordIcon /></div>

	return (
		<BaseTab
			id={id}

			path={path}
			icon={icon}
			title={channelName}
			isGroupDM={isGroupDM}
			isDM={isDM}
			{...channelUnreadState}
		/>
	);
}
