import config from "@Config";
import React from "@React";
import Settings from "@Utils/Settings";
import Slider from "@Modules/Slider";

export default function SettingSlider({ settingKey, label, description, ...props }) {
	const [val, set] = Settings.useSetting(settingKey);

	return (
		<Slider
			{...props}
			mini={true}
			label={label}
			description={description}
			initialValue={val}
			onValueChange={e => set(Math.round(e))}
		/>
	);
}
