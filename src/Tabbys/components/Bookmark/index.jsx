import "./styles";
import { Store } from "@/Store";
import React from "@React";
import BaseBookmark from "./BaseBookmark";
import { shallow } from "@Utils";
// import { DragSource, DropTarget } from "@Discord/Modules";
import { useChannel } from "@/utils";

const ICON_SIZE = 80;

function Bookmark({ bookmarkId, channelId, path }) {
	const { icon, channelName } = useChannel(channelId, ICON_SIZE);

	return (
		<BaseBookmark
			bookmarkId={bookmarkId}
			path={path}
			icon={icon}
			title={channelName}
		/>
	);
}

export default React.memo(({ bookmarkId }) => {
	const { path } = Store(state => state.getBookmark(bookmarkId), shallow) || {};
	if (!path) return;

	const [, , , channelId, , threadId] = path.split("/");

	return (
		<Bookmark
			bookmarkId={bookmarkId}
			path={path}
			channelId={threadId || channelId}
		/>
	);
});
