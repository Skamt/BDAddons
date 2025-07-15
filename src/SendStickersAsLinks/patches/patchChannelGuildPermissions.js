import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import DiscordPermissions from "@Modules/DiscordPermissions";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";

import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	if (!DiscordPermissions) return Logger.patchError("ChannelGuildPermissions");
	const unpatch = Patcher.after(DiscordPermissions, "can", (_, [permission], ret) => ret || DiscordPermissionsEnum.USE_EXTERNAL_EMOJIS === permission);

	Plugin.once(Events.STOP, unpatch);
});
