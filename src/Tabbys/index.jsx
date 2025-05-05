import "./styles";
import React from "@React";
import Logger from "@Utils/Logger";
import {  DOM, Patcher } from "@Api";
// import patchTransitionTo from "./patches/patchTransitionTo";
import TabBar from "./components/TabBar";
import { Store } from "./Store";
import { ReactDOM } from "@Api";

import ErrorBoundary from "@Components/ErrorBoundary";

/*DEBUG*/
window.TabsStore = Store;
/*DEBUG*/

const container = Object.assign(document.createElement("div"), { className: "tabs-test-container" });
let root = ReactDOM.createRoot(container);

export default class Tabbys {
	start() {
		try {
			DOM.addStyle(css);
			Store.init();
			
			root = ReactDOM.createRoot(container);
			document.body.prepend(container);
			root.render(
				<ErrorBoundary>
					<TabBar />
				</ErrorBoundary>
			);
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		root.unmount();
		container.remove();
		Store.dispose();
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}
