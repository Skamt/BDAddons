import { React } from "@Api";
import { copy, showToast } from "@Utils";

export default ({ color }) => (
	<div
		className="VPP-NoBanner"
		style={{ backgroundColor: color }}>
		<a
			className="copyColorBtn"
			onClick={() => {
				copy(color);
				showToast(`${color} Copied!`, "success");
			}}>
			Copy Color
		</a>
	</div>
);