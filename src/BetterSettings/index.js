import "./styles";
import "./patches/*";
import Plugin, { Events } from "@Utils/Plugin";
import React from "@React";
import { Patcher } from "@Api";
import FieldSet from "@Components/FieldSet";
import SettingSwtich from "@Components/SettingSwtich";
import "@/forceLoadSettings";



Plugin.getSettingsPanel = () => () => (
	<FieldSet contentGap={8}>
		{[
			{
				description: "Organizes Settings contextmenu",
				settingKey: "organizeMenu",
			},
			{
				description: "Disable the crossfade animation",
				settingKey: "disableFade",
			},
			{
				description: "Force load settings menu",
				settingKey: "forceLoad",
			},
		].map(SettingSwtich)}
	</FieldSet>
);

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

module.exports = () => Plugin;
