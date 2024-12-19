import { Patcher } from "@Api";
import Logger from "@Utils/Logger";

import { StickerSendability } from "../Modules";

export default () => {
	/**
	 * Make stickers clickable.
	 **/

	if (!StickerSendability) return Logger.patchError("StickerClickability");
	Patcher.after(StickerSendability.module,  StickerSendability.mangledKeys.isSendableSticker, () => true);
};
