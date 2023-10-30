import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import ChannelsStateManager from "../ChannelsStateManager";
import CreateChannel from "@Modules/CreateChannel";

export default () => {
	/**
	 * Listening for channels created by current user
	 **/
	if (CreateChannel)
		Patcher.after(CreateChannel, "createChannel", (_, [{ guildId }], ret) => {
			if (!ChannelsStateManager.has("guilds", guildId))
				ret.then(({ body }) => {
					ChannelsStateManager.add("channels", body.id);
				});
		});
	else Logger.patch("CreateChannel");
};
