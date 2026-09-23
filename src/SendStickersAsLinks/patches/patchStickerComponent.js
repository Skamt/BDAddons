import { after } from "@common/Patcher";
import Settings from "@Utils/Settings";
import StickerModule from "@Patch/StickerModule";
import { isLottieSticker, isAnimatedSticker } from "../Utils";
import Plugin from "@common/Plugin";

Plugin.onStart(() =>
	after(...StickerModule, ({ ret }) => {
		const { size, sticker } = ret.props.children[0].props;
		if (size === 96) {
			if (Settings.state.shouldHighlightAnimated && !isLottieSticker(sticker) && isAnimatedSticker(sticker)) {
				ret.props.children[0].props.className += " animatedSticker";
			}
		}
	})
);
