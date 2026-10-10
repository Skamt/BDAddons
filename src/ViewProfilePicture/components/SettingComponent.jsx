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
					description: "By default hide ViewProfilePicture button and show on hover.",
					label: "Show on hover",
				},

				{
					setting: Settings.bannerColor,
					description: "Always include banner color in carousel, even if a banner is present.",
					label: "Include banner color.",
				},
			].map(SettingSwtich)}
		</FieldSet>
	);
}

Plugin.getSettingsPanel = () => <SettingComponent />;
