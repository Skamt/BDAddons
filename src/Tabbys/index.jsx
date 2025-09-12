import "./styles";
// import Store from "@/Store";
// import "./patches/*";
// import ErrorBoundary from "@Components/ErrorBoundary";
// import React from "@React";
// import { closeModal } from "@Utils/Modals";
// import { showConfirmationModal } from "@Api";
import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";

// import "@/components/CreateFolderModal";
import { reRender } from "@Utils";
// const Tab = React.memo(function Tab() {
// 	const tab = Store(state => state.tab);
// 	console.log(tab);
// 	return null;
// });

// window.id && closeModal(window.id);
// window.id = showConfirmationModal("sd", <Tab />);







Plugin.on(Events.START, () => {
	// const selectedChannel = SelectedChannelStore.getCurrentlySelectedChannelId();
	// console.log(selectedChannel);
	
});

Plugin.on(Events.STOP, () => {
	// window.navigation.removeEventListener("navigate", onLocationChange);
	Patcher.unpatchAll();
	reRender('.base_c48ade'); // temp
});

module.exports = () => Plugin;
