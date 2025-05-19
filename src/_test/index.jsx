import { DOM, Patcher, React, showConfirmationModal } from "@Api";
import { closeModal } from "@Utils/Modals";
import ErrorBoundary from "@Components/ErrorBoundary";
import * as icons from "@Components/Icon";
// import Collapsible from "@Components/Collapsible";
// console.log(Collapsible);
// import { EmojiSendAvailabilityEnum } from "@Discord/Enums";

import { DiscordPopout } from "@Discord/Modules";

// const PopupMenu

const App = () => {
	return (
		<DiscordPopout
			position="top"
			align="left"
			renderPopout={e => {
				console.log(e);
				// biome-ignore lint/a11y/useButtonType: <explanation>
				return <button>poped out button</button>;
			}}>
			{e => {
				// console.log(e);
				// biome-ignore lint/a11y/useButtonType: <explanation>
				return <button onClick={e.onClick}>ClickMEH</button>;
			}}
		</DiscordPopout>
	);
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
