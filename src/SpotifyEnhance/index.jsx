import { DOM, Patcher } from "@Api";
import Logger from "@Utils/Logger";
// import Settings from "@Utils/Settings";
import { getFluxContainer } from "./Utils";
import patchListenAlong from "./patches/patchListenAlong";
import patchSpotifySocket from "./patches/patchSpotifySocket";
import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import patchSpotifyPlayer from "./patches/patchSpotifyPlayer";
import css from "./styles";
import Store from "./Store";
// import SpotifyAPI from "./SpotifyAPIWrapper";
import SpotifyAPI from "@Utils/SpotifyAPI";

window.SpotifyStore = Store;
window.SpotifyAPI = SpotifyAPI;


export default class SpotifyEnhance {
	start() {
		try {
			// Settings.init(config.settings);
			DOM.addStyle(css);
			Store.init();
			// SpotifyWrapper.init();
			patchListenAlong();
			patchSpotifyEmbed();
			patchSpotifySocket();
			// patchSpotifyActivity();
			// patchMessageHeader();
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

	// getSettingsPanel() {
		// return SettingComponent;
	// }
}
