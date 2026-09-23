import { after } from "@common/Patcher";
import ChannelsStateManager from "../ChannelsStateManager";
import CreateChannel from "@Modules/CreateChannel";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	after(CreateChannel, "createChannel", ({ args: [{ guildId }], ret }) => {
		if (!ChannelsStateManager.has("guilds", guildId))
			ret.then(({ body }) => {
				ChannelsStateManager.add("channels", body.id);
			});
	});
});
