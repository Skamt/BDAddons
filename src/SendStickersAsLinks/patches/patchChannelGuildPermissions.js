import { Patcher } from "@Api";
import Logger from "@Utils/Settings";
import DiscordPermissions from "@Modules/DiscordPermissions";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";

export default () => {
	if (DiscordPermissions)
		Patcher.after(DiscordPermissions, "can", (_, [permission], ret) => 
			ret || DiscordPermissionsEnum.USE_EXTERNAL_EMOJIS === permission
		);
	else Logger.patch("patchChannelGuildPermissions");
};