import { React } from "@Api";
import { getMangled, Filters } from "@Webpack";
import FormSwitch from "@Modules/FormSwitch";

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
