import { insertChild } from "@React";
import { getInternalInstance } from "@Api";
import Plugin from "@common/Plugin";
import ContextMenu, { patch } from "@common/Patcher/contextmenu";
import { getCopyContextMenuItem, getContextMenuItem } from "../Utils";
import EmojiStore from "@Stores/EmojiStore";

import EmojisManager from "@/EmojisManager";
Plugin.onStart(() => {
	patch("expression-picker", (ret, props) => {
		const iProps = getInternalInstance(props.target)?.pendingProps;
		const id = iProps?.["data-type"] === "emoji" && iProps["data-id"];
		if (!id) return;
		const emoji = EmojiStore.getCustomEmojiById(id);
		insertChild(
			ret,
			[
				getContextMenuItem("send", id, emoji.animated),
				getContextMenuItem("insert", id, emoji.animated),
				getCopyContextMenuItem(id, emoji.name),
				{ type: "separator" },
				{
					label: "Save",
					action: () => {
						EmojisManager.add({
							animated: emoji.animated,
							name: (emoji.name || emoji["aria-describedby"]).replace(/:/g, ""),
							id
						});
						EmojisManager.commit();
					}
				}
			].map(ContextMenu.buildItem.bind(ContextMenu)),
			0
		);
	});
});
