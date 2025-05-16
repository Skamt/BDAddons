import { Store } from "@/Store";
import { ContextMenu } from "@Api";
import React from "@React";
import { buildTab } from "@/utils";

import { CloseIcon,  PlusIcon } from "@Components/Icon";
import { createContextMenuItem } from "@/utils";

// const {  Menu } = ContextMenu;

function deleteBookmark(id) {
	Store.state.removeBookmark(id);
}

function openInNewTab(id) {
	Store.state.newTab(buildTab(Store.state.getBookmark(id)));
}

export default function (props) {
	const id = this.id;
	const Menu = ContextMenu.buildMenu([
		createContextMenuItem(null, "open-bookmark-in-new-tab", () => openInNewTab(id), "Open in new Tab", <PlusIcon />),
		{ type: "separator" },
		createContextMenuItem(null, "remove-bookmark", () => deleteBookmark(id), "Remove Bookmark", <CloseIcon />, "danger"),
	]);


	return <Menu {...props} className="bookmark-contextmenu"/>;
}
