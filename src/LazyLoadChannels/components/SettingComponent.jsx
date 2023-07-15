import { React } from "@Api";
import Switch from "@Components/Switch";
import Settings from "@Utils/Settings";

export default () => {
	return [
		{
			hideBorder:false,
			description: "Auto load indicator.",
			note: "Whether or not to show an indicator for channels set to auto load",
			value: Settings.get("autoloadedChannelIndicator"),
			onChange: e => Settings.set("autoloadedChannelIndicator", e)
		},
		{
			hideBorder:true,
			description: "Lazy load DMs.",
			note: "Whether or not to consider DMs for lazy loading",
			value: Settings.get("lazyLoadDMs"),
			onChange: e => Settings.set("lazyLoadDMs", e)
		}
	].map(Toggle);
};

function Toggle(props) {
	const [enabled, setEnabled] = React.useState(props.value);
	return (
		<Switch
			value={enabled}
			note={props.note}
			hideBorder={props.hideBorder}
			onChange={e => {
				props.onChange(e);
				setEnabled(e);
			}}>
			{props.description}
		</Switch>
	);
}
