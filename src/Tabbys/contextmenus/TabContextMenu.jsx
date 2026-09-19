import { ContextMenu } from "@Api";
import Store from "@/Store";
import { Dispatcher } from "@Discord/Modules";
import { BookmarkOutlinedIcon, DuplicateIcon, LightiningIcon, VectorIcon } from "@Components/Icon";
import React from "@React";
import { sanitize, getCopies, getFolders, wrapMenuItem } from "./helper";

import { bookmarkTabAt, removeTabsToRight, removeOtherTabs, removeTabsToLeft, addTabToFolderAt } from "@/Store/methods";
import { copyItem, MarkAsReadItem } from "./shared";

export default function (id, { path, channelId, userId, guildId, hasUnread }) {
	const canClose = Store.getTabsCount() > 1;

	const folders = getFolders((folderId, name) => ({
		action: () => addTabToFolderAt(id, folderId),
		label: name,
		icon: BookmarkOutlinedIcon
	}));

	const Menu = ContextMenu.buildMenu(
		sanitize([
			...MarkAsReadItem(channelId, hasUnread),

			{
				action: () => Store.addTabToRight(id),
				label: "New tab to right",
				leadingAccessory: { type: "icon", icon: VectorIcon }
			},
			{
				action: () => Store.addTabToLeft(id),
				label: "New tab to left",
				leadingAccessory: { type: "icon", icon: VectorIcon }
			},
			{ type: "separator" },
			{
				action: () => Store.duplicateTab(id),
				label: "Duplicate tab",
				leadingAccessory: { type: "icon", icon: DuplicateIcon }
			},
			{
				label: "Bookmark tab",
				action: () => bookmarkTabAt(id),
				type: folders.length > 0 ? "submenu" : null,
				leadingAccessory: { type: "icon", icon: BookmarkOutlinedIcon },
				items: folders
			},

			{ type: "separator" },
			...getCopies({ path, channelId, userId, guildId }),
			{ type: "separator" },
			{
				type: "submenu",
				label: "Move",
				items: sanitize([
					{
						action: () => Store.moveRight(id),
						label: "Move right",
						leadingAccessory: { type: "icon", icon: VectorIcon }
					},
					{
						action: () => Store.moveLeft(id),
						label: "Move Left",
						leadingAccessory: { type: "icon", icon: VectorIcon }
					}
				])
			},
			canClose && { type: "separator" },

			canClose && {
				type: "submenu",
				label: "Close",
				action: () => Store.removeTab(id),
				color: "danger",
				items: sanitize([
					{
						action: () => removeTabsToRight(id),
						label: "Close Tabs to Right",
						leadingAccessory: { type: "icon", icon: VectorIcon },
						color: "danger"
					},
					{
						action: () => removeTabsToLeft(id),
						label: "Close Tabs to Left",
						leadingAccessory: { type: "icon", icon: VectorIcon },
						color: "danger"
					},
					{
						action: () => removeOtherTabs(id),
						label: "Close Other Tabs",
						leadingAccessory: { type: "icon", icon: LightiningIcon },
						color: "danger"
					}
				])
			}
		])
	);

	return props => <Menu {...props} />;
}

