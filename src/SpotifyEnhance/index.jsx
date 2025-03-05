import "./styles";
import { DOM, Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { Store } from "./Store";

import SettingComponent from "./components/SettingComponent";
import patchListenAlong from "./patches/patchListenAlong";
import patchSpotifyActivity from "./patches/patchSpotifyActivity";
import patchSpotifyEmbed from "./patches/patchSpotifyEmbed";
import patchSpotifyPlayer, { cleanFluxContainer } from "./patches/patchSpotifyPlayer";
import patchSpotifySocket from "./patches/patchSpotifySocket";
import patchMessageHeader from "./patches/patchMessageHeader";
import patchMessageComponentAccessories from "./patches/patchMessageComponentAccessories";
import patchChannelAttach from "./patches/patchChannelAttach";
import DB from "./DB";
import Pip from "./pip";

import SpotifyAPI from "@Utils/SpotifyAPI";

/*DEBUG*/
window.cleanFluxContainer = cleanFluxContainer;
window.spotstore = Store;
window.SpotifyAPI = SpotifyAPI;
/*DEBUG*/

export default class SpotifyEnhance {
	async start() {
		try {
			// eslint-disable-next-line no-undef
			DOM.addStyle(css);
			await DB.init();
			Store.init();
			Pip.init();
			patchListenAlong();
			patchSpotifyEmbed();
			patchMessageComponentAccessories();
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
			DB.dispose();
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
