import React from "@React";
import Settings from "@Settings";
import Slider from "@Modules/Slider";
import Divider from "@Components/Divider";

export default function SettingSlider({ setting, border, processValue = Math.round, label, description, ...props }) {
	const val = Settings(setting.get);

	return (
		<>
			<Slider
				{...props}
				mini={true}
				label={label}
				description={description}
				initialValue={val}
				onValueChange={e => setting.set(processValue(e))}
			/>
			{border && <Divider />}
		</>
	);
}
