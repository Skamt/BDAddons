import { after } from "@common/Patcher";
import DiscordPermissions from "@Modules/DiscordPermissions";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";

import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	after(DiscordPermissions, "can", ({args:[permission], ret}) => ret || DiscordPermissionsEnum.USE_EXTERNAL_EMOJIS === permission);
});
