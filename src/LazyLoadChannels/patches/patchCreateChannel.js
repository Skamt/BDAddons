import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import ChannelsStateManager from "../ChannelsStateManager";
import CreateChannel from "@Modules/CreateChannel";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	if (!CreateChannel) return Logger.patchError("CreateChannel");
	Patcher.after(CreateChannel, "createChannel", (_, [{ guildId }], ret) => {
		if (!ChannelsStateManager.has("guilds", guildId))
			ret.then(({ body }) => {
				ChannelsStateManager.add("channels", body.id);
			});
	});
});
