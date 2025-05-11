import "./styles";
import React from "@React";
import { Store } from "@/Store";
import { shallow } from "@Utils";
import BaseTab from "./BaseTab";
import ChannelTab from "./ChannelTab";

export default React.memo(function TabSwitch({ tabId }) {
	const item = Store(state => state.getTab(tabId), shallow);
	if (!item?.path) return;
	const [, type, , channelId, , threadId] = item.path.split("/");

	if (type === "channels" && channelId)
		return (
			<ChannelTab
				tabId={tabId}
				path={item.path}
				channelId={threadId || channelId}
			/>
		);

	return (
		<BaseTab
			tabId={tabId}
			path={item.path}
			title={type}
		/>
	);
});
