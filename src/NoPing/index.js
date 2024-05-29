import "./styles";
import Logger from "@Utils/Logger";
import { DOM, Patcher } from "@Api";

export default class NoPing {
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

const css = "";