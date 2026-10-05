import React from "@React";
import FieldSet from "@Components/FieldSet";
import SettingSlider from "@Components/SettingSlider";
import Settings from "@Settings";

const emojiSizes = [48, 56, 60, 64, 80, 96, 100, 128, 160, 240, 256, 300];
const emojiRenderSizes = [50, 75, 100, 125, 150, 175, 200, 225, 250];

export default () => {
	return (
		<FieldSet contentGap={8}>
			<SettingSlider
				setting={Settings.emojiSize}
				label="Emoji Size"
				description="The size of the Emoji in pixels"
				stickToMarkers={true}
				sortedMarkers={true}
				equidistant={true}
				markers={emojiSizes}
				minValue={emojiSizes[0]}
				maxValue={emojiSizes[emojiSizes.length - 1]}
				onValueRender={Math.round}
			/>
			<SettingSlider
				setting={Settings.emojiRenderSize}
				label="Saved Emoji Size"
				markers={emojiRenderSizes}
				minValue={emojiRenderSizes[0]}
				maxValue={emojiRenderSizes[emojiRenderSizes.length - 1]}
				onValueRender={Math.round}
			/>
		</FieldSet>
	);
};
