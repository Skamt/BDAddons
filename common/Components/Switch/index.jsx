import React from "@React";
import { getBySource, Filters } from "@Webpack";
import { getInObject } from "@Utils/object";

export default getInObject(getBySource("checked", "interactiveLabel","switchIconsEnabled"), Filters.byStrings("switchIconsEnabled"))||
	function SwitchComponentFallback(props) {
		return (
			<div style={{ color: "#fff" }}>
				{props.label}
				<input
					type="checkbox"
					checked={props.checked}
					onChange={(e) => props.onChange(e.target.checked)}
				/>
			</div>
		);
	};
