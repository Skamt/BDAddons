import EmojiStore from "@Stores/EmojiStore";
import ErrorBoundary from "@Components/ErrorBoundary";
import Plugin from "@common/Plugin";
import { after } from "@common/Patcher";
import Settings from "@Settings";

const DisambiguatedEmojiContexPrototype = EmojiStore.getDisambiguatedEmojiContext()?.constructor.prototype;

Plugin.onStart(() => {
	after(DisambiguatedEmojiContexPrototype, "getFrequentlyUsedReactionEmojisWithoutFetchingLatest", ({ ret }) => {
		ret.filter = function() {
			const filtered = Array.prototype.filter.apply(this, arguments);
			filtered.slice = () => Array.prototype.slice.call(filtered, 0, Settings.state.quickReactsAmount);
			return filtered;
		};
		return ret;
	});
});