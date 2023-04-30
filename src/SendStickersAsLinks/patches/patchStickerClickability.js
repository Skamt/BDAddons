import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import isStickerSendable from "@Patch/isStickerSendable";
import StickerTypeEnum from "@Enums/StickerTypeEnum";

export default () => {
	/**
	 * if guild sticker return true to make it clickable
	 * ignoreing discord's stickers because they're not regular images, and ToS
	 * */
	const { module, key } = isStickerSendable;
	if (module && key)
		Patcher.after(module, key, (_, args) => {
			return args[0].type === StickerTypeEnum.GUILD;
		});
	else Logger.patch("patchStickerClickability");
};