import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import isStickerSendable from "@Patch/isStickerSendable";

export default () => {
	/**
	 * Make stickers clickable.
	 **/
	const { module, key } = isStickerSendable;
	if (module && key) Patcher.after(module, key, () => true);
	else Logger.patch("patchStickerClickability");
};
