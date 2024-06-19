import { Patcher } from "@Api";
import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";

import StickerModule from "@Patch/StickerModule";
import { isLottieSticker, isAnimatedSticker } from "../Utils";

export default () => {
	const { module, key } = StickerModule;
	if (!module || !key) return Logger.patch("GetStickerById");
	Patcher.after(module, key, (_, args, returnValue) => {
		const { size, sticker } = returnValue.props.children[0].props;
		if (size === 96) {
			if (Settings.state.shouldHighlightAnimated && !isLottieSticker(sticker) && isAnimatedSticker(sticker)) {
				returnValue.props.children[0].props.className += " animatedSticker";
			}
		}
	});
};
