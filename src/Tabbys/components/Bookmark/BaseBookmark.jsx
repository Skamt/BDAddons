// import "./styles";
import { Store } from "@/Store";
import BookmarkContextmenu from "@/contextmenus/BookmarkContextmenu";
import { buildTab } from "@/utils";
import { ContextMenu } from "@Api";
import DiscordIcon from "@Components/icons/DiscordIcon";
import React from "@React";
import { concateClassNames } from "@Utils";
// import { DragSource, DropTarget } from "@Discord/Modules";

export default function BaseBookmark({ bookmarkId, path, icon, title }) {
	
	const clickHandler = e => {
		e.stopPropagation();
		Store.state.newTab(buildTab({ path }));
		return console.log(bookmarkId, "clickHandler");
	};

	const contextmenuHandler = e => {
		ContextMenu.open(e, BookmarkContextmenu.bind({bookmarkId}), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			className="bookmark"
			onContextMenu={contextmenuHandler}
			onClick={clickHandler}>
			<div className={concateClassNames("bookmark-icon", !icon && "discord-icon")}>{icon || <DiscordIcon />}</div>
			<div className="bookmark-title ellipsis">{title || path}</div>
		</div>
	);
}
