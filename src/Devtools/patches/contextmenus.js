import { findInTree } from "@Api";
import React from "@React";
import Settings from "@Utils/Settings";
import { copy } from "@Utils";
import Plugin from "@common/Plugin";

import { patch } from "@common/Patcher/contextmenu";

Plugin.onStart(() => {
	patch("*", ret => {
		// if (!Settings.state.showContextmenuNavId) return;
		const target = findInTree(ret, a => a.navId, { walkable: ["children", "props"] });
		if (!target) return console.error("ContextmenusNavId", ret);

		const MenuItem = BdApi.ContextMenu.buildItem({
			label: target.navId,
			action() {
				copy(target.navId);
			}
		});

		if (Array.isArray(target.children)) target.children.push(MenuItem);
		else target.children = [target.children, MenuItem];
	});
});
