import { Store } from "@/Store";
import { ContextMenu } from "@Api";
import CloseIcon from "@Components/icons/CloseIcon";
import React from "@React";
import Toast from "@Utils/Toast";
import { buildTab } from "@/utils";
import BookmarkIcon from "@Components/icons/BookmarkIcon";
import DuplicateIcon from "@Components/icons/DuplicateIcon";
import LightiningIcon from "@Components/icons/LightiningIcon";
import PinIcon from "@Components/icons/PinIcon";
import VectorIcon from "@Components/icons/VectorIcon";

import { createContextMenuItem } from "@/utils";

// const {  Menu } = ContextMenu;

function newTabRight(tabId) {
	Store.state.addTabToRight(tabId, buildTab({ path: "/channels/@me" }));
}

function newTabLeft(tabId) {
	Store.state.addTabToLeft(tabId, buildTab({ path: "/channels/@me" }));
}

function duplicateTab(tabId) {
	Store.state.duplicateTab(tabId);
}

function pinTab(tabId) {
	Toast.info("Coming soon");
}

function bookmarkTab(tabId) {
	const state = Store.state;
	const tab = state.getTab(tabId);
	state.addBookmark(tab);
}

function closeTab(tabId) {
	Store.state.removeTab(tabId);
}

function closeTabsToRight(tabId) {
	Store.state.removeTabsToRight(tabId);
}
function closeTabsToLeft(tabId) {
	Store.state.removeTabsToLeft(tabId);
}
function closeOtherTabs(tabId) {
	Store.state.removeOtherTabs(tabId);
}

export default function (props) {
	const tabId = this.tabId;
	const Menu = ContextMenu.buildMenu([
		createContextMenuItem(null, "new-tab-right", () => newTabRight(tabId), "New Tab to Right", <VectorIcon />),
		createContextMenuItem(null, "new-tab-left", () => newTabLeft(tabId), "New Tab to Left", <VectorIcon left={true} />),
		{ type: "separator" },
		createContextMenuItem(null, "duplicate-tab", () => duplicateTab(tabId), "Duplicate Tab", <DuplicateIcon />),
		createContextMenuItem(null, "pin-tab", () => pinTab(tabId), "Pin Tab", <PinIcon />),
		createContextMenuItem(null, "bookmark-tab", () => bookmarkTab(tabId), "Bookmark Tab", <BookmarkIcon />),
		{ type: "separator" },
		createContextMenuItem("submenu", "close", () => closeTab(tabId), "Close", <CloseIcon />, "danger", [createContextMenuItem(null, "close-tabs-to-right", () => closeTabsToRight(tabId), "Close Tabs to Right", <VectorIcon />, "danger"), createContextMenuItem(null, "close-tabs-to-left", () => closeTabsToLeft(tabId), "Close Tabs to Left", <VectorIcon left={true} />, "danger"), createContextMenuItem(null, "close-other-tabs", () => closeOtherTabs(tabId), "Close Other Tabs", <LightiningIcon />, "danger")])
	]);

	return (
		<Menu
			{...props}
			className="tab-contextmenu"
		/>
	);
}
