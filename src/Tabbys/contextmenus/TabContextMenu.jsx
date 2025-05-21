import { Store } from "@/Store";
import { buildTab } from "@/utils";
import { ContextMenu } from "@Api";
import { CloseIcon, BookmarkOutlinedIcon, DuplicateIcon, LightiningIcon, PinIcon, VectorIcon } from "@Components/Icon";

import React from "@React";
import Toast from "@Utils/Toast";

import { createContextMenuItem } from "@/utils";

// const {  Menu } = ContextMenu;

function newTabRight(id) {
	Store.state.addTabToRight(id, buildTab({ path: "/channels/@me" }));
}

function newTabLeft(id) {
	Store.state.addTabToLeft(id, buildTab({ path: "/channels/@me" }));
}

function duplicateTab(id) {
	Store.state.duplicateTab(id);
}

// function pinTab(id) {
// 	Toast.info("Coming soon");
// 	Store.state.setTab(id, { pinned: true });
// }

function bookmarkTab(id) {
	Store.state.addBookmark(buildTab(Store.state.getTab(id)));
}

function closeTab(id) {
	Store.state.removeTab(id);
}

function closeTabsToRight(id) {
	Store.state.removeTabsToRight(id);
}

function closeTabsToLeft(id) {
	Store.state.removeTabsToLeft(id);
}

function closeOtherTabs(id) {
	Store.state.removeOtherTabs(id);
}

export default function (id) {
	const canClose = Store.state.getTabsCount() > 1;

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

	return props => (
		<Menu
			{...props}
			className="tab-contextmenu"
		/>
	);
}
