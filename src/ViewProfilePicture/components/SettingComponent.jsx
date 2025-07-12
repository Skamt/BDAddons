import SettingSwtich from "@Components/SettingSwtich";

export default function SettingComponent() {
	return [
		{
			settingKey: "showOnHover",
			note: "By default hide ViewProfilePicture button and show on hover.",
			description: "Show on hover"
		},

		{
			settingKey: "bannerColor",
			note: "Always include banner color in carousel, even if a banner is present.",
			description: "Include banner color."
		}
	].map(SettingSwtich);
}
