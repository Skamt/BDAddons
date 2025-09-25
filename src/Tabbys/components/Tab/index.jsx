import ChannelTab from "./ChannelTab";
import React from "@React";
import Store from "@/Store";
import { shallow } from "@Utils";
import MiscIcon from "@/components/ChannelIcon/MiscIcon";
import BaseTab from "./BaseTab";

export default React.memo(function Tab({ id }) {
	const tab = Store(state => Store.getTab(id), shallow);
	
	return tab.type === "CHANNEL" ? (
		<ChannelTab {...tab} />
	) : (
		<BaseTab
			{...tab}
			
			icon={<MiscIcon type={tab.type} />}
		/>
	);
});
