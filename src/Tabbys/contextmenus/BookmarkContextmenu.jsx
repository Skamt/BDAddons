import { Store } from "@/Store";
import { ContextMenu } from "@Api";
import CloseIcon from "@Components/icons/CloseIcon";
import React from "@React";

import BookmarkIcon from "@Components/icons/BookmarkIcon";
import DuplicateIcon from "@Components/icons/DuplicateIcon";
import LightiningIcon from "@Components/icons/LightiningIcon";
import PinIcon from "@Components/icons/PinIcon";
import VectorIcon from "@Components/icons/VectorIcon";

import { createContextMenuItem } from "@/utils";

// const {  Menu } = ContextMenu;

function deleteBookmark(bookmarkId) {
	Store.state.removeBookmark(bookmarkId);
}

export default function (props) {
	const bookmarkId = this.bookmarkId;
	const Menu = ContextMenu.buildMenu([
		createContextMenuItem(null, "new-tab-right", () => deleteBookmark(bookmarkId), "Remove Bookmark", <CloseIcon />),]);

	return <Menu {...props} className="bookmark-contextmenu"/>;
}
