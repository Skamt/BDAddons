// import Store from "@/Store";
// import ErrorBoundary from "@Components/ErrorBoundary";
// import React from "@React";
import React from "@React";
import "./styles";
import "./patches/*";
import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";
import { reRender } from "@Utils";
import SettingComponent from "./components/SettingComponent";


// import { ModalActions, Modals } from "@Utils/Modals";
Plugin.getSettingsPanel = () => <SettingComponent />;

// window.modalid && ModalActions.closeModal(window.modalid);

// window.modalid = BdApi.UI.showConfirmationModal("", <SettingComponent />);

Plugin.on(Events.START, () => {});

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
	reRender(".base_c48ade"); // temp
});

module.exports = () => Plugin;
