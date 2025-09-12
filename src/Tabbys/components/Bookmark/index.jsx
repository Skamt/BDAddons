// import "./styles";
import Store from "@/Store";
import React from "@React";
import { clsx, shallow } from "@Utils";
import { join } from "@Utils/String";
import ChannelIcon from "@/components/ChannelIcon/Simple";
import MiscIcon from "@/components/ChannelIcon/MiscIcon";
import { getChannelName } from "@Utils/Channel";
import ChannelStore from "@Stores/ChannelStore";
import { DragSource } from "@Discord/Modules";
import { DNDTypes } from "@/consts";
import { transitionTo } from "@Discord/Modules";
import { ContextMenu } from "@Api";
import BookmarkContextMenu from "@/contextmenus/BookmarkContextMenu";
import { parsePath } from "@/utils";
import Droppable from "./Droppable";

const c = clsx("bookmark");

const DraggableBookmark = DragSource(
	DNDTypes.BOOKMARK,
	{
		beginDrag: a => ({ ...a, bookmark: true })
	},
	(props, monitor) => ({
		isDragging: !!monitor.isDragging(),
		dragRef: props.dragSource()
	})
);

function Bookmark({ id, parentId, submenuItem, onClose, className, ...props }) {
	const { isDragging, dragRef } = props;
	const { path, name } =
		Store(state => {
			if (parentId) return Store.getFolderItem(parentId, id);
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
		ContextMenu.open(e, BookmarkContextMenu(id, parentId), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		<div
			ref={dragRef}
			onContextMenu={contextmenuHandler}
			data-id={id}
			className={join(" ", c("container", isDragging && "isDragging"), "no-drag", "box-border", "card", className)}
			onClick={onClick}>
			<Droppable
				id={id}
				pos="before"
				parentId={parentId}
				submenuItem={submenuItem}
				direction={submenuItem ? "vertical" : "horizontal"}
			/>
			<Droppable
				submenuItem={submenuItem}
				parentId={parentId}
				id={id}
				pos="after"
				direction={submenuItem ? "vertical" : "horizontal"}
			/>
			<div className={join(" ", c("icon"), "card-icon", "icon-wrapper")}>{icon}</div>
			<div className={join(" ", c("name"), "card-name")}>{channelName}</div>
		</div>
	);
}

export default React.memo(DraggableBookmark(Bookmark));
