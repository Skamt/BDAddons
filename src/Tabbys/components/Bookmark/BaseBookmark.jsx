import BookmarkContextmenu from "@/contextmenus/BookmarkContextmenu";
import { ContextMenu } from "@Api";
import { transitionTo } from "@Discord/Modules";
import React from "@React";
import { concateClassNames } from "@Utils";
import Settings from "@Utils/Settings"

export default function BaseBookmark({ id, path, icon, title, className }) {
	const size = Settings.state.size;
	const clickHandler = e => {
		e.stopPropagation();
		if (!path) return console.log(id, "no path");
		transitionTo(path);
	};

	const contextmenuHandler = e => {
		ContextMenu.open(e, BookmarkContextmenu(id), {
			position: "bottom",
			align: "left"
		});
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			style={{"--size":size}}
			className={concateClassNames("bookmark flex-center", className && className)}
			onContextMenu={contextmenuHandler}
			onClick={clickHandler}>
			<div className="bookmark-icon flex-center round">{icon}</div>
			<div className="bookmark-title ellipsis">{title || path}</div>
		</div>
	);
}
