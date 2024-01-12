import { React } from "@Api";
import Switch from "@Components/Switch";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import Settings from "@Utils/Settings";

function useSetting(setting) {
	return {
		get: React.useCallback(() => Settings.get(setting), []),
		set: React.useCallback(e => Settings.set(setting, e), [])
	};
}

function ShowOnHover() {
	const { get, set } = useSetting("showOnHover");
	const [enabled, setEnabled] = React.useState(get());

	return (
		<Switch
			value={enabled}
			note="By default hide ViewProfilePicture button and show on hover."
			hideBorder={false}
			onChange={e => {
				set(e);
				setEnabled(e);
			}}>
			Show on hover
		</Switch>
	);
}

function IncludeBannerColor() {
	const { get, set } = useSetting("bannerColor");
	const [enabled, setEnabled] = React.useState(get());
	return (
		<Switch
			value={enabled}
			note="Always include banner color in carousel, even if a banner is present."
			hideBorder={true}
			onChange={e => {
				set( e);
				setEnabled(e);
			}}>
			Include banner color
		</Switch>
	);
}

export default () => [<ShowOnHover />, <IncludeBannerColor />];
