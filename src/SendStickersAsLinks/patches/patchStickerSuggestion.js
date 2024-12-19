import { Patcher } from "@Api";
import Logger from "@Utils/Logger";

import StickerTypeEnum from "@Enums/StickerTypeEnum";

import { StickerSendability } from "../Modules";

export default () => {
	/**
	 * Enables suggestions
	 * */

	if (!StickerSendability) return Logger.patchError("StickerSuggestion");

	Patcher.after(StickerSendability.module, StickerSendability.mangledKeys.getStickerSendability, (_, args, returnValue) => {
		if (args[0].type === StickerTypeEnum.GUILD) {
			const { SENDABLE } = StickerSendability.StickerSendability;
			return returnValue !== SENDABLE ? SENDABLE : returnValue;
		}
	});
};
