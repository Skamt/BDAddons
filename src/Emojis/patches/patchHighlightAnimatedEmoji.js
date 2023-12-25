import { React, Patcher } from "@Api";
import { Filters, getModuleAndKey } from "@Webpack";
import Logger from "@Utils/Logger";
import { getNestedProp, copy } from "@Utils";
import Settings from "@Utils/Settings";

const EmojiComponent = getModuleAndKey(Filters.byStrings("getDisambiguatedEmojiContext", "isFavoriteEmojiWithoutFetchingLatest", "allowAnimatedEmoji"));

export default () => {
	const { module, key } = EmojiComponent;
	if (module && key)
		Patcher.after(module, key, (_, [{ descriptor }], ret) => {
			if (descriptor.emoji.animated && Settings.get("shouldHihglightAnimatedEmojis")) ret.props.className += " animated";
		});
	else Logger.patch("HighlightAnimatedEmoji");
};