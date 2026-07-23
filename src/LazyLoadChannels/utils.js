import ChannelActions from "@Modules/ChannelActions";
import Settings from "@Utils/Settings";
import ControlKeys from "@Utils/ControlKeys";
import ChannelsStateManager from "@/ChannelsStateManager";
import ChannelTypeEnum from "@Enums/ChannelTypeEnum";

export function loadChannel(channel, messageId) {
	ChannelActions.fetchMessages({
		channelId: channel.id,
		guildId: channel.guild_id,
		messageId,
	});
}

export function shouldLoad({ guild_id, id, type } = {}) {
	return (
		ControlKeys.ctrlKey ||
		(type === ChannelTypeEnum.GUILD_VOICE && !Settings.state.lazyLoadVoice) ||
		(type === ChannelTypeEnum.GUILD_FORUM && !Settings.state.lazyLoadForum) ||
		(!guild_id && !Settings.state.lazyLoadDMs) ||
		ChannelsStateManager.getChannelstate(guild_id, id)
	);
}
