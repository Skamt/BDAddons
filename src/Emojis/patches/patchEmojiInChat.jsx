import { after } from "@common/Patcher";
import { getMangled } from "@Webpack";
import React from "@React";
import Plugin from "@common/Plugin";
import { ContextMenu } from "@Api";
import EmojisManager from "@/EmojisManager";

const EmojiComponentModule = getMangled("Unknown Src for Emoji", { Emoji: () => true });

Plugin.onStart(async () => {
	after(EmojiComponentModule, "Emoji", ({ args: [props], ret }) => {
		if (props.src) return ret;
		ret.props.onContextMenu = (e) => {
			const Menu = ContextMenu.buildMenu([
				{
					label: "Save",
					action: () => {
						EmojisManager.add({
							animated: props.animated,
							name: (props.emojiName || props["aria-describedby"]).replace(/:/g, ""),
							id: props.emojiId,
						});
						EmojisManager.commit();
					},
				},
			]);
			ContextMenu.open(e, (props) => <Menu {...props} />, {
				position: "bottom",
				align: "left",
			});
		};
	});
});
