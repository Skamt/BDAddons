import { Patcher } from "@Api";
import Settings from "@Utils/Settings";
import Plugin, { Events } from "@Utils/Plugin";
import Logger from "@Utils/Logger";
import ChannelsStateManager from "../ChannelsStateManager";
import TreadComponent from "@Modules/TreadComponent";

Plugin.on(Events.START, () => {
	if (!TreadComponent) return Logger.patchError("Tread");
	Patcher.after(TreadComponent, "type", (_, [{ thread }], returnValue) => {
		if (!Settings.state.autoloadedChannelIndicator) return;
		if (ChannelsStateManager.getChannelstate(thread.guild_id, thread.id)) 
			returnValue.props.className += " autoload";
	});
});
