import React from "@React";
import Settings from "@Settings";
import Switch from "@Components/Switch";
import Divider from "@Components/Divider";

export default function SettingSwtich({ setting, label, border = false, description, ...rest }) {
	const val = Settings(setting.get);
	return (
		<>
			<Switch
				{...rest}
				hasIcon={true}
				checked={val}
				label={label || setting.key}
				description={description}
				onChange={setting.set}
			/>
			{border && <Divider gap={15} />}
		</>
	);
}
