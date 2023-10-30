import { Patcher } from "@Api";
import Settings from "@Utils/Settings";

import Logger from "@Utils/Logger";
import ChannelsStateManager from "../ChannelsStateManager";
import TreadComponent from "@Modules/TreadComponent";

export default () => {
	if (TreadComponent)
		Patcher.after(TreadComponent, "type", (_, [{ thread }], returnValue) => {
			if (!Settings.get("autoloadedChannelIndicator")) return;
			if (ChannelsStateManager.getChannelstate(thread.guild_id, thread.id)) 
				returnValue.props.className += " autoload";
		});
	else Logger.patch("Tread");
};
