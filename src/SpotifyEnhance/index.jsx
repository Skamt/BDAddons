import css from "./styles";
import Logger from "@Utils/Logger";
import { DOM, React, Patcher } from "@Api";
import { getNestedProp } from "@Utils";
import Settings from "@Utils/Settings";
import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import SettingComponent from "./components/SettingComponent";
import SpotifyAPI from "@Utils/SpotifyAPI";
import SpotifyStore from "@Stores/SpotifyStore";

function updateSpotifyToken() {
	const { socket } = SpotifyStore.getActiveSocketAndDevice() || {};
	if (!socket) return;
	SpotifyAPI.token = socket.accessToken;
	SpotifyAPI.accountId = socket.accountId;
}

export default class SpotifyEnhance {
	start() {
		try {
			Settings.init(config.settings);
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

	getSettingsPanel() {
		return <SettingComponent />;
	}
}
