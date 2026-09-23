import config from "@Config";

import ContextMenu, { patch, patchMultiple } from "@common/Patcher/contextmenu";
import Settings from "@Utils/Settings";
import { wrapMenuItem } from "@/contextmenus/helper";
import Store from "@/Store";
import React from "@React";
import { ChannelTypeEnum } from "@Discord/Enums";
import { getPathName, nop } from "@Utils";
import { BookmarkOutlinedIcon, PlusIcon } from "@Components/Icon";
import ChannelStore from "@Stores/ChannelStore";
import { addBookmarkAt, addToFolderAt } from "@/Store/methods";
import Plugin from "@common/Plugin";

export function channelPath(...args) {
	return `/channels/${args.filter(Boolean).join("/")}`;
}

function getPath(channel) {
	switch (channel.type) {
		case ChannelTypeEnum.GUILD_ANNOUNCEMENT:
		case ChannelTypeEnum.GUILD_FORUM:
		case ChannelTypeEnum.GUILD_MEDIA:
		case ChannelTypeEnum.GUILD_TEXT:
			return channelPath(channel.guild_id, channel.id);
		case ChannelTypeEnum.ANNOUNCEMENT_THREAD:
		case ChannelTypeEnum.PUBLIC_THREAD:
		case ChannelTypeEnum.PRIVATE_THREAD:
			return channelPath(channel.guild_id, channel.parent_id, "threads", channel.id);
		case ChannelTypeEnum.DM:
		case ChannelTypeEnum.GROUP_DM:
			return channelPath("@me", channel.id);
	}
}

function menu(path) {
	const { showBookmarkbar, showTabbar } = Settings.state;
	if (!showBookmarkbar && !showTabbar) return;

	const menu = [ContextMenu.buildItem({ type: "separator" })];

	const folders = Store.state.folders.map(({ id, name }) =>
		wrapMenuItem({
			action: () => addToFolderAt(path, id),
			label: name,
			leadingAccessory: { type: "icon", icon: BookmarkOutlinedIcon },
		}),
	);

	const bookmark = {
		action: () => addBookmarkAt(path),
		label: "Bookmark channel",
		type: folders.length > 0 ? "submenu" : null,
		leadingAccessory: { type: "icon", icon: folders.length > 0 ? nop : BookmarkOutlinedIcon },
		items: folders,
	};

	const tab = {
		action: () => Store.newTab(path),
		leadingAccessory: { type: "icon", icon: PlusIcon },
		label: "Open in new Tab",
	};

	const id = `${config.info.name}-channel-options`;
	if (showBookmarkbar && !showTabbar) menu.push(ContextMenu.buildItem({ id, ...bookmark }));
	else if (!showBookmarkbar && showTabbar) menu.push(ContextMenu.buildItem({ id, ...tab }));
	else if (showBookmarkbar && showTabbar)
		menu.push(
			ContextMenu.buildItem({
				type: "submenu",
				id,
				label: config.info.name,
				items: [tab, bookmark],
			}),
		);

	return menu;
}

Plugin.onStart(() => {
	patchMultiple(["thread-context", "channel-context"], (retVal, { channel, targetIsUser }) => {
		if (!channel || targetIsUser) return;
		const path = getPath(channel);
		if (!path) return;
		retVal.props.children.push(...menu(path));
	});

	patch("channel-mention-context", (retVal, { originalLink }) => {
		const path = getPathName(originalLink);
		if (!path) return;
		retVal.props.children.push(...menu(path));
	});
	patch("user-context", (retVal, { user }) => {
		if (user.email) return;
		const channel = ChannelStore.getDMChannelFromUserId(user.id);
		if (!channel) return;
		const path = getPath(channel);
		if (!path) return;
		retVal.props.children.push(...menu(path));
	});
});
