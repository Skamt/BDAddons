import { React } from "@Api";
import { copy } from "@Utils";
import Toast from "@Utils/Toast";

export default ({ color }) => (
	<div
		className="VPP-NoBanner"
		style={{ backgroundColor: color }}>
		<a
			className="copyColorBtn"
			onClick={() => {
				copy(color);
				Toast.success(`${color} Copied!`);
			}}>
			Copy Color
		</a>
	</div>
);