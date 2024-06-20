import { ContextMenu } from "@Api";
import Settings from "@Utils/Settings";
import ChannelsStateManager from "../ChannelsStateManager";
import ChannelTypeEnum from "@Enums/ChannelTypeEnum";

export default () => {
	return [
		ContextMenu.patch("user-context", (retVal, { channel, targetIsUser }) => {
			if (targetIsUser) return;
			if (!Settings.state.lazyLoadDMs) return;
			retVal.props.children.splice(1, 0, ContextMenu.buildItem({
				type: "toggle",
				label: "Auto load",
				active: ChannelsStateManager.getChannelstate(channel.guild_id, channel.id),
				action: () => ChannelsStateManager.toggelChannel(channel.guild_id, channel.id)
			}));
		}),
		ContextMenu.patch("guild-context", (retVal, { guild }) => {
			if (guild)
				retVal.props.children.splice(1, 0, ContextMenu.buildItem({
					type: "toggle",
					label: "Auto load",
					active: ChannelsStateManager.has('guilds', guild.id),
					action: () => ChannelsStateManager.toggelGuild(guild.id)
				}));
		}),
		...["channel-context", "thread-context"].map(context =>
			ContextMenu.patch(context, (retVal, { channel }) => {
				if (channel && channel.type !== ChannelTypeEnum.GUILD_CATEGORY)
					retVal.props.children.splice(1, 0, ContextMenu.buildItem({
						type: "toggle",
						label: "Auto load",
						active: ChannelsStateManager.getChannelstate(channel.guild_id, channel.id),
						action: () => ChannelsStateManager.toggelChannel(channel.guild_id, channel.id)
					}));
			})
		),
		...["channel-context", "thread-context", "guild-context"].map(context =>
			ContextMenu.patch(context, retVal => retVal.props.children.splice(1, 0, ContextMenu.buildItem({ type: "separator" })))
		)
	]
}