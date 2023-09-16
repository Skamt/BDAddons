import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import SpotifyStore from "@Stores/SpotifyStore";

export default () => {
	if (SpotifyStore)
		Patcher.after(SpotifyStore, "getActiveSocketAndDevice", (_, __, ret) => {
			if (ret?.socket) ret.socket.isPremium = true;
			return ret;
		});
	else Logger.patch("ListenAlong");
};
