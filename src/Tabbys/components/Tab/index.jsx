import "./styles";
import React from "@React";
import { Store } from "@/Store";
import { shallow } from "@Utils";
import GenericTab from "./GenericTab";
import ChannelTab from "./ChannelTab";

export default React.memo(function TabSwitch({ tabId }) {
	const item = Store(state => state.getTab(tabId), shallow);
	if (!item?.path) return;
	const [, type, guildId, channelId, , threadId] = item.path.split("/");

	if (type === "channels" && channelId)
		return (
			<ChannelTab
				tabId={tabId}
				path={item.path}
				guildId={guildId}
				channelId={threadId || channelId}
			/>
		);

	return (
		<GenericTab
			tabId={tabId}
			path={item.path}
			title={type}
		/>
	);
});
