import "./styles";
import React from "@React";
import { DOM, Patcher } from "@Api";
import { reRender } from "@Utils";
import Logger from "@Utils/Logger";
import { Store } from "./Store";
import patchChannelClick from "./patches/patchChannelClick";
import patchTitleBar from "./patches/patchTitleBar";
import patchDMClick from "./patches/patchDMClick";
import patchContextMenu from "./patches/patchContextMenu";
import { Dispatcher } from "@Discord/Modules";
import SettingComponent from "./components/SettingComponent";
// import Settings from "@Utils/Settings";
// import { closeModal } from "@Utils/Modals";
/*DEBUG*/
window.TabsStore = Store;
/*DEBUG*/


// closeModal(window.id);
// window.id = showConfirmationModal("", <SettingComponent />);

function disableGoHomeAfterSwitching() {
	function interceptor(e) {
		if (e.type !== "LOGOUT") return;
		e.goHomeAfterSwitching = false;
	}
	Dispatcher.addInterceptor(interceptor);
	return () => {
		const index = Dispatcher._interceptors.indexOf(interceptor);
		Dispatcher._interceptors.splice(index, 1);
	};
}

export default class Tabbys {
	start() {
		try {
			DOM.addStyle(css);
			Store.init();
			patchTitleBar();
			patchDMClick();
			patchChannelClick();
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

	getSettingsPanel() {
		return <SettingComponent />;
	}
}
