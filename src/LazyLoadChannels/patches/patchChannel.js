import { Patcher } from "@Api";
import { reactRefMemoFilter, waitForModule } from "@Webpack";
import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import ChannelsStateManager from "../ChannelsStateManager";
// import { ChannelComponent } from "@Discord/Modules";
import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	// if (!ChannelComponent) return Logger.patchError("Channel");
	const controller = new AbortController();

	waitForModule(reactRefMemoFilter("render", "hasActiveThreads"), { signal: controller.signal, searchExports: true }).then(ChannelComponent => {
		Patcher.after(ChannelComponent, "render", (_, [{ channel }], returnValue) => {
			if (!Settings.state.autoloadedChannelIndicator) return;
			if (ChannelsStateManager.getChannelstate(channel.guild_id, channel.id)) returnValue.props.children.props.children[1].props.className += " autoload";
		});
	});

	Plugin.once(Events.STOP, () => controller.abort());
});
