import "./styles";
import { DOM, Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { Store } from "./Store";
import { getFluxContainer } from "./Utils";
import SettingComponent from "./components/SettingComponent";
import patchListenAlong from "./patches/patchListenAlong";
import patchSpotifyActivity from "./patches/patchSpotifyActivity";
import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import patchSpotifyPlayer from "./patches/patchSpotifyPlayer";
import patchSpotifySocket from "./patches/patchSpotifySocket";
import patchMessageHeader from "./patches/patchMessageHeader";
import patchChannelAttach from "./patches/patchChannelAttach";

import Settings from "@Utils/Settings";

window.spotsetting = Settings;

export default class SpotifyEnhance {
	start() {
		try {
			// eslint-disable-next-line no-undef
			DOM.addStyle(css);
			Store.init();
			patchListenAlong();
			patchSpotifyEmbed();
			patchSpotifySocket();
			patchSpotifyActivity();
			patchMessageHeader();
			patchSpotifyPlayer();
			patchChannelAttach();
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
