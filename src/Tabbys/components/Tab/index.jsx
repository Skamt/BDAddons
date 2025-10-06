import ChannelTab from "./ChannelTab";
import DMTab from "./DMTab";
import React from "@React";
import Store from "@/Store";
import { pathTypes } from "@/consts";
import { shallow } from "@Utils";
import { MiscIcon } from "@/components/Icons";
import BaseTab from "./BaseTab";

export default React.memo(function Tab({ id }) {
	const { type, ...tab } = Store(state => Store.getTab(id), shallow);
	switch (type) {
		case pathTypes.CHANNEL:
			return <ChannelTab {...tab} />;
		case pathTypes.DM:
			return <DMTab {...tab} />;
		default:
			return (
				<BaseTab
					{...tab}
					icon={<MiscIcon type={type} />}
				/>
			);
	}
});
