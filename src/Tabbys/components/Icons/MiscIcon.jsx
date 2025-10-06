import React from "@React";
import { join } from "@Utils/css";
import { AppsIcon, ShopIcon, QuestsIcon, NitroIcon, ServersIcon } from "@Components/Icon";
import Fallback from "./Fallback";
import { pathTypes } from "@/consts";

export default function MiscIcon({ type }) {
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
		default:
			return <Fallback />;
	}

	return <div className={join("card-icon", "icon-wrapper")}>{icon}</div>;
}
