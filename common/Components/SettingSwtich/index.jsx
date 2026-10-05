import React from "@React";
import Settings from "@Settings";
import Switch from "@Components/Switch";
import Divider from "@Components/Divider";

export default function SettingSwtich({ setting, note, border = false, description, ...rest }) {
	const val = Settings(setting.get);
	return (
		<>
			<Switch
				{...rest}
				hasIcon={true}
				checked={val}
				label={description || setting.key}
				description={note}
				onChange={setting.set}
			/>
			{border && <Divider gap={15} />}
		</>
	);
}
