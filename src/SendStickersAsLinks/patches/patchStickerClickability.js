import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import StickerSendability from "@Modules/StickerSendability";

export default () => {
	/**
	 * Make stickers clickable.
	 **/

	if (StickerSendability) 
		Patcher.after(StickerSendability, "isSendableSticker", () => true);
	else Logger.patch("patchStickerClickability");
};
