import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";
import Logger from "@Utils/Logger";

import StickerTypeEnum from "@Enums/StickerTypeEnum";

import { StickerSendability } from "../Modules";

Plugin.on(Events.START, () => {
	/**
	 * Enables suggestions
	 * */

	if (!StickerSendability) return Logger.patchError("StickerSuggestion");
	const unpatch = Patcher.after(StickerSendability, "getStickerSendability", (_, args, returnValue) => {
		if (args[0].type === StickerTypeEnum.GUILD) {
			const { SENDABLE } = StickerSendability.StickersSendabilityEnum;
			return returnValue !== SENDABLE ? SENDABLE : returnValue;
		}
	});

	Plugin.once(Events.STOP, unpatch);
});
