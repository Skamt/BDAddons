import React from "@React";
import { join } from "@Utils/String";
import { AppsIcon, DiscordIcon, QuestsIcon, ServersIcon } from "@Components/Icon";
import Fallback from "./Fallback";

export default function MiscIcon({ type }) {
	switch (type) {
		case "servers":
			return <ServersIcon />;
		case "quests":
		case "quest-home":
			return <QuestsIcon />;
		case "applications":
			return <AppsIcon />;
		default:
			return <Fallback />;
	}
}
