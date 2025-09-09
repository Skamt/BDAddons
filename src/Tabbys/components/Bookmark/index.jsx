// import "./styles";
import Store from "@/Store";
import React from "@React";
import { clsx, shallow } from "@Utils";
import { join } from "@Utils/String";
import ChannelIcon from "@/components/ChannelIcon/Simple";
import MiscIcon from "@/components/ChannelIcon/MiscIcon";
import { getChannelName } from "@Utils/Channel";
import ChannelStore from "@Stores/ChannelStore";
import { transitionTo } from "@Discord/Modules";
import { ContextMenu } from "@Api";
import BookmarkContextMenu from "@/contextmenus/BookmarkContextMenu";
import { parsePath } from "@/utils";
const c = clsx("bookmark");

function Bookmark({ id, folderId, onClose, className }) {
	const { path, name } =
		Store(state => {
			if (folderId) return Store.getFolderItem(folderId, id);
			return Store.getBookmark(id);
		}, shallow) || {};

	if (!path) return;

	const { type, idk, channelId } = parsePath(path);
	const channel = ChannelStore.getChannel(channelId);
	const channelName = name || getChannelName(channel) || idk;

	const icon = channel ? (
		<ChannelIcon
			name={channelName}
			channel={channel}
		/>
	) : (
		<MiscIcon type={type} />
	);

	const onClick = e => {
		e.stopPropagation();
		onClose?.();

		if (e.ctrlKey) Store.addTab(path);
		else transitionTo(path);
	};

	const contextmenuHandler = e => {
		ContextMenu.open(e, BookmarkContextMenu(id, folderId), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		<div
			onContextMenu={contextmenuHandler}
			data-id={id}
			className={join(" ", c("container"), "no-drag", "box-border", "card", className)}
			onClick={onClick}>
			<div className={join(" ", c("icon"), "card-icon", "icon-wrapper")}>{icon}</div>
			<div className={join(" ", c("name"), "card-name")}>{channelName}</div>
		</div>
	);
}

export default React.memo(Bookmark);
