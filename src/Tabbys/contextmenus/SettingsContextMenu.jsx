import { ContextMenu } from "@Api";
import React from "@React";
import { CloseIcon, PenIcon, PlusIcon } from "@Components/Icon";
import { openValueModal } from "@/components/ValueModal";
import Store from "@/Store";
import { createContextMenuItem } from "./helper";
import Settings from "@Utils/Settings";

const { Menu } = ContextMenu;

function buildToggle({ key, label, color }) {
	return ContextMenu.buildItem({
		type: "toggle",
		label: label,
		color,
		active: Settings.state[key],
		action: () => Settings.state[`set${key}`](!Settings.state[key])
	});
}

export default function () {
	return (
		<Menu>
			{[
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
						key: "showDMNames",
						label: "Show DM name"
					},
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
