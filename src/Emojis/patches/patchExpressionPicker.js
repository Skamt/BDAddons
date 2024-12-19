import { Patcher } from "@Api";
import { Filters, getModule } from "@Webpack";

import Logger from "@Utils/Logger";

import EmojiIntentionEnum from "@Enums/EmojiIntentionEnum";
import { handleUnsendableEmoji, isEmojiSendable } from "../Utils";

const ExpressionPicker = getModule(a => a?.type?.toString().includes("handleDrawerResizeHandleMouseDown"), { searchExports: false });
const d = getModule(Filters.byPrototypeKeys("onResultClick", "onHideAutocomplete"));

export default () => {
	if (ExpressionPicker && ExpressionPicker.type)
		Patcher.before(ExpressionPicker, "type", (_, [props]) => {
			const orig = props.onSelectEmoji;
			props.onSelectEmoji = (...args) => {
				const [emoji] = args;
				const channel = props.channel;
				if (!isEmojiSendable({ emoji, channel, intention: EmojiIntentionEnum.CHAT }))
					handleUnsendableEmoji(emoji, channel);
				else orig.apply(null, args);
			};
		});
	else Logger.patchError("ExpressionPicker");

	// if (!d) return Logger.patchError("dddd-ExpressionPicker");

	// Patcher.instead(d.prototype, "selectResult", (_this, args, orig) => {
	// 	if (_this.state.query.type !== "EMOJIS_AND_STICKERS") return orig.apply(null, args);
	// 	const emoji = _this.state.query.results.emojis[args[0]];
	// 	if (!isEmojiSendable({ emoji, channel: _this.props.channel, intention: EmojiIntentionEnum.CHAT })) {
	// 		_this.state.query.options.insertText("");
	// 		const content = getEmojiUrl(emoji);
	// 		insertText(`[󠇫](${content})`);
	// 		_this.clearQuery();
	// 	} else orig.apply(null, args);
	// });
};
