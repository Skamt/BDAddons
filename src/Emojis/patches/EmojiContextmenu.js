import { getInternalInstance, ContextMenu } from "@Api";
import Plugin from "@common/Plugin";
import { sendEmojiDirectly, insertEmoji } from "../Utils";

Plugin.onStart(() => {
	const unpatch = [
		ContextMenu.patch("expression-picker", (retVal, props) => {
			const iProps = getInternalInstance(props.target)?.pendingProps;
			const id = iProps?.["data-type"] === "emoji" && iProps["data-id"];
			if(!id) return;
			
			const MenuItems = [
				ContextMenu.buildItem({
					label: "Send directly",
					action: () => sendEmojiDirectly(id)
				}),
				ContextMenu.buildItem({
					label: "Insert url",
					action: () => insertEmoji(id)
				})
			];

			if (Array.isArray(retVal.props.children)) retVal.props.children.unshift(MenuItems);
				else retVal.props.children = [MenuItems, retVal.props.children];
		})
	];

	Plugin.once(Events.STOP, () => {
		unpatch.forEach(a => a && typeof a === "function" && a());
	});
});
