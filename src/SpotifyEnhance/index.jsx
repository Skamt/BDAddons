import { DOM, Patcher } from "@Api";
import Logger from "@Utils/Logger";
// import Settings from "@Utils/Settings";
import { getFluxContainer } from "./Utils";
// import SettingComponent from "./components/SettingComponent";
// import patchMessageHeader from "./patches/patchMessageHeader";
// import patchSpotifyActivity from "./patches/patchSpotifyActivity";
import patchListenAlong from "./patches/patchListenAlong";
import patchSpotifySocket from "./patches/patchSpotifySocket";
import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import patchSpotifyPlayer from "./patches/patchSpotifyPlayer";
// import css from "./styles";
// import SpotifySocketListener from "./SpotifySocketListener";
// import SpotifyWrapper from "./SpotifyWrapper";
import SpotifyStore from "./SpotifyStore";

window.SpotifyStore = SpotifyStore;


export default class SpotifyEnhance {
	start() {
		try {
			// Settings.init(config.settings);
			// DOM.addStyle(css);
			SpotifyStore.init();
			// SpotifyWrapper.init();
			patchListenAlong();
			patchSpotifyEmbed();
			patchSpotifySocket();
			// patchSpotifyActivity();
			// patchMessageHeader();
			patchSpotifyPlayer();
			// console.log(SpotifyStore);
		} catch (e) {
			Logger.error(e);
		}
	}

	async stop() {
		try {
			// SpotifyWrapper.dispose();
			SpotifyStore.dispose();
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
