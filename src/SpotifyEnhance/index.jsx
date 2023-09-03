import css from "./styles";
import Logger from "@Utils/Logger";
import { DOM, React, Patcher } from "@Api";
import { getNestedProp, reRender } from "@Utils";
import Settings from "@Utils/Settings";
import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import patchSpotifyActivity from "./patches/patchSpotifyActivity";
import patchMessageHeader from "./patches/patchMessageHeader";
import patchListenAlong from "./patches/patchListenAlong";
import patchSpotifyControls from "./patches/patchSpotifyControls";
import SettingComponent from "./components/SettingComponent";
import SpotifyAPI from "@Utils/SpotifyAPI";
import SpotifyStore from "@Stores/SpotifyStore";
import ConnectedAccountsStore from "@Stores/ConnectedAccountsStore";

// window.SpotifyAPI = SpotifyAPI;

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
			patchSpotifyActivity();
			patchMessageHeader();
			patchSpotifyControls();
			SpotifyStore.addChangeListener(updateSpotifyToken);
			updateSpotifyToken();
			reRender(".sidebar-1tnWFu")
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
