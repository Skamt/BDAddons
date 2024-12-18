import { React } from "@Api";
import { nop } from "@Utils";
import Settings from "@Utils/Settings";
import Switch from "@Components/Switch";

export default function SettingSwtich({ settingKey, note, onChange = nop, hideBorder = false, description, ...rest }) {
	const [val, set] = Settings.useSetting(settingKey);
	return (
		<Switch
			{...rest}
			value={val}
			note={note}
			hideBorder={hideBorder}
			onChange={e => {
				set(e);
				onChange(e);
			}}>
			{description || settingKey}
		</Switch>
	);
}
