import Channel from "./Channel";
import DM from "./DM";
import Generic from "./Generic";
import GroupDM from "./GroupDM";
import MemberVerification from "./MemberVerification";
import React from "@React";
import { pathTypes } from "@/consts";
import Markup from "./Markup";
import Icon from "./Icon";
import { getNameFromPath } from "@/utils";

export default function Content({ type, ...props }) {
	switch (type) {
		case pathTypes.CHANNEL:
			return <Channel {...props} />;
		case pathTypes.DM:
			return <DM {...props} />;
		case pathTypes.GROUP_DM:
			return <GroupDM {...props} />;
		case pathTypes.VERIFICATION:
			return <MemberVerification {...props} />;
		case pathTypes.NITRO:
		case pathTypes.SHOP:
		case pathTypes.SERVERS:
		case pathTypes.QUESTS:
		case pathTypes.APPS:
		case pathTypes.HOME:
			return (
				<Generic
					type={type}
					{...props}
				/>
			);
	}

	return (
		<Markup
			icon={<Icon />}
			title={getNameFromPath(props.path)}
		/>
	);
}
