import { ContextMenu, Patcher } from "@Api";
import Plugin, { Events } from "@Utils/Plugin";
// import ErrorBoundary from "@Components/ErrorBoundary";
import React, { useEffect, useRef, useState } from "@React";
// import { ModalActions, Modals } from "@Utils/Modals";
// import { ContextMenu } from "@Api";
// const { Item, Menu, Separator: MenuSeparator } = ContextMenu;

// import FieldSet from "@Components/FieldSet";

// import Switch from "@Components/Switch";
// import Divider from "@Components/Divider";
// import Slider from "@Modules/Slider";
// import Collapsible from "@Components/Collapsible";

// function App() {
// 	return (
// 		<div>
// 		<Collapsible title="a very long title, the longest kinda">
// 			<FieldSet
// 				label="Mine"
// 				description="Mine">
// 				<Slider
// 					label="label"
// 					description="description"
// 					markers={[5, 10, 15, 20, 25, 30]}
// 				/>
// 				<Divider
// 					gap={1}
// 					direction={Divider.HORIZONTAL}
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 			</FieldSet>
// 		</Collapsible>
// 	<Collapsible title="a long title">
// 			<FieldSet
// 				label="Mine"
// 				description="Mine">
// 				<Slider
// 					label="label"
// 					description="description"
// 					markers={[5, 10, 15, 20, 25, 30]}
// 				/>
// 				<Divider
// 					gap={1}
// 					direction={Divider.HORIZONTAL}
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 			</FieldSet>
// 		</Collapsible>
// 	<Collapsible title="tiny title">
// 			<FieldSet
// 				label="Mine"
// 				description="Mine">
// 				<Slider
// 					label="label"
// 					description="description"
// 					markers={[5, 10, 15, 20, 25, 30]}
// 				/>
// 				<Divider
// 					gap={1}
// 					direction={Divider.HORIZONTAL}
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 				<Switch
// 					checked={true}
// 					label="label"
// 				/>
// 			</FieldSet>
// 		</Collapsible>
// 	</div>
// 	);
// }

// import { getBySource } from "@Webpack";
// import { ReactDOM } from "@Api";
// import ErrorBoundary from "@Components/ErrorBoundary";

// const pipContainer = Object.assign(document.createElement("div"), { className: "pipContainer" });

// const PIP = {
// 	init() {
// 		document.body.appendChild(pipContainer);
// 		this.root = ReactDOM.createRoot(pipContainer);
// 		this.root.render(
// 			<ErrorBoundary>
// 				<PipContainer />
// 			</ErrorBoundary>
// 		);
// 	},
// 	dispose() {
// 		this.root.unmount();
// 		pipContainer.remove();
// 	}
// };

// const Draggable = getBySource("edgeOffsetBottom", "defaultPosition")?.Z;
// const Draggable = s(689425).exports.Z;
// const Draggable = s(241915).exports._;

// function PipContainer() {
// 	return (
// 		// <Context>

// 		<Draggable  maxX={window.innerWidth} maxY={window.innerHeight} dockedRect={true}>
// 			<div className="el" />
// 		</Draggable>

// 		// </Context>
// 	);
// }

// window.modalid && ModalActions.closeModal(window.modalid);

// window.modalid = BdApi.UI.showConfirmationModal("", <App />);

import { sendMessageDirectly, insertText } from "@Utils/Messages";
import { copy, nop } from "@Utils";

function GifMenu(url) {
	const Menu = ContextMenu.buildMenu([
		{
			label: "Send Directly",
			action: () => sendMessageDirectly(url)
		},
		{
			label: "Insert Url",
			action: () => insertText(url)
		},
		{
			label: "Copy Url",
			action: () => copy(url)
		}
	]);

	return props => <Menu {...props} />;
}

const B = s(215016).exports.iR;
Plugin.on(Events.START, () => {
	Patcher.after(B.prototype, "render", ({ props }, args, ret) => {
		// console.log(props)
		if (!props.item?.url) return;
		ret.props.onContextMenu = e => {
			ContextMenu.open(e, GifMenu(props.item.url), {
				position: "bottom",
				align: "left"
			});
		};
	});
});

const D = s(593545).exports.Z;

function removeRange() {
	setTimeout(
		Patcher.before(window, "fetch", (_, args) => {
			delete args[1].headers.Range;
		})
	);
}

Plugin.on(Events.START, () => {

	Patcher.before(D, "type", (_, [{ fileSize }]) => {
		if (fileSize < 60e4) removeRange();
	});
	Patcher.after(D, "type", (_, args, ret) => {
		if (ret.props.bytesLeft) return ret;
		return [
			ret,
			<button
				key="copybutton"
				onClick={() => copy(ret.props.fileContents)}
				children="Copy"
			/>
		];
	});
});

Plugin.on(Events.STOP, () => {

	Patcher.unpatchAll();
});

module.exports = () => Plugin;
