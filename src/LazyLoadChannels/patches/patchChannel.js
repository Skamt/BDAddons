import { after } from "@common/Patcher";
import { lazy } from "@Webpack";
import { reactRefMemoFilter } from "@Webpack";
import Settings from "@Utils/Settings";
import ChannelsStateManager from "../ChannelsStateManager";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	lazy(reactRefMemoFilter("render", "hasActiveThreads"), { searchExports: true }).then(([exports, key]) => {
		after(exports[key], "render", ({ args: [{ channel }], ret }) => {
			if (!Settings.state.autoloadedChannelIndicator) return;
			if (ChannelsStateManager.getChannelstate(channel.guild_id, channel.id)) ret.props.children.props.children[1].props.className += " autoload";
		});
	});
});
