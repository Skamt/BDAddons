import css from "./styles";
import Logger from "@Utils/Logger";
import { DOM, React, Patcher } from "@Api";
import { getNestedProp, reRender } from "@Utils";
import Settings from "@Utils/Settings";
import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import patchSpotifyActivity from "./patches/patchSpotifyActivity";
import patchMessageHeader from "./patches/patchMessageHeader";
import patchListenAlong from "./patches/patchListenAlong";
import patchSpotifyPlayer from "./patches/patchSpotifyPlayer";
import SettingComponent from "./components/SettingComponent";
import SpotifyAPI from "@Utils/SpotifyAPI";
import SpotifyStore from "@Stores/SpotifyStore";
import ConnectedAccountsStore from "@Stores/ConnectedAccountsStore";
import { getFluxContainer } from "./Utils";

import SpotifyWrapper from "./SpotifyWrapper";

window.SpotifyWrapper = SpotifyWrapper;
window.SpotifyAPI = SpotifyAPI;

export default class SpotifyEnhance {
	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			SpotifyWrapper.init();
			patchSpotifyEmbed();
			patchSpotifyActivity();
			patchMessageHeader();
			patchSpotifyPlayer();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		try {
			SpotifyWrapper.dispose();
			DOM.removeStyle();
			Patcher.unpatchAll();

			const fluxContainer = getFluxContainer();
			if (fluxContainer) fluxContainer?.stateNode?.forceUpdate();
		} catch (e) {
			Logger.error(e);
		}
	}

	getSettingsPanel() {
		return <SettingComponent />;
	}
}
