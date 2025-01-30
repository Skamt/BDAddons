import { React } from "@Api";
import FormSwitch from "@Modules/FormSwitch";

export default FormSwitch ||
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
