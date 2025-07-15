import { Patcher } from "@Api";
import Logger from "@Utils/Logger";

import { StickerSendability } from "../Modules";

import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	/**
	 * Make stickers clickable.
	 **/

	if (!StickerSendability) return Logger.patchError("StickerClickability");
	const unpatch = Patcher.after(StickerSendability, "isSendableSticker", () => true);

	Plugin.once(Events.STOP, unpatch);
});
