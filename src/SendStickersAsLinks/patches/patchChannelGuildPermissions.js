import { Patcher } from "@Api";
import Logger from "@Utils/Settings";
import Permissions from "@Modules/Permissions";
import DiscordPermissions from "@Enums/DiscordPermissions";

export default () => {
	if (Permissions)
		Patcher.after(Permissions, "can", (_, [{ permission }], ret) =>
			ret || DiscordPermissions.USE_EXTERNAL_EMOJIS === permission
		);
	else Logger.patch("patchChannelGuildPermissions");
}