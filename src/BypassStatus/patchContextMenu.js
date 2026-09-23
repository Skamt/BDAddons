import { loop } from "@Utils/Array";
import ContextMenu, { patch } from "@common/Patcher/contextmenu";
import Settings from "@Utils/Settings";
import { isSelf } from "@Utils/User";

export default () => {
	const ids = ["user", "guild", "channel"];

	loop(ids, id => patch(`${id}-context`, ret => ret.props.children.splice(-1, 0, ContextMenu.buildItem({ type: "separator" }))));
	loop(ids, id =>
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
		})
	);
};
