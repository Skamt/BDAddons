// import "./styles";
// import { Store } from "@/Store";
import BookmarkContextmenu from "@/contextmenus/BookmarkContextmenu";
// import { buildTab } from "@/utils";
import { ContextMenu } from "@Api";
import { DiscordIcon } from "@Components/Icon";
// import { DragSource, DropTarget } from "@Discord/Modules";
import { transitionTo } from "@Discord/Modules";
import React from "@React";
import { concateClassNames } from "@Utils";

export default function BaseBookmark({ id, path, icon, title, className }) {
	const clickHandler = e => {
		e.stopPropagation();
		if (!path) return console.log(id, "no path");
		transitionTo(path);
	};

	const contextmenuHandler = e => {
		ContextMenu.open(e, BookmarkContextmenu.bind({ id }), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			className={concateClassNames("bookmark", className && className)}
			onContextMenu={contextmenuHandler}
			onClick={clickHandler}>
			<div className={concateClassNames("bookmark-icon", !icon && "discord-icon")}>{icon || <DiscordIcon />}</div>
			<div className="bookmark-title ellipsis">{title || path}</div>
		</div>
	);
}
