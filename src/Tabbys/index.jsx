import "./styles";
import { DOM, Patcher } from "@Api";
import { reRender } from "@Utils";
import Logger from "@Utils/Logger";
import { Store } from "./Store";
import patchTitleBar from "./patches/patchTitleBar";
import patchContextMenu from "./patches/patchContextMenu";
import { Dispatcher } from "@Discord/Modules";

/*DEBUG*/
window.TabsStore = Store;
/*DEBUG*/

function disableGoHomeAfterSwitching() {
	function interceptor(e){
		if (e.type !== "LOGOUT") return;
		e.goHomeAfterSwitching = false;
	}
	Dispatcher.addInterceptor(interceptor);
	return () => {
		const index = Dispatcher._interceptors.indexOf(interceptor);
		Dispatcher._interceptors.splice(index,1);
	}
}

export default class Tabbys {
	start() {
		try {
			DOM.addStyle(css);
			Store.init();
			patchTitleBar();
			reRender('div[data-windows="true"] > *');
			this.unpatchContextMenu = patchContextMenu();
			this.removeDispatchInterceptor = disableGoHomeAfterSwitching();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		Store.dispose();
		DOM.removeStyle();
		Patcher.unpatchAll();
		reRender('div[data-windows="true"] > *');
		this.removeDispatchInterceptor?.();
		this.removeDispatchInterceptor = null;
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.unpatchContextMenu?.forEach?.(p => p());
		this.unpatchContextMenu = null;
	}
}
