/* eslint-disable react/jsx-key */
import React from "@React";
import Gap from "@Components/Gap";
import Settings from "@Utils/Settings";
import Heading from "@Modules/Heading";
import Slider from "@Modules/Slider";

import Collapsible from "@Components/Collapsible";

import SettingSwtich from "@Components/SettingSwtich";
import RadioGroup from "@Modules/RadioGroup";

function SettingSlider({ settingKey, label, className, note, defaultValue, stickToMarkers, equidistant, sortedMarkers, markers, minValue, maxValue }) {
	const [val, set] = Settings.useSetting(settingKey);
	return (
		<>
			<BdApi.Components.Text
				strong={true}
				size={BdApi.Components.Text.Sizes.SIZE_16}
				style={{ marginBottom: 8 }}>
				{label}
			</BdApi.Components.Text>
			<BdApi.Components.Text
				size={BdApi.Components.Text.Sizes.SIZE_14}
				style={{ marginBottom: 8 }}>
				{note}
			</BdApi.Components.Text>
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
		<Collapsible title="Show/Hide">
			{[
				{
					settingKey: "showTabDivider",
					description: "Show dividers between tabs",
					hideBorder: false
				},
				{
					settingKey: "showSettingsButton",
					description: "Show a quick settings button next to tabs",
					hideBorder: false
				},
				{
					settingKey: "showTabbar",
					description: "Show/hide Tabs bar",
					hideBorder: false
				},
				{
					settingKey: "showBookmarkbar",
					description: "Show/hide Bookmarks bar",
					hideBorder: false
				},
				{
					settingKey: "showUnreads",
					description: "Show/hide unread messages indicator",
					note: "DM unreads always show as red badges",
					hideBorder: false
				},
				{
					settingKey: "showPings",
					description: "Show/hide pings indicator",
					hideBorder: true
				}
			].map(SettingSwtich)}
		</Collapsible>,
<Gap
			className="divider-h"
			direction={Gap.direction.HORIZONTAL}
			gap={40}
		/>,
		// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
		<SettingSlider
			settingKey="tabDividerSize"
			label="Tabs divider size"
			note="Space between tabs, selected value is doubled"
			markers={[5, 100]}
			minValue={5}
			maxValue={100}
			stickToMarkers={false}
			sortedMarkers={true}
			equidistant={false}
		/>,
		<Gap
			className="divider-h"
			direction={Gap.direction.HORIZONTAL}
			gap={40}
		/>,
		// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
		<SettingSlider
			settingKey="size"
			label="UI density"
			note=""
			markers={sizes}
			stickToMarkers={true}
			sortedMarkers={true}
			equidistant={true}
		/>
	];
};
