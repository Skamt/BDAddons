import { Store } from "@/Store";

import useStateFromStores from "@Modules/useStateFromStores";
import React from "@React";
import ChannelStore from "@Stores/ChannelStore";
import GuildStore from "@Stores/GuildStore";
import BaseTab from "./BaseTab";
import DiscordIcon from "@Components/icons/DiscordIcon";
export default function ChannelTab({ tabId, guildId, channelId, threadId, path }) {
	const selected = Store(state => state.selectedId === tabId);
	const id = threadId || channelId;
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(id), [id]);
	if (!channel) return;
	const guild = GuildStore.getGuild(guildId);
	if (!guild) return <BaseTab path={path} />;

	console.log(guild, channel);
	const guildIcon = guild.getIconURL(80);
	const icon = guildIcon ? (
		<img
			src={guildIcon}
			alt={guild.name}
		/>
	) : (
		<div className="tab-icon-unknown"><DiscordIcon /></div>
	);

	return (
		<BaseTab
			id={tabId}
			path={path}
			selected={selected}
			icon={icon}
			title={channel.name}
		/>
	);
}
