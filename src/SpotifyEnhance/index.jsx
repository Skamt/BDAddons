import css from "./styles";
import Logger from "@Utils/Logger";
import { DOM, Patcher } from "@Api";
import Settings from "@Utils/Settings";
import patchListenAlong from "./patches/patchListenAlong";
import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import patchSpotifyActivity from "./patches/patchSpotifyActivity";
import patchMessageHeader from "./patches/patchMessageHeader";
import patchSpotifyPlayer from "./patches/patchSpotifyPlayer";
import SettingComponent from "./components/SettingComponent";
import SpotifyAPI from "@Utils/SpotifyAPI";
import { getFluxContainer } from "./Utils";

import SpotifyWrapper from "./SpotifyWrapper";



export default class SpotifyEnhance {
	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			SpotifyWrapper.init();
			patchListenAlong();
			patchSpotifyEmbed();
			patchSpotifyActivity();
			patchMessageHeader();
			patchSpotifyPlayer();
		} catch (e) {
			Logger.error(e);
		}
	}

	async stop() {
		try {
			SpotifyWrapper.dispose();
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
