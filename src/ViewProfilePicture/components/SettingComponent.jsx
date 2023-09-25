import { React } from "@Api";
import Switch from "@Components/Switch";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import Heading from "@Modules/Heading";
import Settings from "@Utils/Settings";

function ShowOnHoverSwitch() {
	const [enabled, setEnabled] = React.useState(Settings.get("showOnHover"));
	return (
		<Switch
			value={enabled}
			note="By default hide ViewProfilePicture button and show on hover."
			hideBorder={true}
			onChange={e => {
				Settings.set("showOnHover", e);
				setEnabled(e);
			}}>
			Show on hover
		</Switch>
	);
}

export default () => <ShowOnHoverSwitch />;
