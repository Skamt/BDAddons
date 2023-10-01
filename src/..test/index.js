// import css from "./styles";
// import { DOM, React, Patcher } from "@Api";
// import Logger from "@Utils/Logger";
// import ErrorBoundary from "@Components/ErrorBoundary";
// import TheBigBoyBundle from "@Modules/TheBigBoyBundle";
// import Tooltip from "@Components/Tooltip";
// import Button from "@Components/Button";
// import ShareIcon from "@Components/ShareIcon";
// import { getInternalInstance } from "@Api";

// const { closeModal, openModal, Popout, MenuItem, Menu, MenuGroup } = TheBigBoyBundle;
// const c = s.moduleById(215433).exports;

// function SpotifyPlayerButton({ note, value, onClick, className, active, ...rest }) {
// 	return (
// 		<Button
// 			className={`spotify-player-controls-btn ${className} ${active ? "enabled" : ""}`}
// 			size={Button.Sizes.NONE}
// 			color={Button.Colors.PRIMARY}
// 			look={Button.Looks.BLANK}
// 			onClick={onClick}
// 			{...rest}>
// 			{value}
// 		</Button>
// 	);
// }

// function Test({ onHover }) {
// 	return (
// 		<div className="spotify-player-controls">
// 			<SpotifyPlayerButton
// 				note="Share in current channel"
// 				className="spotify-player-controls-share"
// 				value={<ShareIcon />}
// 			/>
// 		</div>
// 	);
// }

// function B() {
// 	const [show, setShow] = React.useState(false);

// 	return (
// 		<div
// 			onMouseLeave={() => setShow(0)}
// 			onMouseEnter={() => setShow(1)}>
// 			<Popout
// 				renderPopout={() => (
// 					<Menu>
// 						<MenuGroup>
// 							<MenuItem label="Share" />
// 							<MenuItem label="copy" />
// 						</MenuGroup>
// 					</Menu>
// 				)}
// 				shouldShow={show}
// 				position="top"
// 				animation="1"
// 				autoInvert={true}
// 				spacing={0}>
// 				{props => <Test onHover={setShow} />}
// 			</Popout>
// 		</div>
// 	);
// }

// window.id && closeModal(window.id);
// window.id = BdApi.showConfirmationModal("", <B />);

// function getFluxContainer() {
// 	const el = document.querySelector(".panels-3wFtMD");
// 	if (!el) return;
// 	const instance = getInternalInstance(el);
// 	if (!instance) return;
// 	return instance.child;
// }

export default () => {
	return {
		start() {
			// DOM.addStyle(css);

			// const fluxContainer = getFluxContainer();
			// if (!fluxContainer) return Logger.patch("test");
			// Patcher.after(fluxContainer.type.prototype, "render", (_, __, ret) => {
			// 	return [
			// 		<ErrorBoundary
			// 			id="Test"
			// 			plugin={config.info.name}>
			// 			<B />
			// 		</ErrorBoundary>,
			// 		ret
			// 	];
			// });
			// fluxContainer.stateNode.forceUpdate();
		},
		stop() {
			// DOM.removeStyle();
			// Patcher.unpatchAll();

			// const fluxContainer = getFluxContainer();
			// if (fluxContainer) fluxContainer?.stateNode?.forceUpdate();
		}
	};
};
