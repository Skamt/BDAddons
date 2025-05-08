import "./styles";
import { DOM, Patcher } from "@Api";
import { reRender } from "@Utils";
import Logger from "@Utils/Logger";
import { Store } from "./Store";
import patchTitleBar from "./patches/patchTitleBar";

/*DEBUG*/
window.TabsStore = Store;
/*DEBUG*/

// const container = Object.assign(document.createElement("div"), { className: "tabs-test-container" });
// let root = ReactDOM.createRoot(container);

export default class Tabbys {
	start() {
		try {
			DOM.addStyle(css);
			Store.init();
			patchTitleBar();
			reRender('div[data-windows="true"] > *');
			// root = ReactDOM.createRoot(container);
			// document.body.prepend(container);
			// root.render(
			// 	<ErrorBoundary>
			// 		<TabBar />
			// 	</ErrorBoundary>
			// );
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		// root.unmount();
		// container.remove();
		Store.dispose();
		DOM.removeStyle();
		Patcher.unpatchAll();
		reRender('div[data-windows="true"] > *');
	}
}
