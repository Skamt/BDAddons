import "./patches/*";
import Plugin from "@common/Plugin";
import Settings from "@Settings";
// import SettingSwtich from "@Components/SettingSwtich";
import SettingSlider from "@Components/SettingSlider";

const sizes = [0, 5, 10, 15, 20];

Plugin.getSettingsPanel = () => () => {
	return (
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
	);
};

module.exports = () => Plugin;
