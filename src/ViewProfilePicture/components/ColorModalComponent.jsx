import Color from "@Modules/Color";
import React from "@React";
import AccessibilityStore from "@Stores/AccessibilityStore";
import ThemeStore from "@Stores/ThemeStore";
import { copy } from "@Utils";
import Toast from "@Utils/Toast";
import { Filters, getModule, getModuleAndKey } from "@Webpack";

const DesignSystem = getModule(a => a?.unsafe_rawColors?.PRIMARY_800?.resolve);

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

function SimpleColorModal({ color }) {
	return (
		<div
			onClick={e => e.stopPropagation()}
			className="VPP-NoBanner"
			style={{ backgroundColor: Color(color).css() }}>
			<div className="VPP-copy-color-container">
				<span className="VPP-copy-color-label">Copy Color:</span>
				{["hex", false, "rgba", false, "hsla"].map(name =>
					name ? (
						<a
							className="VPP-copy-color"
							onClick={e => {
								e.stopPropagation();
								copyColor(name, color);
							}}>
							{name}
						</a>
					) : (
						<span className="VPP-separator">|</span>
					)
				)}
			</div>
		</div>
	);
}

const {
	module: { ZP: palletHook }
} = getModuleAndKey(Filters.byStrings("toHexString", "toHsl", "palette"), { searchExports: true }) || {};

function ColorModal({ displayProfile, user }) {
	const color = palletHook(user.getAvatarURL(displayProfile.guildId, 80));

	return <SimpleColorModal color={color || resolveColor()} />;
}

export default {
	SimpleColorModal,
	ColorModal
};
