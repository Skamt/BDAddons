import { React } from "@Api";
import { copy } from "@Utils";
import Toast from "@Utils/Toast";
import Color from "@Modules/Color";

function copyColor(type, color) {
	let c = color;
	try {
		switch (type) {
			case "hex":
				c = Color(color).hex();
				break;
			case "rgba":
				c = Color(color).css("rgba");
				break;
			case "hsla":
				c = Color(color).css("hsla");
				break;
		}
	} finally {
		copy(c);
		Toast.success(`${c} Copied!`);
	}
}

export default ({ color }) => (
	<div
		className="VPP-NoBanner"
		style={{ backgroundColor: Color(color).css() }}>
		<div className="VPP-copy-color-container">
			<a className="VPP-copy-color-label">Copy Color:</a>
			<a
				className="VPP-copy-color"
				onClick={() => copyColor("hex", color)}>
				hex
			</a>
			<span className="VPP-separator">|</span>
			<a
				className="VPP-copy-color"
				onClick={() => copyColor("rgba", color)}>
				rgba
			</a>
			<span className="VPP-separator">|</span>
			<a
				className="VPP-copy-color"
				onClick={() => copyColor("hsla", color)}>
				hsla
			</a>
		</div>
	</div>
);
