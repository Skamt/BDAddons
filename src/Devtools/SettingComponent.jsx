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
					setting: Settings.expEnabled,
					label: "Enabled experiments",
				},{	
					setting: Settings.devMode,
					label: "Enabled dev mode",
				}
			].map(SettingSwtich)}
		</FieldSet>
	);
}

Plugin.getSettingsPanel = () => <SettingComponent />;
