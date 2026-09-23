import { Filters } from "@Webpack";
import { after } from "@common/Patcher";
import { lazy } from "@Webpack";
import Settings from "@Utils/Settings";
import Plugin from "@common/Plugin";
import ChannelsStateManager from "../ChannelsStateManager";

Plugin.onStart(() => {
	lazy(Filters.bySource("withGuildIcon", "thread", "collapsed"), {
		decFilter: Filters.byComponentType(Filters.byStrings("0nZpiF", "isThread", "collapsed")),
	}).then(([TreadComponent, key]) => {
		after(TreadComponent[key], "type", ({ args: [{ thread }], ret }) => {
			if (!Settings.state.autoloadedChannelIndicator) return;
			if (ChannelsStateManager.getChannelstate(thread.guild_id, thread.id))
				ret.props.className += " autoload";
		});
	});
});
