import Blacklist from "@/blacklist";
import Plugin from "@common/Plugin";
import ContextMenu, { patch } from "@common/Patcher/contextmenu";
Plugin.onStart(() => {
	patch("user-context", (retVal, { user }) => {
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
	});
});
