import { DOM, Patcher, React, showConfirmationModal } from "@Api";
import { closeModal } from "@Utils/Modals";
import ErrorBoundary from "@Components/ErrorBoundary";
import * as icons from "@Components/Icon"
// import Collapsible from "@Components/Collapsible";
// console.log(Collapsible);
// import { EmojiSendAvailabilityEnum } from "@Discord/Enums";


const App = () => {

	return 	<div style={{color:"#fff", display:"flex", "flexDirection":"column"}}>{Object.entries(icons).map(([n,a]) => [n,a()])}</div>
};


closeModal(window.id);
window.id = showConfirmationModal("", <App />);




export default () => {
	return {
		start() {
			// eslint-disable-next-line no-undef
			css ?? DOM.addStyle(css);

			// console.log(EmojiSendAvailabilityEnum);
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};
