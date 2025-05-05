import { Store } from "@/Store";

import useStateFromStores from "@Modules/useStateFromStores";
import React from "@React";
import ChannelStore from "@Stores/ChannelStore";
import GuildStore from "@Stores/GuildStore";
import BaseTab from "./BaseTab";

export default function ChannelTab({ tabId, guildId, channelId, threadId, path }) {
	const selected = Store(state => state.selectedId === tabId);
	const id = threadId || channelId;
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(id), [id]);
	if (!channel) return;
	const guild = GuildStore.getGuild(guildId);
	if (!guild) return <BaseTab path={path} />;

	const guildIcon = guild.getIconURL(80);

	return (
		<BaseTab
			id={tabId}
			path={path}
			selected={selected}
			icon={
				guildIcon && (
					<img
						src={guildIcon}
						alt={guild.name}
					/>
				)
			}
			title={channel.name}
		/>
	);
}
