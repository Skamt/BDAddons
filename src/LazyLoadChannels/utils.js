import ChannelActions from "@Modules/ChannelActions";

export function loadChannel(channel, messageId) {
	ChannelActions.fetchMessages({
		channelId: channel.id,
		guildId: channel.guild_id,
		messageId
	});
}
