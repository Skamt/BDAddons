import { after } from "@common/Patcher";
import Settings from "@Utils/Settings";
import SpotifyStore from "@Stores/SpotifyStore";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	after(SpotifyStore, "getActiveSocketAndDevice", ({ ret }) => {
		if (!Settings.getState().enableListenAlong) return;
		if (ret?.socket) ret.socket.isPremium = true;
		return ret;
	});
});
