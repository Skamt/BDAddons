import { React } from "@Api";
import Switch from "@Components/Switch";
import Settings from "@Utils/Settings";

function ShowOnHover() {
	const [val, set] = Settings.useSetting("showOnHover");
	return (
		<Switch
			value={val}
			note="By default hide ViewProfilePicture button and show on hover."
			hideBorder={false}
			onChange={set}>
			Show on hover
		</Switch>
	);
}

function IncludeBannerColor() {
	const [val, set] = Settings.useSetting("bannerColor");
	
	return (
		<Switch
			value={val}
			note="Always include banner color in carousel, even if a banner is present."
			hideBorder={true}
			onChange={set}>
			Include banner color
		</Switch>
	);
}

// eslint-disable-next-line react/jsx-key
export default () => [<ShowOnHover />, <IncludeBannerColor />];
