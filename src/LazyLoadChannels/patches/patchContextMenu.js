import Settings from "@Utils/Settings";
import ChannelsStateManager from "@/ChannelsStateManager";
import ChannelTypeEnum from "@Enums/ChannelTypeEnum";
import Plugin from "@common/Plugin";
import ContextMenu, { patch, patchMultiple } from "@common/Patcher/contextmenu";

Plugin.onStart(() => {
	patch("user-context", (ret, { channel, targetIsUser }) => {
		if (targetIsUser) return;
		if (!Settings.state.lazyLoadDMs) return;
		ret.props.children.splice(
			1,
			0,
			ContextMenu.buildItem({
				type: "toggle",
				label: "Auto load",
				active: ChannelsStateManager.getChannelstate(channel.guild_id, channel.id),
				action: () => ChannelsStateManager.toggelChannel(channel.guild_id, channel.id)
			})
		);
	});

	patch("guild-context", (ret, { guild }) => {
		if (guild)
			ret.props.children.splice(
				1,
				0,
				ContextMenu.buildItem({
					type: "toggle",
					label: "Auto load",
					active: ChannelsStateManager.has("guilds", guild.id),
					action: () => ChannelsStateManager.toggelGuild(guild.id)
				})
			);
	});

	patchMultiple(["channel-context", "thread-context"], (ret, { channel }) => {
		if (!channel || channel.type === ChannelTypeEnum.GUILD_CATEGORY) return ret;
		ret.props.children.splice(
			1,
			0,
			ContextMenu.buildItem({
				type: "toggle",
				label: "Auto load",
				active: ChannelsStateManager.getChannelstate(channel.guild_id, channel.id),
				action: () => ChannelsStateManager.toggelChannel(channel.guild_id, channel.id)
			})
		);
	});

	patchMultiple(["channel-context", "thread-context", "guild-context"], ret => ret.props.children.splice(1, 0, ContextMenu.buildItem({ type: "separator" })));
});
