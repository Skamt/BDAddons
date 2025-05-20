import { DOM, Patcher, React, showConfirmationModal } from "@Api";
import { closeModal } from "@Utils/Modals";
import ErrorBoundary from "@Components/ErrorBoundary";
import * as icons from "@Components/Icon";
// import Collapsible from "@Components/Collapsible";
// console.log(Collapsible);
// import { EmojiSendAvailabilityEnum } from "@Discord/Enums";

import { DiscordPopout } from "@Discord/Modules";
import Slider from "@Modules/Slider";
// const PopupMenu



const App = () => {
	const [val, set] = React.useState(5);
	console.log(val);
	return (
		<Slider
			onValueRender={a => Math.round(a)+""}
			initialValue={val}
			onValueChange={a => set(Math.round(a))}
			markers={[...Array(11)].map((_, i) => i)}
			minValue={0}
			maxValue={10}
			defaultValue={val}
		/>
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
