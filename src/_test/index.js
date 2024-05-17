import { DOM, Patcher, React, showConfirmationModal } from "@Api";
// import Tooltip from "@Components/Tooltip";
import Collapsible from "@Components/Collapsible";
import ConnectedAccountsStore from "@Stores/ConnectedAccountsStore";
import Settings from "./components/Settings";


export default () => {
	return {
		start() {
			css ?? DOM.addStyle(css);
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};
