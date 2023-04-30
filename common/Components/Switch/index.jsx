import { React } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";

export default TheBigBoyBundle.FormSwitch ||
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
