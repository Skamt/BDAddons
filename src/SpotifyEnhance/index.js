import css from "./styles";
import Logger from "@Utils/Logger";
import { DOM, Patcher } from "@Api";
import { getNestedProp } from "@Utils";

import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import SpotifyAPI from "@Utils/SpotifyAPI";
import SpotifyStore from "@Stores/SpotifyStore";

function updateSpotifyToken() {
	const { socket } = SpotifyStore.getPlayableComputerDevices()[0];
	if (!socket) return;
	SpotifyAPI.token = socket.accessToken;
	SpotifyAPI.accountId = socket.accountId;
}

export default class SpotifyEnhance {
	start() {
		try {
			DOM.addStyle(css);
			patchSpotifyEmbed();
			SpotifyStore.addChangeListener(updateSpotifyToken);
			updateSpotifyToken();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
		SpotifyStore.removeChangeListener(updateSpotifyToken);
	}
}
