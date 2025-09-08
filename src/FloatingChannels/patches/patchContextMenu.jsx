import { Store } from "@/Store";
import { buildWindow } from "@/utils";
import { ContextMenu } from "@Api";
import config from "@Config";
import Plugin, { Events } from "@Utils/Plugin";
import { Filters, getModule } from "@Webpack";

const ChannelActions = getModule(Filters.byKeys("actions", "fetchMessages"));

Plugin.on(Events.START, () => {
	let unpatch = [
		...["thread-context", "user-context", "channel-context"].map(context =>
			ContextMenu.patch(context, (retVal, ag) => {
				console.log(ag);
				
				const channel = ag.channel;
				if (!channel) return;
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

	Plugin.once(Events.STOP, () => {
		unpatch?.forEach?.(p => p());
		unpatch = null;
	});
});
