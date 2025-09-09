import React from "@React";
import {clsx} from "@Utils";

const c = clsx("menu-label")
function MenuLabel({ label, icon }) {
	return (
		<div
			className={c("container")}>
			
			<div className={c("icon")}>{icon}</div>
			<div className={c("label")}>{label}</div>
		</div>
	);
}

export function createContextMenuItem(type, id = "", action = nop, label = "Unknown", icon = null, color = "", children) {
	const res = {
		className: `tabbys-${id}-menuitem`,
		type,
		id,
		action,
		items: children,
		label, icon,
	};

	if (color) res.color = color;
	return res;
}
