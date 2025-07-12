// import css from "./styles.css";
// import { DOM, Patcher, React, showConfirmationModal } from "@Api";
// import { Modals, openModal, closeModal } from "@Utils/Modals";

import Plugin, { Events } from "@Utils/Plugin";
// import Heading from "@Modules/Heading";
// import TextInput from "@Components/TextInput";
// import Popout from "@Components/Popout";
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

// import { DiscordPopout } from "@Discord/Modules";
// const DiscordPopout = s(235874).exports.y;


// import Tooltip from "@Components/Tooltip";
// import Popout from "@Components/Popout";
// import HoverPopout from "@Components/HoverPopout";
// import Artist from "../SpotifyEnhance/components/TrackMediaDetails/Artist";
// console.log(artist);

// const Test = () => {
// 	console.log(arts);
// 	return <>
// 		<Artist artists={arts} />;
// 		<Artist artists={[...arts].splice(2)} />;
// 	</>
// };

// const App = ({ onClose }) => {
// 	const popoutRef = React.useRef();
// 	const [val, setVal] = React.useState("");
// 	return (
// 		<ErrorBoundary>
// 			<HoverPopout popout={<button>popout</button>}>
// 				<button>Poop</button>
// 			</HoverPopout>

// 			{/*<Tooltip note={<button>button</button>}>
// 				<button>button</button>
// 			</Tooltip>*/}
// 			{/*<Popout
// 				targetElementRef={popoutRef}
// 				renderPopout={() => <div style={{ background: "red", whiteSpace: "nowrap" }}>text d fsd fs;ldt d fsd fs;ldtkjfdsf</div>}
// 				spacing={18}>
// 				{e => <div style={{
// 					display:"flex",
// 					justifyContent:"space-between"
// 				}}>
// 					<button ref={popoutRef}>Pop</button>
// 					<button onClick={e.onClick}>D</button>
// 				</div>}
// 			</Popout>*/}
// 			{/*<div className="testDiv">
// 				<DiscordPopout
// 					position="bottom"
// 					align="left"
// 					shouldShow={true}
// 					nudgeAlignIntoViewport={true}
// 					// useMouseEnter={true}
// 					animation="1"
// 					targetElementRef={popoutRef}
// 					renderPopout={e => <div style={{ background: "red", whiteSpace: "nowrap" }}>text d fsd fs;ldkjfdsf</div>}
// 					spacing={8}>
// 					{e => {
// 						// console.log(e);
// 						return (
// 							<button
// 								onMouseEnter={a => console.log("onMouseEnter")}
// 								onMouseLeave={a => console.log("onMouseLeave")}
// 								ref={popoutRef}
// 								onClick={e.onClick}>
// 								D
// 							</button>
// 						);
// 					}}
// 				</DiscordPopout>
// 			</div>*/}
// 		</ErrorBoundary>
// 	);
// };


// closeModal(window.id);
// window.id = BdApi.showConfirmationModal("", <Test />);
// console.log(Modals.Animations.SUBTLE);

// const b = s(431282).exports;
// Patcher.unpatchAll();
// Patcher.after(b, "V4", (_, args, ret) => {
// 	if (ret.props.onRequestClose) return ret;
// 	console.log(ret);
// 	ret.props.spacing = 16;
// const orig = ret.props.onRequestClose;
// ret.props.onRequestClose = e => {
// console.log(e);
// orig(e);
// };
// console.log(ret);
// 	return ret;
// });

module.exports = () => Plugin;
