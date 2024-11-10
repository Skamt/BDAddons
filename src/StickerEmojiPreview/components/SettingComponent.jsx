import SettingSwtich from "@Components/SettingSwtich";
import Settings from "@Utils/Settings";
// eslint-disable-next-line react/jsx-key
export default () =>
	[
		{
			settingKey: "previewDefaultState",
			description: "Preview open by default.",
			onChange(){
				Settings.state.setpreviewState(Settings.state.previewDefaultState);
			}
		}
	].map(SettingSwtich);

// getSettingsPanel() {
// 		return (
// 			<SettingComponent
// 				description="Preview open by default."
// 				value={Settings.get("previewDefaultState")}
// 				onChange={e =>
// 					Settings.setMultiple({
// 						previewDefaultState: e,
// 						previewState: e
// 					})
// 				}
// 			/>
// 		);
// 	}
