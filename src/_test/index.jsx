import "./styles.css";
import { DOM, Patcher, React, showConfirmationModal } from "@Api";
import { closeModal } from "@Utils/Modals";
// import Collapsible from "@Components/Collapsible";
// import ErrorBoundary from "@Components/ErrorBoundary";
// import * as icons from "@Components/Icon";
// import Collapsible from "@Components/Collapsible";
// console.log(Collapsible);
// import { EmojiSendAvailabilityEnum } from "@Discord/Enums";

// import { DiscordPopout } from "@Discord/Modules";
// import Slider from "@Modules/Slider";
// const PopupMenu

// const App = () => {
// 	return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Badge</span>;
// };

// closeModal(window.id);
// window.id = showConfirmationModal("", <App />);

export default () => {
	return {
		start() {
			css && DOM.addStyle(css);
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};
