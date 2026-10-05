import React from "@React";
import SettingSwtich from "@Components/SettingSwtich";
import FieldSet from "@Components/FieldSet";
import Plugin from "@common/Plugin";
import Settings from "@Settings";

function SettingComponent() {
	return (
		<FieldSet contentGap={8}>
			{[
				{	
					border:true,
					setting: Settings.showOnHover,
					note: "By default hide ViewProfilePicture button and show on hover.",
					description: "Show on hover",
				},

				{
					setting: Settings.bannerColor,
					note: "Always include banner color in carousel, even if a banner is present.",
					description: "Include banner color.",
				},
			].map(SettingSwtich)}
		</FieldSet>
	);
}

Plugin.getSettingsPanel = () => <SettingComponent />;
