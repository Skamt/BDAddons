import "./styles";
import "./patches/*";
import Plugin from "@common/Plugin";
import React from "@React";
import FieldSet from "@Components/FieldSet";
import SettingSwtich from "@Components/SettingSwtich";
import Settings from "@Settings";

Plugin.getSettingsPanel = () => () => (
	<FieldSet contentGap={8}>
		{[
			{
				description: "Organizes Settings contextmenu",
				setting: Settings.organizeMenu
			},
			{
				description: "Disable the crossfade animation",
				setting: Settings.disableFade
			}
		].map(SettingSwtich)}
	</FieldSet>
);

module.exports = () => Plugin;
