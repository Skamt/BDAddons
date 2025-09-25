import { ContextMenu } from "@Api";
import React from "@React";
import { CloseIcon, PenIcon, PlusIcon } from "@Components/Icon";
import { openValueModal } from "@/components/ValueModal";
import Store from "@/Store";
import { createContextMenuItem } from "./helper";
import Settings from "@Utils/Settings";

const { Menu } = ContextMenu;
import Slider from "@Modules/Slider";

function buildToggle({ key, label, color }) {
	return ContextMenu.buildItem({
		type: "toggle",
		label: label,
		color,
		active: Settings.state[key],
		action: () => Settings.state[`set${key}`](!Settings.state[key])
	});
}

const sizes = [24, 28, 32];

function SizeSlider() {
	const [val, set] = Settings.useSetting("size");
	return (
		<div style={{padding:"0 8px"}}>
			<Slider
				mini={true}
				stickToMarkers={true}
				sortedMarkers={true}
				equidistant={true}
				markers={sizes}
				minValue={sizes[0]}
				maxValue={sizes[sizes.length - 1]}
				initialValue={val}
				// onValueChange={console.log}
				onValueChange={set}
			/>
		</div>
	);
}

export default function () {
	return (
		<Menu>
			{[
				ContextMenu.buildItem({
					type: "control",
					id: "tabSize",
					label: "Size",
					control: () => {
						return <SizeSlider />;
					}
				}),
				ContextMenu.buildItem({ type: "separator" }),
				...[
					{
						key: "showTabbar",
						label: "Show Tabbar"
					},
					{
						key: "showBookmarkbar",
						label: "Show Bookmarks"
					},
					{
						key: "showSettingsButton",
						label: "Show Settings button",
						color: "danger"
					}
				].map(buildToggle),
				ContextMenu.buildItem({ type: "separator" }),
				...[
					
					{
						key: "showPings",
						label: "Show Pings"
					},
					{
						key: "showUnreads",
						label: "Show Unreads"
					},
					{
						key: "showTyping",
						label: "Show Typing"
					},
					{
						key: "privacyMode",
						label: "Privacy Mode"
					}
				].map(buildToggle)
			]}
		</Menu>
	);
}
