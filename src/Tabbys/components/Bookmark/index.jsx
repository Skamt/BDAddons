import "./styles";
import { Store } from "@/Store";
import React from "@React";
import BaseBookmark from "./BaseBookmark";
import { shallow } from "@Utils";
// import { DragSource, DropTarget } from "@Discord/Modules";
import { useChannel } from "@/utils";

const ICON_SIZE = 80;

function Bookmark({ id, channelId, path,className }) {
	const { icon, channelName } = useChannel(channelId, ICON_SIZE);

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

export default React.memo(({ id,className }) => {
	const { path } = Store(state => state.getBookmark(id), shallow) || {};
	if (!path) return;

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
