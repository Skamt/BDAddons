// import config from "@Config";
// import { ContextMenu } from "@Api";
// import Settings from "@Utils/Settings";
// // import { MenuLabel } from "@Components/ContextMenu";
// import Store from "@/Store";
// import React from "@React";
// import { ChannelTypeEnum } from "@Discord/Enums";
// import { getPathName } from "@Utils";
// import { BookmarkOutlinedIcon, PlusIcon } from "@Components/Icon";
// import ChannelStore from "@Stores/ChannelStore";

// import Plugin, { Events } from "@Utils/Plugin";

// Plugin.on(Events.START, () => {
// 	const unpatch = [
// 		ContextMenu.patch("guild-context", (retVal, { guild }) => {
// 			if (!guild) return;

// 			retVal.props.children.splice(
// 				1,
// 				0,
// 				ContextMenu.buildItem({
// 					label: "Pin Roles",
// 					action: () => {}
// 				})
// 			);
// 		})
// 	];

// 	Plugin.once(Events.STOP, () => {
// 		unpatch.forEach(a => a && typeof a === "function" && a());
// 	});
// });
