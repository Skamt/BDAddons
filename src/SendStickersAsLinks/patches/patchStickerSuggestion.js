import Plugin from "@common/Plugin";
import { after } from "@common/Patcher";
import StickerTypeEnum from "@Enums/StickerTypeEnum";
import { StickerSendability } from "../Modules";

Plugin.onStart(() =>
	after(StickerSendability, "getStickerSendability", ({ args, ret }) => {
		if (args[0].type === StickerTypeEnum.GUILD) {
			const { SENDABLE } = StickerSendability.StickersSendabilityEnum;
			return ret !== SENDABLE ? SENDABLE : ret;
		}
	})
);
