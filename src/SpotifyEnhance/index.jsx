import css from "./styles";
import { DOM, Patcher } from "@Api";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import { Store } from "./Store";
import { getFluxContainer } from "./Utils";
import SettingComponent from "./components/SettingComponent";
import patchListenAlong from "./patches/patchListenAlong";
import patchSpotifyActivity from "./patches/patchSpotifyActivity";
import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import patchSpotifyPlayer from "./patches/patchSpotifyPlayer";
import patchSpotifySocket from "./patches/patchSpotifySocket";
import patchMessageHeader from "./patches/patchMessageHeader";

window.spotSettings = Settings;

export default class SpotifyEnhance {
	start() {
		try {
			DOM.addStyle(css);
			Store.init();
			patchListenAlong();
			patchSpotifyEmbed();
			patchSpotifySocket();
			patchSpotifyActivity();
			patchMessageHeader();
			patchSpotifyPlayer();
		} catch (e) {
			Logger.error(e);
		}
	}

	async stop() {
		try {
			Store.dispose();
			DOM.removeStyle();
			Patcher.unpatchAll();

			const fluxContainer = await getFluxContainer();
			if (fluxContainer) fluxContainer.stateNode.forceUpdate();
		} catch (e) {
			Logger.error(e);
		}
	}

	getSettingsPanel() {
		return SettingComponent;
	}
}
