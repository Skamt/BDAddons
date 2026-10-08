import { after } from "@common/Patcher";
import { lazy } from "@Webpack";
import { getNestedProp } from "@Utils/Object";
import { Filters } from "@Webpack";
import Settings from "@Settings";
import ChannelsStateManager from "../ChannelsStateManager";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	lazy(Filters.bySource("modeUnreadLessImportant", "UNREAD_LESS_IMPORTANT"), { decFilter: Filters.byStrings("channel_item") }).then(ChannelName => {
		after(...ChannelName, ({ args: [{ channel }], ret }) => {
			if (!Settings.state.autoloadedChannelIndicator) return;
			if (!ChannelsStateManager.getChannelstate(channel.guild_id, channel.id)) return;

			const prop = getNestedProp(ret, "props.children.props");
			if (prop) prop.className += " autoload";
		});
	});
});
