import { getModule, Filters } from "@Webpack";
import { Patcher } from "@Api";
import Settings from "@Utils/Settings";
import Plugin, { Events } from "@Utils/Plugin";
import Logger from "@Utils/Logger";
import ChannelsStateManager from "../ChannelsStateManager";
import { getObjectKey } from "@Utils";
import { waitForModule } from "@Webpack";

Plugin.on(Events.START, () => {
	const controller = new AbortController();
	waitForModule(Filters.bySource("withGuildIcon", "thread", "collapsed"), 
		{ signal: controller.signal, raw: true }).then(({ declarations: TreadComponent }) => {
		const key = getObjectKey(TreadComponent, Filters.byComponentType(Filters.byStrings("0nZpiF", "isThread", "collapsed")));
		if (!key) return Logger.patchError("TreadComponent");
		Patcher.after(TreadComponent[key], "type", (_, [{ thread }], ret) => {
			if (!Settings.state.autoloadedChannelIndicator) return;
			if (ChannelsStateManager.getChannelstate(thread.guild_id, thread.id)) ret.props.className += " autoload";
		});
	});
	Plugin.once(Events.STOP, () => controller.abort());
});
