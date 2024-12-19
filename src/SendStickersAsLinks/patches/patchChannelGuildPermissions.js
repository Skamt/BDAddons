import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import DiscordPermissions from "@Modules/DiscordPermissions";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";

export default () => {
	if (!DiscordPermissions) return Logger.patchError("ChannelGuildPermissions");
	Patcher.after(DiscordPermissions, "can", (_, [permission], ret) => ret || DiscordPermissionsEnum.USE_EXTERNAL_EMOJIS === permission);
};
