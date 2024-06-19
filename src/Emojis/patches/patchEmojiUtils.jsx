import { React, Data, Patcher } from "@Api";
import { Filters, filterModuleAndExport, getModule } from "@Webpack";
import Logger from "@Utils/Logger";
import { getNestedProp, copy } from "@Utils";

import Toast from "@Utils/Toast";
import Button from "@Components/Button";

// const MessageDecorations = getModule(Filters.byProps("MessagePopoutContent"));
const MessageDecorations = filterModuleAndExport(Filters.byProps("OLD_MESSAGES"), Filters.byStrings(".popoutContainer"), { searchExports: true });
const AssetURLUtils = getModule(Filters.byProps("getEmojiURL"));

export default () => {
	const { module, key } = MessageDecorations;
	if (!module || !key) return Logger.patch("patchEmojiUtils");
	Patcher.after(module, key, (_, __, ret) => {
		const { animated, emojiName, guildId = "", emojiId: id } = getNestedProp(ret, "props.children.0.props.children.0.props.children.0.props") || {};
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
							emojis.unshift({
								animated,
								id,
								guildId,
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
};
