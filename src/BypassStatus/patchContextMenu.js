import { ContextMenu } from "@Api";
import patch from "@common/Patcher/contextmenu";
import Settings from "@Utils/Settings";
import {isSelf} from "@Utils/User";

export default () => {
	const ids = ["user", "guild", "channel"];

	for (let i = 0; i < ids.length; i++) {
		const id = ids[i];
		patch(`${id}-context`, ret => ret.props.children.splice(-1, 0, ContextMenu.buildItem({ type: "separator" })));
		patch(`${id}-context`, (ret, props) => {
			const type = props[id];
			if (!type) return;

			const enabled = Settings.state[`${id}s`].split(", ").includes(type.id);
			if (id === "user" && isSelf(type)) return;
			ret.props.children.splice(
				-1,
				0,
				ContextMenu.buildItem({
					id: `status-${id}-bypass`,
					type: "toggle",
					label: `${enabled ? "Remove" : "Add"} Status Bypass`,
					active: enabled,

					action: () => {
						let bypasses = Settings.state[`${id}s`].split(", ");
						if (enabled) bypasses = bypasses.filter(id => id !== type.id);
						else bypasses.push(type.id);
						Settings[`set${id}s`](bypasses.filter(id => id.trim() !== "").join(", "));
					}
				})
			);
		});
	}
};
