import React from "@React";
import { getMangled, Filters } from "@Webpack";

export default getMangled(Filters.bySource("auxiliaryContentPosition", "hasIcon"), {
	Switch: () => true,
})?.Switch ||
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
