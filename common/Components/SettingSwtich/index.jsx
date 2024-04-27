import { React } from "@Api";
import Settings from "@Utils/Settings";
import Switch from "@Components/Switch";

export default function SettingSwtich({ settingKey, note, hideBorder = false, description }) {
	const [val, set] = Settings.useSetting(settingKey);
	return (
		<Switch
			value={val}
			note={note}
			hideBorder={hideBorder}
			onChange={set}>
			{description || settingKey}
		</Switch>
	);
}