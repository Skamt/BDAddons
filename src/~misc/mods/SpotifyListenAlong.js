import { Patcher } from "@Api";
import { Disposable } from "@Utils";
import Logger from "@Utils/Logger";

import SpotifyStore from "@Stores/SpotifyStore";

export default class SpotifyListenAlong extends Disposable {
	Init() {
		if (SpotifyStore)
			this.patches = [
				Patcher.after(SpotifyStore, "getActiveSocketAndDevice", (_, args, ret) => {
					if (ret?.socket) ret.socket.isPremium = true;
					return ret;
				})
			];
		else Logger.patch("SpotifyListenAlong");
	}
}
