import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import getStickerSendability from "@Patch/getStickerSendability";

import StickerTypeEnum from "@Enums/StickerTypeEnum";
import StickersSendabilityEnum from "@Enums/StickersSendabilityEnum";

export default () => {
	/**
	 * Enable suggestions for custom stickers only 
	 * */
	const { module, key } = getStickerSendability;
	if (module && key)
		Patcher.after(module, key, (_, args, returnValue) => {
			if (args[0].type === StickerTypeEnum.GUILD) {
				const { SENDABLE } = StickersSendabilityEnum;
				return returnValue !== SENDABLE ? SENDABLE : returnValue;
			}
		});
	else Logger.patch("patchStickerSuggestion");
}