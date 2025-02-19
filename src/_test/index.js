import { showConfirmationModal, DOM, React, Patcher } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";

import Collapsible from "@Components/Collapsible";
console.log(Collapsible);
// import { EmojiSendAvailabilityEnum } from "@Discord/Enums";

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
