import React from "@React";
import ErrorBoundary from "@Components/ErrorBoundary";
import { lazy, Filters } from "@Webpack";
import { instead } from "@common/Patcher";
import ContextMenu, { patch } from "@common/Patcher/contextmenu";
import Plugin from "@common/Plugin";
import { insertChild } from "@React";
import Store from "@/store";

Plugin.onStart(() => {
	lazy(Filters.bySource("useConversationScroll"), { decFilter: Filters.byStrings("customUserThemeSettings") }).then(ChannelContent =>
		instead(...ChannelContent, ({ args: [props], fn }) => {
			const compact = Store(() => Store.has(props.channel.id));

			return (
				<ErrorBoundary
					fallback={React.createElement(fn, props)}>
					{React.createElement(fn, Object.assign(props, { messageDisplayCompact: compact }))}
				</ErrorBoundary>
			);
		})
	);

	patch("channel-context", (retVal, { channel }) => {
		if (!channel) return;
		const enabled = Store.has(channel.id);
		const MenuItem = ContextMenu.buildItem({
			id: `channel-compact`,
			type: "toggle",
			label: `Force compact`,
			active: enabled,
			action: () => {
				if (enabled) Store.delete(channel.id);
				else Store.add(channel.id);
			}
		});

		insertChild(retVal, MenuItem, 0);
	});
});

module.exports = () => Plugin;
