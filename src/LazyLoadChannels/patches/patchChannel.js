import { Patcher } from "@Api";
import Settings from "@Utils/Settings";

import Logger from "@Utils/Logger";
import ChannelsStateManager from "../ChannelsStateManager";
import ChannelComponent from "@Patch/ChannelComponent";

export default () => {
	const { module, key } = ChannelComponent;
	if (module && key)
		Patcher.after(module, key, (_, [{ channel }], returnValue) => {
			if (!Settings.get("autoloadedChannelIndicator")) return;
			if (ChannelsStateManager.getChannelstate(channel.guild_id, channel.id)) 
				returnValue.props.children.props.children[1].props.className += " autoload";
		});
	else Logger.patch("Channel");
};
