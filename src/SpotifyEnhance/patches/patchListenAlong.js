import { after } from "@common/Patcher";
import Settings from "@Settings";
import SpotifyStore from "@Stores/SpotifyStore";
import Plugin from "@common/Plugin";

Plugin.onStart(() => {
	after(SpotifyStore, "getActiveSocketAndDevice", ({ ret }) => {
		if (!Settings.state.enableListenAlong) return;
		if (ret?.socket) ret.socket.isPremium = true;
		return ret;
	});
});
