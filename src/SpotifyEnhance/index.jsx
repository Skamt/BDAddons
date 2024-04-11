import { DOM, Patcher } from "@Api";
import Logger from "@Utils/Logger";
import Settings from "@Utils/Settings";
import { getFluxContainer } from "./Utils";
import SettingComponent from "./components/SettingComponent";
import patchListenAlong from "./patches/patchListenAlong";
import patchMessageHeader from "./patches/patchMessageHeader";
import patchSpotifyActivity from "./patches/patchSpotifyActivity";
import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import patchSpotifyPlayer from "./patches/patchSpotifyPlayer";
import css from "./styles";

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
