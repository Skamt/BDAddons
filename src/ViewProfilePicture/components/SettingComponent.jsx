import { React } from "@Api";
import Switch from "@Components/Switch";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import Settings from "@Utils/Settings";


function ShowOnHover() {
	const [enabled, setEnabled] = React.useState(Settings.get("showOnHover"));
	return (
		<Switch
			value={enabled}
			note="By default hide ViewProfilePicture button and show on hover."
			hideBorder={false}
			onChange={e => {
				Settings.set("showOnHover", e);
				setEnabled(e);
			}}>
			Show on hover
		</Switch>
	);
}


function IncludeBannerColor() {
	const [enabled, setEnabled] = React.useState(Settings.get("showOnHover"));
	return (
		<Switch
			value={enabled}
			note="Always include banner color even if banner is present"
			hideBorder={true}
			onChange={e => {
				Settings.set("bannerColor", e);
				setEnabled(e);
			}}>
			Include banner color if present
		</Switch>
	);
}

export default () => [<ShowOnHover />,<IncludeBannerColor />];
