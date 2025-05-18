/* eslint-disable react/jsx-key */
import React from "@React";
import Gap from "@Components/Gap";
import Settings from "@Utils/Settings";
import Heading from "@Modules/Heading";
import Slider from "@Modules/Slider";

function SettingSlider({ settingKey, label, className, defaultValue, stickToMarkers, equidistant, sortedMarkers, markers, minValue, maxValue }) {
	const [val, set] = Settings.useSetting(settingKey);
	return (
		<>
			<Heading
				style={{ marginBottom: 20 }}
				tag="h2">
				{label}
			</Heading>
			<Slider
				className={className}
				stickToMarkers={stickToMarkers}
				sortedMarkers={sortedMarkers}
				equidistant={equidistant}
				defaultValue={defaultValue}
				markers={markers}
				minValue={minValue || markers[0]}
				maxValue={maxValue || markers[markers.length - 1]}
				initialValue={val}
				onValueChange={set}
			/>
		</>
	);
}

const sizes = [16, 20, 24, 32, 40, 48, 56, 80];

export default () => {
	return [
		
		// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
		<SettingSlider
			settingKey="size"
			label="UI size"
			markers={sizes}
			defaultValue={20}
			stickToMarkers={true}
			sortedMarkers={true}
			equidistant={true}
		/>
	];
};
