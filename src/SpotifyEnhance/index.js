import css from "./styles";
import Logger from "@Utils/Logger";
import { DOM, React, Patcher } from "@Api";
import { getNestedProp } from "@Utils";

export default class SpotifyEnhance {
	start() {
		try {
			DOM.addStyle(css);
			
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}