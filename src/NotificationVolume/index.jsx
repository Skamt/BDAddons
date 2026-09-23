import React from "@React";
import { Patcher } from "@Api";
import { getModule } from "@Webpack";
import Settings from "@Utils/Settings";
import Slider from "@Modules/Slider";

function SettingComponent() {
	const [val, set] = Settings.useSetting("notificationVolume");
	return (
		<Slider
			label="Notification volume"
			stickToMarkers={false}
			sortedMarkers={true}
			equidistant={true}
			markers={[0, 25, 50, 75, 100]}
			initialValue={val}
			onValueChange={e => set(e)}
		/>
	);
}

const WebAudioSound = getModule(a => a.WebAudioSound)?.WebAudioSound;
module.exports = () => ({
	start() {
		if (!WebAudioSound) return console.error("[NotificationVolume] Could not patch WebAudioSound");

		Patcher.after(WebAudioSound.prototype, "ensureAudio", (_, __, ret) => {
			ret.then(audio => {
				audio.volume *= Settings.state.notificationVolume / 100;
			});
		});
	},
	stop: () => Patcher.unpatchAll(),
	getSettingsPanel: () => <SettingComponent />
});
