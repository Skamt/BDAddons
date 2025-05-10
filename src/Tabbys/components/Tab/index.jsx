import "./styles";
import React from "@React";
import { Store } from "@/Store";
import { isSnowflake, shallow } from "@Utils";
import GenericTab from "./GenericTab";
import DMTab from "./DMTab";
import ChannelTab from "./ChannelTab";

export default React.memo(function TabSwitch({ id }) {

	const item = Store(state => state.tabs.find(tab => tab.id === id), shallow);
	if (!item?.path) return;
	const [, type, guildId, channelId, , threadId] = item.path.split("/");

	let res = null;
	if (type !== "channels")
		res = (
			<GenericTab
				tabId={id}
				path={item.path}
			/>
		);

	else if (guildId === "@me" && channelId)
		res = (
			<DMTab
				tabId={id}
				path={item.path}
				channelId={channelId}
			/>
		);

	else  if (isSnowflake(guildId))
		res = (
			<ChannelTab
				tabId={id}
				path={item.path}
				guildId={guildId}
				channelId={channelId}
				threadId={threadId}
			/>
		);
	else
		res = (
			<GenericTab
				tabId={id}
				path={item.path}
			/>
		);

	return res;
})
