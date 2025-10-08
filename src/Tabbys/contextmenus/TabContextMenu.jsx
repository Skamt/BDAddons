import { ContextMenu } from "@Api";
import Store from "@/Store";
import { Dispatcher } from "@Discord/Modules";
import { BookmarkOutlinedIcon, DuplicateIcon, LightiningIcon,  VectorIcon } from "@Components/Icon";
import React from "@React";
import { wrapMenuItem } from "./helper";
import { nop } from "@Utils";
import { bookmarkTabAt, removeTabsToRight, removeOtherTabs, removeTabsToLeft, addTabToFolderAt } from "@/Store/methods";
import { CopyPathItem, CopyUserIdItem, CopyGuildIdItem, CopyChannelIdItem, MarkAsReadItem } from "./shared";

export default function (id, { path, channelId, userId, guildId, hasUnread }) {
	const canClose = Store.getTabsCount() > 1;

	const folders = Store.state.folders
		.map(({ id: folderId, name }) => {
			return {
				action: () => addTabToFolderAt(id, folderId),
				label: name,
				icon: BookmarkOutlinedIcon
			};
		})
		.map(wrapMenuItem);

	const copies = [
		CopyPathItem(path),
		channelId && CopyChannelIdItem(channelId), 
		guildId && CopyGuildIdItem(guildId), 
		userId && CopyUserIdItem(userId)
	].filter(Boolean).map(wrapMenuItem);


	const Menu = ContextMenu.buildMenu(
		[
			MarkAsReadItem(channelId, hasUnread),
			{ type: "separator" },
			{
				action: () => Store.addTabToRight(id),
				label: "New tab to right",
				icon: VectorIcon
			},
			{
				action: () => Store.addTabToLeft(id),
				label: "New tab to left",
				icon: VectorIcon
			},
			{ type: "separator" },
			{
				action: () => Store.duplicateTab(id),
				label: "Duplicate tab",
				icon: DuplicateIcon
			},
			{
				label: "Bookmark tab",
				action: () => bookmarkTabAt(id),
				type: folders.length > 0 ? "submenu" : null,
				icon: folders.length > 0 ? nop : BookmarkOutlinedIcon,
				items: folders
			},

			{ type: "separator" },
			...copies,

			canClose && { type: "separator" },

			canClose && {
				type: "submenu",
				label: "Close",
				action: () => Store.removeTab(id),
				color: "danger",
				items: [
					{
						action: () => removeTabsToRight(id),
						label: "Close Tabs to Right",
						icon: VectorIcon,
						color: "danger"
					},
					{
						action: () => removeTabsToLeft(id),
						label: "Close Tabs to Left",
						icon: VectorIcon,
						color: "danger"
					},
					{
						action: () => removeOtherTabs(id),
						label: "Close Other Tabs",
						icon: LightiningIcon,
						color: "danger"
					}
				]
					.filter(Boolean)
					.map(wrapMenuItem)
			}
		]
			.filter(Boolean)
			.map(wrapMenuItem)
	);

	return props => <Menu {...props} />;
}
