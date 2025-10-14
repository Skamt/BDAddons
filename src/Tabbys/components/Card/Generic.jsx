// import { Fallback } from "@/components/Icons";
import { join } from "@Utils/css";
import React from "@React";
import { AppsIcon, ShopIcon, QuestsIcon, NitroIcon, ServersIcon } from "@Components/Icon";
import { pathTypes } from "@/consts";
import Markup from "./Markup";
import Icon from "./Icon";
export default function Generic({ title, type }) {
	let icon = null;

	switch (type) {
		case pathTypes.NITRO:
			icon = <NitroIcon />;
			break;
		case pathTypes.SHOP:
			icon = <ShopIcon />;
			break;
		case pathTypes.SERVERS:
			icon = <ServersIcon />;
			break;
		case pathTypes.QUESTS:
			icon = <QuestsIcon />;
			break;
		case pathTypes.APPS:
			icon = <AppsIcon />;
			break;
	}

	return (
		<Markup
			icon={<Icon className="icon-wrapper" icon={icon} />}
			title={title}
		/>
	);
}
