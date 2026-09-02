import { getByPrototypeKeys } from "@Webpack";
const WebAudioSound = getByPrototypeKeys("play", "destroyAudio", "stop", { searchExports: true });

export function playMessageNotificationSounce() {
	new WebAudioSound("message1","message1",1, "default").play();
}
