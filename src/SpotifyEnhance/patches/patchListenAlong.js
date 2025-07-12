import { Patcher } from "@Api";
import Settings from "@Utils/Settings";
import Logger from "@Utils/Logger";
import SpotifyStore from "@Stores/SpotifyStore";
import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	if (!SpotifyStore) return Logger.patchError("ListenAlong");
	const unpatch = Patcher.after(SpotifyStore, "getActiveSocketAndDevice", (_, __, ret) => {
		if (!Settings.getState().enableListenAlong) return;
		if (ret?.socket) ret.socket.isPremium = true;
		return ret;
	});
	
	Plugin.once(Events.STOP, unpatch);
});
