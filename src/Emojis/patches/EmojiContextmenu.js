import { insertChild } from "@React";
import { getInternalInstance } from "@Api";
import Plugin from "@common/Plugin";
import ContextMenu, { patch } from "@common/Patcher/contextmenu";
import { sendEmojiDirectly, insertEmoji } from "../Utils";

Plugin.onStart(() => {
	patch("expression-picker", (ret, props) => {
		const iProps = getInternalInstance(props.target)?.pendingProps;
		const id = iProps?.["data-type"] === "emoji" && iProps["data-id"];
		if (!id) return;

		const MenuItems = [
			ContextMenu.buildItem({
				label: "Send directly",
				action: () => sendEmojiDirectly(id),
			}),
			ContextMenu.buildItem({
				label: "Insert url",
				action: () => insertEmoji(id),
			}),
		];

		insertChild(ret, MenuItems, 0);
	});
});
