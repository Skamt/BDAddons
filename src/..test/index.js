import { DOM, Patcher, React, showConfirmationModal } from "@Api";
// import Tooltip from "@Components/Tooltip";
import Collapsible from "@Components/Collapsible";
import Settings from "./components/Settings";
import "./styles";

export default () => {
	return {
		start() {
			DOM.addStyle(css);
			let b = <Collapsible />;
			let d = <Settings />;
			console.log(b);
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};
