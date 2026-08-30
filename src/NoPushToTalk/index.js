import PermissionVADStore from "@Stores/PermissionVADStore";
import DiscordPermissions from "@Modules/DiscordPermissions";
import DiscordPermissionsEnum from "@Enums/DiscordPermissionsEnum";


module.exports = () => ({
	start() {
		PermissionVADStore && BdApi.Patcher.instead("NoPushToTalk",PermissionVADStore, "shouldShowWarning", () => false);
		PermissionVADStore && BdApi.Patcher.instead("NoPushToTalk",PermissionVADStore, "canUseVoiceActivity", () => true);
		DiscordPermissions && BdApi.Patcher.after("NoPushToTalk",DiscordPermissions, "can", (_, [p], ret) => ret || DiscordPermissionsEnum.USE_VAD === p);
	},
	stop: () => BdApi.Patcher.unpatchAll("NoPushToTalk")
});
