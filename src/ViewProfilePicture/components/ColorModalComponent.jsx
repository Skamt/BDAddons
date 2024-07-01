import { React } from "@Api";
import { copy } from "@Utils";
import Toast from "@Utils/Toast";
import Color from "@Modules/Color";
import ThemeStore from "@Stores/ThemeStore";
import AccessibilityStore from "@Stores/AccessibilityStore";
import { getModuleAndKey, getModule, Filters } from "@Webpack";
const DesignSystem = getModule(a => a?.unsafe_rawColors?.PRIMARY_800);

function resolveColor() {
	if (!DesignSystem?.unsafe_rawColors?.PRIMARY_800) return "#111214";
	return DesignSystem.unsafe_rawColors?.PRIMARY_800.resolve({
		theme: ThemeStore.theme,
		saturation: AccessibilityStore.saturation
	}).hex();
}

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

const {
	module: { ZP: palletHook }
} = getModuleAndKey(Filters.byStrings("palette", "getState", "&&await"), { searchExports: true }) || {};

function SimpleColorModal({ color }) {
	return (
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
}

function ColorModal({ displayProfile, user }) {
	const color = palletHook(user.getAvatarURL(displayProfile.guildId, 80));

	return <SimpleColorModal color={color || resolveColor()} />;
}

export default {
	SimpleColorModal,
	ColorModal
};
