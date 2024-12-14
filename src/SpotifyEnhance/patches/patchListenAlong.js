import { Patcher } from "@Api";
import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import SpotifyStore from "@Stores/SpotifyStore";

export default () => {
	if (!SpotifyStore) return Logger.patch("ListenAlong");
	Patcher.after(SpotifyStore, "getActiveSocketAndDevice", (_, __, ret) => {
		if (!Settings.getState().enableListenAlong) return;
		if (ret?.socket) ret.socket.isPremium = true;
		return ret;
	});
};
