import { React, Patcher } from "@Api";
import { Filters, getModule } from "@Webpack";
import Logger from "@Utils/Logger";
import { getNestedProp, copy } from "@Utils";

import Toast from "@Utils/Toast";
import Button from "@Components/Button";

const MessageDecorations = getModule(Filters.byProps("MessagePopoutContent"));
const AssetURLUtils = getModule(Filters.byProps("getEmojiURL"));

export default () => {
	if (MessageDecorations && MessageDecorations.MessagePopoutContent)
		Patcher.after(MessageDecorations, "MessagePopoutContent", (_, __, ret) => {
			const { emojiId:id } = getNestedProp(ret, "props.children.0.props.children.0.props.children.0.props") || {};
			if (!id) return ret;

			const children = getNestedProp(ret, "props.children.0.props.children");

			if (!children) return ret;
			children.push(
				<Button
					size={Button.Sizes.SMALL}
					color={Button.Colors.GREEN}
					onClick={() => {
						const  url = AssetURLUtils.getEmojiURL({id});
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
