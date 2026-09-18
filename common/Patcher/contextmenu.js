import { ContextMenu } from "@Api";
import Plugin from "@common/Plugin";

let patches = [];
Plugin.onStop(() => {
	patches.filter(Boolean).forEach((a) => a());
	patches = [];
});

export default (id, callback) => {
	const undo = ContextMenu.patch(id, callback);
	patches.push(undo);
};
