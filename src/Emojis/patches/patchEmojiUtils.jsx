import { React, Patcher } from "@Api";
import { Filters, getModule } from "@Webpack";
import Logger from "@Utils/Logger";
import { getNestedProp, copy } from "@Utils";

import Toast from "@Utils/Toast";
import Button from "@Components/Button";
import EmojiStore from "@Stores/EmojiStore";

const MessageDecorations = getModule(Filters.byProps("MessagePopoutContent"));

export default () => {
	if (MessageDecorations && MessageDecorations.MessagePopoutContent)
		Patcher.after(MessageDecorations, "MessagePopoutContent", (_, __, ret) => {
			const { emojiId } = getNestedProp(ret, "props.children.0.props.children.0.props.children.0.props") || {};
			if (!emojiId) return ret;

			const children = getNestedProp(ret, "props.children.0.props.children");

			if (!children) return ret;
			children.push(
				<Button
					size={Button.Sizes.SMALL}
					color={Button.Colors.GREEN}
					onClick={() => {
						const { url } = EmojiStore.getCustomEmojiById(emojiId) || {};
						if (!url) return Toast.error("no url found");
						copy(url);
						Toast.success("Copid");
					}}>
					{"Copy url"}
				</Button>
			);
		});
	else Logger.patch("EmojiUtils");
};
