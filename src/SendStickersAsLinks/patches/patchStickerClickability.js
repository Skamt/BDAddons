import { Patcher } from "@Api";
import Logger from "@Utils/Logger";

import { StickerSendability } from "../Modules";

import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	/**
	 * Make stickers clickable.
	 **/

	if (!StickerSendability) return Logger.patchError("StickerClickability");
	const unpatch = Patcher.after(StickerSendability, "isSendableSticker", () => true);

	Plugin.once(Events.STOP, unpatch);
});
