import { React } from "@Api";
import { nop } from "@Utils";
import Settings from "@Utils/Settings";
import Switch from "@Components/Switch";
import Divider from "@Components/Divider";
export default function SettingSwtich({ settingKey, note, border = false, onChange = nop, description, ...rest }) {
	const [val, set] = Settings.useSetting(settingKey);
	return (
		<>
			<Switch
				{...rest}
				checked={val}
				label={description || settingKey}
				description={note}
				onChange={e => {
					set(e);
					onChange(e);
				}}
			/>
			{border && <Divider gap={15} />}
		</>
	);
}
