import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";
import PermissionVADStore from "@Stores/PermissionVADStore";
import DiscordPermissions from "@Modules/DiscordPermissions";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";

Plugin.on(Events.START, () => {
	PermissionVADStore && Patcher.instead(PermissionVADStore, "shouldShowWarning", () => false);
	PermissionVADStore && Patcher.instead(PermissionVADStore, "canUseVoiceActivity", () => true);
	DiscordPermissions && Patcher.after(DiscordPermissions, "can", (_, [p], ret) => ret || DiscordPermissionsEnum.USE_VAD === p);
});

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;
