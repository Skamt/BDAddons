import "./styles";
import { Store } from "@/Store";
import { AppsIcon, DiscordIcon, QuestsIcon, ServersIcon } from "@Components/Icon";
import React from "@React";
import { shallow } from "@Utils";
import Logger from "@Utils/Logger";
import BaseTab from "./BaseTab";
import ChannelTab from "./ChannelTab";
import Settings from "@Utils/Settings"

function getIcon(type) {
	let icon = null;
	switch (type) {
		case "servers":
			icon = <ServersIcon />;
			break;
		case "quests":
			icon = <QuestsIcon />;
			break;
		case "applications":
			icon = <AppsIcon />;
			break;
		default:
	}

	return icon ? (
		<div className="svg-icon">{icon}</div>
	) : (
		<div className="discord-icon flex-center fill round">
			<DiscordIcon />
		</div>
	);
}

export default React.memo(({ id }) => {
	Settings(Settings.selectors.tabIconSize);
	const { path } = Store(state => state.getTab(id), shallow) || {};
	if (!path) return Logger.error("unknown tab path", path, id);
	const [, type, idk, channelId, , threadId] = path.split("/");

	if (type === "channels" && channelId)
		return (
			<ChannelTab
				id={id}
				path={path}
				channelId={threadId || channelId}
			/>
		);

	return (
		<BaseTab
			id={id}
			path={path}
			icon={getIcon(idk)}
			title={idk}
		/>
	);
});
