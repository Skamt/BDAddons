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

import SpotifyWrapper from "./SpotifyWrapper";
window.SpotifyWrapper = SpotifyWrapper;

export default class SpotifyEnhance {
	start() {
		try {
			Settings.init(config.settings);
			DOM.addStyle(css);
			SpotifyWrapper.init();
			patchSpotifyEmbed();
			patchSpotifyActivity();
			patchMessageHeader();
			patchSpotifyControls();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		SpotifyWrapper.dispose();
		DOM.removeStyle();
		Patcher.unpatchAll();
	}

	getSettingsPanel() {
		return <SettingComponent />;
	}
}
