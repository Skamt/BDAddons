import { Patcher } from "@Api";
import { Filters, getModuleAndKey } from "@Webpack";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";

const EmojiComponent = getModuleAndKey(Filters.byStrings("getDisambiguatedEmojiContext", "isFavoriteEmojiWithoutFetchingLatest", "allowAnimatedEmoji"));

export default () => {
	const { module, key } = EmojiComponent;
	if (!module || !key) return Logger.patchError("HighlightAnimatedEmoji");
	Patcher.after(module, key, (_, [{ descriptor }], ret) => {
		if (descriptor.emoji.animated && Settings.state.shouldHihglightAnimatedEmojis) 
			ret.props.className += " animated";
	});
};
