import { showConfirmationModal, DOM, React, Patcher } from "@Api";
import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
import ErrorBoundary from "@Components/ErrorBoundary";


export default () => {
	return {
		start() {
			// eslint-disable-next-line no-undef
			css ?? DOM.addStyle(css);
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};
