import "./styles";
import Store from "@/Store";
import { FolderIcon } from "@Components/Icon";
import React, { useEffect, useState } from "@React";
import { classNameFactory, join } from "@Utils/css";
import { ContextMenu } from "@Api";
import FolderContextMenu from "@/contextmenus/FolderContextMenu";
import ChannelStatus from "@/components/ChannelStatus";
import useStateFromStores from "@Modules/useStateFromStores";
import ReadStateStore from "@Stores/ReadStateStore";
import Settings from "@Utils/Settings";
const c = classNameFactory("folder");

export default function BaseFolder({ id, channelIds, folderId, parentId, name, className, children, canDrop, isOver, ...rest }) {
	const shouldHightLight = Settings(Settings.selectors.highlightFolderUnread);
	const hasUnread = useStateFromStores(
		[ReadStateStore],
		() => {
			if(!shouldHightLight) return false;
			for (let i = channelIds.length - 1; i >= 0; i--) if (ReadStateStore.hasUnread(channelIds[i])) return true;
		},
		[shouldHightLight, channelIds]
	);

	const contextmenuHandler = e => {
		ContextMenu.open(e, FolderContextMenu(id, { hasUnread, folderId, parentId }), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		<div
			{...rest}
			onContextMenu={contextmenuHandler}
			className={join(c("container", isOver && canDrop && "canDrop"), { hasUnread }, "card", className)}>
			<div className={join(c("icon"), "icon-wrapper", "card-icon")}>{<FolderIcon />}</div>
			<div className={join(c("title"), "card-title")}>{name}</div>
			<ChannelStatus
				type="Folder"
				channelIds={channelIds}
			/>
			{children}
		</div>
	);
}
