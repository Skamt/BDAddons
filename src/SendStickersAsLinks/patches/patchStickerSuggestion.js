import { Patcher } from "@Api";
import Logger from "@Utils/Logger";

import StickerTypeEnum from "@Enums/StickerTypeEnum";

import StickerSendability from "@Modules/StickerSendability";
export default () => {
	/**
	 * Enables suggestions
	 * */

	if (StickerSendability)
		Patcher.after(StickerSendability, "getStickerSendability", (_, args, returnValue) => {
			if (args[0].type === StickerTypeEnum.GUILD) {
				const { SENDABLE } = StickerSendability.StickerSendability;
				return returnValue !== SENDABLE ? SENDABLE : returnValue;
			}
		});
	else Logger.patch("patchStickerSuggestion");
}