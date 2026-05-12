import { getModule, Filters } from "@Webpack";
import { Patcher } from "@Api";
import Settings from "@Utils/Settings";
import Plugin, { Events } from "@Utils/Plugin";
import Logger from "@Utils/Logger";
import ChannelsStateManager from "../ChannelsStateManager";

const TreadComponent = getModule(Filters.bySource("withGuildIcon", "thread", "collapsed"), {
	declarationFilter: Filters.byComponentType(Filters.byStrings("0nZpiF", "isThread", "collapsed"))
});

Plugin.on(Events.START, () => {
	if (!TreadComponent) return Logger.patchError("Tread");
	Patcher.after(TreadComponent, "type", (_, [{ thread }], ret) => {
		if (!Settings.state.autoloadedChannelIndicator) return;
		if (ChannelsStateManager.getChannelstate(thread.guild_id, thread.id)) ret.props.className += " autoload";
	});
});
