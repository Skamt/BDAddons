import { Patcher } from "@Api";
import Settings from "@Utils/Settings";

import Logger from "@Utils/Logger";
import ChannelsStateManager from "../ChannelsStateManager";
import ChannelComponent from "@Patch/ChannelComponent";

export default () => {
	const { module, key } = ChannelComponent;
	if (!module || !key) return Logger.patchError("Channel");
	Patcher.after(module, key, (_, [{ channel }], returnValue) => {
		if (!Settings.state.autoloadedChannelIndicator) return;
		if (ChannelsStateManager.getChannelstate(channel.guild_id, channel.id)) returnValue.props.children.props.children[1].props.className += " autoload";
	});
};
