import "./styles";
import Store from "@/Store";
import { FolderIcon } from "@Components/Icon";
import React, { useEffect, useState } from "@React";
import { classNameFactory, join } from "@Utils/css";
import { ContextMenu } from "@Api";
import FolderContextMenu from "@/contextmenus/FolderContextMenu";
import ChannelStatus from "@/components/ChannelStatus";

const c = classNameFactory("folder");

export default function BaseFolder({ id, channelIds,folderId, parentId, name, className, children, canDrop, isOver, ...rest }) {
	const contextmenuHandler = e => {
		ContextMenu.open(e, FolderContextMenu(id, { folderId, parentId }), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		<div
			{...rest}
			onContextMenu={contextmenuHandler}
			className={join(c("container", isOver && canDrop && "canDrop"), "box-border", "no-drag", "card", className)}>
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
