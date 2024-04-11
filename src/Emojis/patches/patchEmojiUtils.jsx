import { React, Data, Patcher } from "@Api";
import { Filters, getModule } from "@Webpack";
import Logger from "@Utils/Logger";
import { getNestedProp, copy } from "@Utils";

import Toast from "@Utils/Toast";
import Button from "@Components/Button";

const MessageDecorations = getModule(Filters.byProps("MessagePopoutContent"));
const AssetURLUtils = getModule(Filters.byProps("getEmojiURL"));

export default () => {
	if (MessageDecorations?.MessagePopoutContent)
		Patcher.after(MessageDecorations, "MessagePopoutContent", (_, __, ret) => {
			const { animated, emojiName, emojiId: id } = getNestedProp(ret, "props.children.0.props.children.0.props.children.0.props") || {};
			if (!id) return ret;

			const children = getNestedProp(ret, "props.children.0.props.children");

			if (!children) return ret;
			children.push(
				<div className="emojiControls">
					<Button
						size={Button.Sizes.SMALL}
						color={Button.Colors.GREEN}
						onClick={() => {
							const url = AssetURLUtils.getEmojiURL({ id });
							if (!url) return Toast.error("no url found");
							copy(url);
							Toast.success("Copid");
						}}>
						{"Copy url"}
					</Button>

					<Button
						size={Button.Sizes.SMALL}
						color={Button.Colors.GREEN}
						onClick={() => {
							try {
								const emojis = Data.load("emojis") || [];
								emojis.push({
									animated,
									id,
									name: emojiName.replace(/:/gi, ""),
									allNamesString: emojiName,
									available: true,
									managed: false,
									require_colons: true,
									url: `https://cdn.discordapp.com/emojis/${id}.webp?size=4096&quality=lossless`,
									type: "GUILD_EMOJI"
								});
								Data.save("emojis", emojis);
								Toast.success("Saved.");
							} catch {
								Toast.error("Could not save.");
							}
						}}>
						{"Save"}
					</Button>
				</div>
			);
		});
	else Logger.patch("EmojiUtils");
};
