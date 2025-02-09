import { showConfirmationModal, DOM, React, Patcher } from "@Api";
import ErrorBoundary from "@Components/ErrorBoundary";

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
