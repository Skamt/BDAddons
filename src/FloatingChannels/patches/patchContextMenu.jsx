import config from "@Config";
import { ContextMenu } from "@Api";
import { Store } from "@/Store";
import { buildWindow } from "@/utils";

import { getModule, Filters } from "@Webpack";
const ChannelActions = getModule(Filters.byKeys("actions", "fetchMessages"));

export default () => {
	return [
		...["thread-context", "user-context", "channel-context"].map(context =>
			ContextMenu.patch(context, (retVal, { channel }) => {
				if(!channel) return;
				retVal.props.children.splice(0, 0, [
					ContextMenu.buildItem({
						id: `${config.info.name}-open-window`,
						action: () => {
							ChannelActions.fetchMessages({ channelId: channel.id });
							Store.state.add(buildWindow(channel.id));
						},
						label: "Open in window"
					}),
					ContextMenu.buildItem({ type: "separator" })
				]);
			})
		)
	];
};
