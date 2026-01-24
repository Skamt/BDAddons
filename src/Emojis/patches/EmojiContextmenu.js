import { getInternalInstance, ContextMenu } from "@Api";
import Plugin, { Events } from "@Utils/Plugin";
import { sendEmojiDirectly, insertEmoji } from "../Utils";

Plugin.on(Events.START, () => {
	const unpatch = [
		ContextMenu.patch("expression-picker", (retVal, props) => {
			const id = getInternalInstance(props.target)?.pendingProps?.["data-id"];
			if(!id) return;
			console.log(id);
			
			retVal.props.children.splice(1, 0, [
				ContextMenu.buildItem({
					label: "Send directly",
					action: () => sendEmojiDirectly(id)
				}),
				ContextMenu.buildItem({
					label: "Insert url",
					action: () => insertEmoji(id)
				})
			]);
		})
	];

	Plugin.once(Events.STOP, () => {
		unpatch.forEach(a => a && typeof a === "function" && a());
	});
});
