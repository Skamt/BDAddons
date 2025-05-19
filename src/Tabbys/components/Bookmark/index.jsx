import "./styles";
import { Store } from "@/Store";
import { getChannelIcon, getChannelName } from "@/utils";
import { DiscordIcon } from "@Components/Icon";
import useStateFromStores from "@Modules/useStateFromStores";
import React from "@React";
import ChannelStore from "@Stores/ChannelStore";
import { shallow } from "@Utils";
import Logger from "@Utils/Logger";
import BaseBookmark from "./BaseBookmark";
import Settings from "@Utils/Settings"



function Bookmark({ id, channelId, path, className }) {
	const size = Settings(Settings.selectors.size) || 20;
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	const channelName = getChannelName(channel) || path.split("/")[2];
	const src = getChannelIcon(channel, size);

	let icon = null;

	if (src)
		icon = src && (
			<img
				className="parent-dim fill round"
				src={src}
				alt={channelName}
			/>
		);
	else {
		icon = (
			<div className="discord-icon flex-center fill round">
				<DiscordIcon />
			</div>
		);
	}

	return (
		<BaseBookmark
			id={id}
			className={className}
			path={path}
			icon={icon}
			title={channelName}
		/>
	);
}

export default React.memo(({ id, className }) => {
	const { path } = Store(state => state.getBookmark(id), shallow) || {};
	if (!path) return Logger.error("unknown bookmark path", path, id);

	const [, , , channelId, , threadId] = path.split("/");

	return (
		<Bookmark
			id={id}
			className={className}
			path={path}
			channelId={threadId || channelId}
		/>
	);
});
