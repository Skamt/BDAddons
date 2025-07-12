import "./styles";
import Logger from "@Utils/Logger";
import { DOM, Patcher } from "@Api";
import patchContextMenu from "./patches/patchContextMenu";
import patchSomething from "./patches/patchSomething";
import { Store } from "./Store";

/*DEBUG*/
window.FloatingChannelsStore = Store;
/*DEBUG*/

export default class FloatingChannels {
	start() {
		try {
			DOM.addStyle(css);
			Store.init();
			patchSomething();
			this.unpatchContextMenu = patchContextMenu();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Store.dispose();
		Patcher.unpatchAll();
		this.unpatchContextMenu?.forEach?.(p => p());
		this.unpatchContextMenu = null;
	}
}

// const css = "";
