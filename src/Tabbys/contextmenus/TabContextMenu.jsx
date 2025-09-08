import Store from "@/Store";
import { ContextMenu } from "@Api";
import { CloseIcon, BookmarkOutlinedIcon, DuplicateIcon, LightiningIcon, PinIcon, VectorIcon } from "@Components/Icon";
import React from "@React";
import { createContextMenuItem } from "./helper";

function newTabRight(id) {
	Store.addTabToRight(id);
}

function newTabLeft(id) {
	Store.addTabToLeft(id);
}

function duplicateTab(id) {
	Store.duplicateTab(id);
}

function bookmarkTab(id) {
	Store.bookmarkTab(id);
}

function closeTab(id) {
	Store.removeTab(id);
}

function closeTabsToRight(id) {
	Store.removeTabsToRight(id);
}

function closeTabsToLeft(id) {
	Store.removeTabsToLeft(id);
}

function closeOtherTabs(id) {
	Store.removeOtherTabs(id);
}

export default function (id) {
	const canClose = Store.getTabsCount() > 1;

	const Menu = ContextMenu.buildMenu(
		[
			createContextMenuItem(null, "new-tab-right", () => newTabRight(id), "New Tab to Right", <VectorIcon />),
			createContextMenuItem(null, "new-tab-left", () => newTabLeft(id), "New Tab to Left", <VectorIcon style={{ rotate: "180deg" }} />),
			{ type: "separator" },
			createContextMenuItem(null, "duplicate-tab", () => duplicateTab(id), "Duplicate Tab", <DuplicateIcon />),
			// createContextMenuItem(null, "pin-tab", () => pinTab(id), "Pin Tab", <PinIcon />),
			createContextMenuItem(null, "bookmark-tab", () => bookmarkTab(id), "Bookmark Tab", <BookmarkOutlinedIcon />),
			canClose && { type: "separator" },
			canClose && createContextMenuItem("submenu", "close", () => closeTab(id), "Close", <CloseIcon />, "danger", [createContextMenuItem(null, "close-tabs-to-right", () => closeTabsToRight(id), "Close Tabs to Right", <VectorIcon />, "danger"), createContextMenuItem(null, "close-tabs-to-left", () => closeTabsToLeft(id), "Close Tabs to Left", <VectorIcon style={{ rotate: "180deg" }} />, "danger"), createContextMenuItem(null, "close-other-tabs", () => closeOtherTabs(id), "Close Other Tabs", <LightiningIcon />, "danger")])
		].filter(Boolean)
	);

	return props => <Menu {...props} />;
}
