import "./styles";
import "./patches/*";
import React from "@React";
import Plugin from "@common/Plugin";
import Settings from "@Settings";
import SettingSwtich from "@Components/SettingSwtich";
import SettingSlider from "@Components/SettingSlider";
import FieldSet from "@Components/FieldSet";
const sizes = [...Array(13)].map((a, i) => i + 3);

Plugin.getSettingsPanel = () => () => {
	return (
		<FieldSet>
			<SettingSwtich
				setting={Settings.showAll}
				border={true}
				label="Show all buttons"
				description="always show all buttons in message popover (without holding shift)"
			/>
			<SettingSlider
				setting={Settings.quickReactsAmount}
				label="Amount of Quick Reacts"
				description="Switching channels may be required to see changes."
				stickToMarkers={true}
				sortedMarkers={true}
				equidistant={true}
				markers={sizes}
				minValue={sizes[0]}
				maxValue={sizes[sizes.length - 1]}
				onValueRender={Math.round}
			/>
		</FieldSet>
	);
};

module.exports = () => Plugin;
