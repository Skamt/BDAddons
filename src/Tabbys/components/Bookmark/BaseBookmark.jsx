import "./styles";
import Store from "@/Store";
import { openBookmark } from "@/Store/methods";
import React from "@React";
import { transitionTo } from "@Discord/Modules";
import { classNameFactory, join } from "@Utils/css";
import BookmarkContextMenu from "@/contextmenus/BookmarkContextMenu";
import { ContextMenu } from "@Api";
import useStateFromStores from "@Modules/useStateFromStores";
import ReadStateStore from "@Stores/ReadStateStore";
import Settings from "@Utils/Settings";

const c = classNameFactory("bookmark");

export default function BaseBookmark(props) {
	const { id, icon, title, onClose, parentId, channelId, guildId, userId, path, noName, className, children, ...rest } = props;
	const shouldHightLight = Settings(Settings.selectors.highlightBookmarkUnread);
	const hasUnread = useStateFromStores([ReadStateStore], () =>  shouldHightLight && ReadStateStore.hasUnread(channelId), [shouldHightLight, channelId]);

	const onClick = e => {
		e.stopPropagation();
		onClose?.();

		if (e.ctrlKey) Store.newTab(path);
		else openBookmark(id, parentId);
	};

	const contextmenuHandler = e => {
		ContextMenu.open(e, BookmarkContextMenu(id,{  path,guildId, userId, parentId, channelId, hasUnread }), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		<div
			{...rest}
			onContextMenu={contextmenuHandler}
			className={join(c("container"), { hasUnread }, "card", className)}
			onClick={onClick}>
			{icon}
			{!noName && title && <div className={join(c("title"), "card-title")}>{title}</div>}
			{children}
		</div>
	);
}
