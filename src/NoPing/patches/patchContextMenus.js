import Blacklist from "@/blacklist";
import { ContextMenu } from "@Api";
import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	const unpatch = [
		ContextMenu.patch("user-context", (retVal, { user }) => {
			if (!user.id) return;
			retVal.props.children.splice(
				1,
				0,
				ContextMenu.buildItem({
					type: "toggle",
					label: "Never ping",
					active: Blacklist.has(user.id),
					action: () => Blacklist.toggle(user.id)
				})
			);
		})
	];

	Plugin.once(Events.STOP, () => {
		unpatch.forEach(a => a && typeof a === "function" && a());
	});
});
