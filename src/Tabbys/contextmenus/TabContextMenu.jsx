import Store from "@/Store";
import { ContextMenu } from "@Api";
import { CloseIcon, BookmarkOutlinedIcon, DuplicateIcon, LightiningIcon, PinIcon, VectorIcon } from "@Components/Icon";
import React from "@React";
import { createContextMenuItem } from "./helper";
import { nop } from "@Utils";

export default function (id) {
	const canClose = Store.getTabsCount() > 1;

	const folders = Store.state.folders.map(({ id: folderId, name }) => {
		return createContextMenuItem(null, `bookmark-tab-${folderId}`, () => Store.addTabToFolder(id, folderId), name, BookmarkOutlinedIcon);
	});

	const Menu = ContextMenu.buildMenu(
		[
			createContextMenuItem(null, "new-tab-right", () => Store.addTabToRight(id), "New Tab to Right", VectorIcon),
			createContextMenuItem(null, "new-tab-left", () => Store.addTabToLeft(id), "New Tab to Left", VectorIcon),
			{
				type: "separator"
			},
			createContextMenuItem(null, "duplicate-tab", () => Store.duplicateTab(id), "Duplicate Tab", DuplicateIcon),
			// createContextMenuItem(null, "pin-tab", () => pinTab(id), "Pin Tab", <PinIcon />),
			createContextMenuItem(folders.length > 0 ? "submenu" : null, "bookmark-tab", () => Store.bookmarkTab(id), "Bookmark Tab", folders.length > 0 ? nop : BookmarkOutlinedIcon, null, folders),
			canClose && {
				type: "separator"
			},
			canClose && createContextMenuItem("submenu", "close", () => Store.removeTab(id), "Close", nop, "danger", [createContextMenuItem(null, "close-tabs-to-right", () => Store.removeTabsToRight(id), "Close Tabs to Right", VectorIcon, "danger"), createContextMenuItem(null, "close-tabs-to-left", () => Store.removeTabsToLeft(id), "Close Tabs to Left", VectorIcon, "danger"), createContextMenuItem(null, "close-other-tabs", () => Store.removeOtherTabs(id), "Close Other Tabs", LightiningIcon, "danger")])
		].filter(Boolean)
	);

	return props => <Menu {...props} />;
}
