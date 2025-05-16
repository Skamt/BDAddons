import { ContextMenu } from "@Api";
import {  MenuLabel } from "@Components/ContextMenu";
import { Store } from "@/Store";
import React from "@React";
import { ChannelTypeEnum } from "@Discord/Enums";
import { buildTab } from "@/utils";
import { BookmarkOutlinedIcon, PlusIcon } from "@Components/Icon";
// import { createContextMenuItem } from "@/utils";

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

export default () => {
	return ["thread-context", "channel-context", "user-context"].map(context =>
		ContextMenu.patch(context, (retVal, { channel, targetIsUser }) => {
			if (!channel || targetIsUser) return;
			const path = getPath(channel);

			retVal.props.children.push(
				ContextMenu.buildItem({ type: "separator" }),
				ContextMenu.buildItem({
					type: "submenu",
					id:`${config.info.name}-channel-options`,
					label: <MenuLabel label={config.info.name} />,
					items: [
						{
							action: () => Store.state.newTab(buildTab({ path })),
							icon: PlusIcon,
							label: "Open in new Tab"
						},
						{
							action: () => Store.state.addBookmark(buildTab({ path })),
							icon: BookmarkOutlinedIcon,
							label: "Bookmark channel"
						}
					]
				})
			);
		})
	);
};
