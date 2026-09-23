import { ContextMenu } from "@Api";
import Plugin from "@common/Plugin";

let contextmenuUnPatches = [];
Plugin.onStop(() => {
	contextmenuUnPatches.filter(Boolean).forEach(a => a());
	contextmenuUnPatches = [];
});

export const patch = (id, callback) => {
	const undo = ContextMenu.patch(id, callback);
	contextmenuUnPatches.push(undo);
};

export const patchMultiple = (navIds, callback) => {
	for (let i = 0; i < navIds.length; i++) {
		patch(navIds[i], callback);
	}
};

export default ContextMenu;