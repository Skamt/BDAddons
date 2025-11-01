import React from "@React";
import SettingSwtich from "@Components/SettingSwtich";
import Settings from "@Utils/Settings";

// eslint-disable-next-line react/jsx-key
export default function SettingComponent() {
	return [
		{
			settingKey: "previewDefaultState",
			description: "Preview open by default.",
			onChange() {
				Settings.setpreviewState(Settings.state.previewDefaultState);
			}
		}
	].map(SettingSwtich);
}
