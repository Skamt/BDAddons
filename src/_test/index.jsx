// import { Patcher } from "@Api";
import Plugin, { Events } from "@Utils/Plugin";
// import ErrorBoundary from "@Components/ErrorBoundary";
// import React, { useEffect, useRef, useState } from "@React";
// import { ModalActions, Modals } from "@Utils/Modals";
// import { ContextMenu } from "@Api";
// const { Item, Menu, Separator: MenuSeparator } = ContextMenu;

import FieldSet from "@Components/FieldSet";

// import Switch from "@Components/Switch";
import Divider from "@Components/Divider";
// import Slider from "@Modules/Slider";
// import Collapsible from "@Components/Collapsible";

function App() {
	return (
		<div>
		<Collapsible title="a very long title, the longest kinda">
			<FieldSet
				label="Mine"
				description="Mine">
				<Slider
					label="label"
					description="description"
					markers={[5, 10, 15, 20, 25, 30]}
				/>
				<Divider
					gap={1}
					direction={Divider.HORIZONTAL}
				/>
				<Switch
					checked={true}
					label="label"
				/>
				<Switch
					checked={true}
					label="label"
				/>
				<Switch
					checked={true}
					label="label"
				/>
				<Switch
					checked={true}
					label="label"
				/>
			</FieldSet>
		</Collapsible>
	<Collapsible title="a long title">
			<FieldSet
				label="Mine"
				description="Mine">
				<Slider
					label="label"
					description="description"
					markers={[5, 10, 15, 20, 25, 30]}
				/>
				<Divider
					gap={1}
					direction={Divider.HORIZONTAL}
				/>
				<Switch
					checked={true}
					label="label"
				/>
				<Switch
					checked={true}
					label="label"
				/>
				<Switch
					checked={true}
					label="label"
				/>
				<Switch
					checked={true}
					label="label"
				/>
			</FieldSet>
		</Collapsible>
	<Collapsible title="tiny title">
			<FieldSet
				label="Mine"
				description="Mine">
				<Slider
					label="label"
					description="description"
					markers={[5, 10, 15, 20, 25, 30]}
				/>
				<Divider
					gap={1}
					direction={Divider.HORIZONTAL}
				/>
				<Switch
					checked={true}
					label="label"
				/>
				<Switch
					checked={true}
					label="label"
				/>
				<Switch
					checked={true}
					label="label"
				/>
				<Switch
					checked={true}
					label="label"
				/>
			</FieldSet>
		</Collapsible>
	</div>
	);
}

// window.modalid && ModalActions.closeModal(window.modalid);

// window.modalid = BdApi.UI.showConfirmationModal("", <App />);

// Plugin.on(Events.START, () => {
	// window.addEventListener("keyup", onKeyUp);
// });

// Plugin.on(Events.STOP, () => {
	// window.removeEventListener("keyup", onKeyUp);
// });

module.exports = () => Plugin;
