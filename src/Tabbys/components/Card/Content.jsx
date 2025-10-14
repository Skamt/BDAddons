import Channel from "./Channel";
import DM from "./DM";
import Generic from "./Generic";
import GroupDM from "./GroupDM";
import React from "@React";
import { pathTypes } from "@/consts";

export default function Content({ type, ...props }) {
	switch (type) {
		case pathTypes.CHANNEL:
			return <Channel {...props} />;
		case pathTypes.DM:
			return <DM {...props} />;
		case pathTypes.GROUP_DM:
			return <GroupDM {...props} />;
		case pathTypes.NITRO:
		case pathTypes.SHOP:
		case pathTypes.SERVERS:
		case pathTypes.QUESTS:
		case pathTypes.APPS:
		case pathTypes.HOME:

	// GUILD: "GUILD",
	// VERIFICATION: "VERIFICATION",

			return (
				<Generic
					type={type}
					{...props}
				/>
			);
	}

	return null;
}
