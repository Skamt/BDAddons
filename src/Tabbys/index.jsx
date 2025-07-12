import "./styles";
import React from "@React";
import { DOM, Patcher } from "@Api";
import { reRender, shallow } from "@Utils";
import Logger from "@Utils/Logger";
import { Store } from "./Store";
import patchChannelClick from "./patches/patchChannelClick";
import patchTitleBar from "./patches/patchTitleBar";
import patchDMClick from "./patches/patchDMClick";
import patchContextMenu from "./patches/patchContextMenu";
import { Dispatcher } from "@Discord/Modules";
import SettingComponent from "./components/SettingComponent";
import Settings from "@Utils/Settings";
// import { closeModal } from "@Utils/Modals";

/*DEBUG*/
window.TabsStore = Store;
/*DEBUG*/

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

function cssVarsListener() {
	return Settings.subscribe(
		a => a,
		() => updateCssVars(),
		shallow
	);
}

function updateCssVars() {
	const state = Settings.state;
	BdApi.DOM.removeStyle("Tabbys-vars");
	BdApi.DOM.addStyle(
		"Tabbys-vars",
		`
			.Tabbys-vars {
				--size:${state.size}px;
				--tab-divider-size:${state.tabDividerSize}px;
			}
		`
	);
}


import App from "./components/App";
import { openModal, closeModal } from "@Utils/Modals";
import ErrorBoundary from "@Components/ErrorBoundary";
// import { showConfirmationModal } from "@Api";
closeModal(window.id);
window.id = openModal(
	<ErrorBoundary>
		<App />
	</ErrorBoundary>
);

export default class Tabbys {
	start() {
		try {
			DOM.addStyle(css);
			updateCssVars();
			Store.init();
			// patchTitleBar();
			patchDMClick();
			patchChannelClick();
			reRender('div[data-windows="true"] > *');
			this.unCssVarsListener = cssVarsListener();
			this.unpatchContextMenu = patchContextMenu();
			this.removeDispatchInterceptor = disableGoHomeAfterSwitching();
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		Store.dispose();
		DOM.removeStyle();
		BdApi.DOM.removeStyle("Tabbys-vars");
		Patcher.unpatchAll();
		reRender('div[data-windows="true"] > *');
		this.unCssVarsListener?.();
		this.unCssVarsListener = null;
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
