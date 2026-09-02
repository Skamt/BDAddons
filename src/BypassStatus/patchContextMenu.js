import { ContextMenu } from "@Api";
import Settings from "@Utils/Settings";
import UserStore from "@Stores/UserStore";

export default {
	dispose() {
		this.handlers?.forEach?.((h) => h());
		this.handlers = null;
	},
	init() {
		this.handlers = [
			...["user", "guild", "channel"].map((id) =>
				ContextMenu.patch(`${id}-context`, (retVal) =>
					retVal.props.children.splice(-1, 0, ContextMenu.buildItem({ type: "separator" })),
				),
			),
			...["user", "guild", "channel"].map((id) => {
				return ContextMenu.patch(`${id}-context`, (retVal, props) => {
					const type = props[id];
					if (!type) return;
					const enabled = Settings.state[`${id}s`].split(", ").includes(type.id);
					if (id === "user" && type.id === UserStore.getCurrentUser().id) return;
					retVal.props.children.splice(
						-1,
						0,
						ContextMenu.buildItem({
							id: `status-${id}-bypass`,
							type: "toggle",
							// icon: enabled ? EnabledIcon : DisabledIcon,
							// leadingAccessory: { type: "icon", icon: enabled ? EnabledIcon : DisabledIcon },
							label: `${enabled ? "Remove" : "Add"} Status Bypass`,
							active: enabled,

							action: () => {
								let bypasses = Settings.state[`${id}s`].split(", ");
								if (enabled) bypasses = bypasses.filter((id) => id !== type.id);
								else bypasses.push(type.id);
								Settings[`set${id}s`](bypasses.filter((id) => id.trim() !== "").join(", "));
							},
						}),
					);
				});
			}),
		];
	},
};
