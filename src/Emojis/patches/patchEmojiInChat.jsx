import { Patcher } from "@Api";
import { getNestedProp, promiseHandler, concateClassNames } from "@Utils";
import { getMangled } from "@Webpack";
import React from "@React";
import Logger from "@Utils/Logger";
import Plugin, { Events } from "@Utils/Plugin";
import { ContextMenu } from "@Api";
import EmojisManager from "@/EmojisManager";

const EmojiComponentModule = getMangled("Unknown Src for Emoji", {
	Emoji: (a) => true,
});

Plugin.on(Events.START, async () => {
	Patcher.after(EmojiComponentModule, "Emoji", (_, [props], ret) => {
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
