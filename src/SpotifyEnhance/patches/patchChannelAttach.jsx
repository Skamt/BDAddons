import { ContextMenu } from "@Api";
import { storeContextMenu } from "@/contextmenu.js";
import React from "@React";
import { Filters, lazy } from "@Webpack";
import Store from "@/store";
import Plugin from "@common/Plugin";
import { after } from "@common/Patcher";

Plugin.onStart(() => {
	lazy(Filters.bySource("Plus Button"), { decFilter: Filters.byStrings("Plus Button") }).then(
		(ChannelAttachMenu) => {
			after(...ChannelAttachMenu, ({ ret }) => {
				if (!Store.state.isActive) return;
				if (!Store.state.mediaId) return;
				if (!Array.isArray(ret?.props?.children)) return;

				ret.props.children.push(
					ContextMenu.buildItem({ type: "separator" }),
					...storeContextMenu(
						Store.getSongUrl(),
						Store.getSongBanners().bannerLg.url,
						Store.state.context?.type,
					).map(ContextMenu.buildItem.bind(ContextMenu)),
				);
			});
		},
	);
});
