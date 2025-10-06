import { React } from "@Api";
import { getModule, Filters } from "@Webpack";
import FormSwitch from "@Modules/FormSwitch";

export default getModule(Filters.byStrings('"data-toggleable-component":"switch"', 'layout:"horizontal"'), { searchExports: true }) ||
	function SwitchComponentFallback(props) {
		return (
			<div style={{ color: "#fff" }}>
				{props.children}
				<input
					type="checkbox"
					checked={props.value}
					onChange={e => props.onChange(e.target.checked)}></input>
			</div>
		);
	};
