/* eslint-disable react/jsx-key */
import React from "@React";
import Gap from "@Components/Gap";
import Settings from "@Utils/Settings";
// import Heading from "@Modules/Heading";
import Slider from "@Modules/Slider";

import Collapsible from "@Components/Collapsible";

import SettingSwtich from "@Components/SettingSwtich";
// import RadioGroup from "@Modules/RadioGroup";

const Text = BdApi.Components.Text;

function SettingSlider({ settingKey, label, note, ...props }) {
	const [val, set] = Settings.useSetting(settingKey);
	return (
		<>
			<Text
				strong={true}
				size={Text.Sizes.SIZE_16}
				style={{ marginBottom: 8 }}>
				{label}
			</Text>
			{note && (
				<Text
					size={Text.Sizes.SIZE_14}
					style={{ marginBottom: 8 }}>
					{note}
				</Text>
			)}
			<Slider
				onValueRender={Math.round}
				{...props}
				initialValue={val}
				onValueChange={a => set(Math.round(a))}
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
					hideBorder: true,
					style: { marginBottom: 2 }
				},
				{
					settingKey: "showSettingsButton",
					description: "Show a quick settings button next to tabs",
					hideBorder: true,
					style: { marginBottom: 2 }
				},
				{
					settingKey: "showTabbar",
					description: "Show/hide Tabs bar",
					hideBorder: true,
					style: { marginBottom: 2 }
				},
				{
					settingKey: "showBookmarkbar",
					description: "Show/hide Bookmarks bar",
					hideBorder: true,
					style: { marginBottom: 2 }
				},
				{
					settingKey: "showPings",
					description: "Show/hide pings indicator",
					hideBorder: true,
					style: { marginBottom: 2 }
				},
				{
					settingKey: "focusNewTab",
					description: "switch to newly created tabs",
					hideBorder: true,
					style: { marginBottom: 2 }
				},
				{
					settingKey: "showUnreads",
					description: "Show/hide unread messages indicator",
					hideBorder: true,
					style: { marginBottom: 2 }
				},
				{
					settingKey: "showTyping",
					description: "Show/hide typing users indicator",
					hideBorder: true,
					style: { marginBottom: 2 }
				},
				{
					settingKey: "showDMNames",
					description: "Show/hide DM names",
					hideBorder: true,
					style: { marginBottom: 2 }
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
			markers={[...Array(11)].map((_, i) => i)}
			defaultValue={5}
			minValue={0}
			maxValue={10}
			stickToMarkers={true}
			sortedMarkers={true}
			equidistant={true}
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
			markers={sizes}
			defaultValue={20}
			stickToMarkers={true}
			sortedMarkers={true}
			equidistant={true}
		/>
	];
};
