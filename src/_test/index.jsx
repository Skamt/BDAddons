// import css from "./styles.css";
import { DOM, Patcher, React, showConfirmationModal } from "@Api";
import { Modals, openModal, closeModal } from "@Utils/Modals";

import Heading from "@Modules/Heading";
import TextInput from "@Components/TextInput";
import { DiscordPopout } from "@Discord/Modules";
// import { ContextMenu } from "@Api";
// import Collapsible from "@Components/Collapsible";
// import TextInput from "@Components/TextInput";
// import ErrorBoundary from "@Components/ErrorBoundary";
// import Flex from "@Components/Flex";

// import Heading from "@Modules/Heading";
// import * as icons from "@Components/Icon";
// import Collapsible from "@Components/Collapsible";
// console.log(Collapsible);
// import { EmojiSendAvailabilityEnum } from "@Discord/Enums";

// import { DiscordPopout } from "@Discord/Modules";
// import Slider from "@Modules/Slider";
// const PopupMenu

// import Button from "@Components/Button";
// import { CloseIcon, BookmarkOutlinedIcon, DuplicateIcon, LightiningIcon, PinIcon, VectorIcon } from "@Components/Icon";

// function d(items) {
// 	if (items)
// 		return {
// 			type: "submenu",
// 			label: "test",
// 			id: crypto.randomUUID(),
// 			items
// 		};

// 	return { label: "test", id: crypto.randomUUID() };
// }

// const Menu = ContextMenu.buildMenu([
// 	d(),
// 	d(),
// 	d([d(), d(), d(),d([d(), d(), d(),d([d(), d(), d(),d([d(), d(), d(),d([d(), d(), d(),d([d(), d(), d(),d([d(), d(), d(),d([d(), d(), d(),d([d(), d(), d(),d([d(), d(), d()])])])])])])])])])]),

// ]);

// document.oncontextmenu = e => {
// 	console.log(e);
// 	ContextMenu.open(e, p => <Menu {...p} />);
// };


const App = ({ onClose }) => {
	const popoutRef = React.useRef();
	const [val, setVal] = React.useState("");
	return (
		<DiscordPopout
			position="bottom"
			align="right"
			animation="1"
			targetElementRef={popoutRef}
			renderPopout={e => {
				return (
					<>
						<Heading
							tag="h5"
							style={{ marginBottom: 8 }}
							variant="eyebrow">
						SDWE
						</Heading>
						<TextInput
							onChange={setVal}
							value={val}
						/>
					</>
				);
			}}
			spacing={8}>
			{e => (
				<button
					ref={popoutRef}
					onClick={e.onClick}>
					D
				</button>
			)}
		</DiscordPopout>
	);
};

closeModal(window.id);
window.id = openModal(<App />);
// console.log(Modals.Animations.SUBTLE);

export default () => {
	return {
		start() {
			// css && DOM.addStyle(css);
			// console.log(css);
			// console.log(<App />);
		},
		stop() {
			// DOM.removeStyle();
			// Patcher.unpatchAll();
		}
	};
};
