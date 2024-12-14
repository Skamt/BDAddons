import "./styles";
import { DOM, Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { Store } from "./Store";

import SettingComponent from "./components/SettingComponent";
import patchListenAlong from "./patches/patchListenAlong";
import patchSpotifyActivity from "./patches/patchSpotifyActivity";
import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import patchSpotifyPlayer, {cleanFluxContainer} from "./patches/patchSpotifyPlayer";
import patchSpotifySocket from "./patches/patchSpotifySocket";
import patchMessageHeader from "./patches/patchMessageHeader";
import patchChannelAttach from "./patches/patchChannelAttach";
import Pip from "./pip";

import SpotifyAPI from "@Utils/SpotifyAPI";

/*DEBUG*/
window.cleanFluxContainer = cleanFluxContainer;
window.spotstore = Store;
window.SpotifyAPI = SpotifyAPI;
/*DEBUG*/

export default class SpotifyEnhance {
	start() {
		try {
			// eslint-disable-next-line no-undef
			DOM.addStyle(css);
			Store.init();
			Pip.init();
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
			Pip.dispose();
			DOM.removeStyle();
			Patcher.unpatchAll();

			cleanFluxContainer();			
		} catch (e) {
			Logger.error(e);
		}
	}

	getSettingsPanel() {
		return SettingComponent;
	}
}
