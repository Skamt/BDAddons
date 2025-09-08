// import "./styles";
// import "./patches/*";
import { Patcher } from "@Api";
import Plugin, { Events } from "@Utils/Plugin";
// import epicker from "./elPicker";

import ErrorBoundary from "@Components/ErrorBoundary";
import React, { useEffect, useRef, useState } from "@React";

import { ModalActions, Modals } from "@Utils/Modals";
import { ContextMenu } from "@Api";
const { Item, Menu, Separator: MenuSeparator } = ContextMenu;

function B(){
	return <Item label="SD" id="SDSD"/>
}

function App() {

	const d = B();
	return <Menu>
		{d}
	</Menu>

}


// window.modalid && ModalActions.closeModal(window.modalid);

// window.modalid = ModalActions.openModal(e => (
// 	<ErrorBoundary>
// 		<Modals.ModalRoot fullscreenOnMobile={false} {...e}>
// 			<App />
// 		</Modals.ModalRoot>
// 	</ErrorBoundary>
// ));

Plugin.on(Events.START, () => {
	// window.addEventListener("keyup", onKeyUp);
});

Plugin.on(Events.STOP, () => {
	// window.removeEventListener("keyup", onKeyUp);
});

module.exports = () => Plugin;
