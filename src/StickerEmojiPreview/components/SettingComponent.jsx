import React from "@React";
import SettingSwtich from "@Components/SettingSwtich";
import Settings from "@Settings";

Settings.subscribe(Settings.previewDefaultState.get, Settings.previewState.set);

export default function SettingComponent() {
	return [
		{
			setting: Settings.previewDefaultState,
			label: "Preview open by default."
		}
	].map(SettingSwtich);
}
